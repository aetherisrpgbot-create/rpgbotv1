// comandos/midia/play.js - VERSÃO DEFINITIVA
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

// ═══════════════════════════════════════════
//          CONFIGURAÇÕES
// ═══════════════════════════════════════════

const COOLDOWN_MS = 15000;
const TEMP_DIR = os.tmpdir();
const COOKIES_FILE = path.join(__dirname, '../../cookies.txt');

const musicQueue = [];
let isProcessingMusic = false;
const userCooldown = new Map();

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// ═══════════════════════════════════════════
//          PROCESSAR FILA
// ═══════════════════════════════════════════

async function processMusicQueue(sock) {
    if (isProcessingMusic || musicQueue.length === 0) return;
    isProcessingMusic = true;

    const { remoteJid, query } = musicQueue.shift();

    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const audioPath = `${TEMP_DIR}/${fileName}.mp3`;

    const isUrl = query.startsWith('http://') || query.startsWith('https://');

    let searchQuery = query;
    if (!isUrl) {
        searchQuery = `ytsearch1:${query}`;
    }

    // 🔥 COMANDO QUE FUNCIONOU
    const ytArgs = [
        "--cookies", COOKIES_FILE,
        "--extractor-args", "youtube:player_client=android",
        "--user-agent", USER_AGENT,
        "-f", "bestaudio",
        "-x",
        "--audio-format", "mp3",
        "--audio-quality", "0",
        "--no-playlist",
        "--max-filesize", "50M",
        "-o", audioPath,
        searchQuery,
    ];

    console.log(`🎵 Baixando: ${query}`);
    console.log(`📝 yt-dlp ${ytArgs.join(' ')}`);

    try {
        await new Promise((resolve, reject) => {
            execFile("yt-dlp", ytArgs, { timeout: 120000 }, (error) => {
                if (error) reject(error);
                else resolve();
            });
        });

        if (!fs.existsSync(audioPath) || fs.statSync(audioPath).size < 100) {
            throw new Error("Arquivo não encontrado");
        }

        await enviarAudio(sock, remoteJid, audioPath, query);

    } catch (err) {
        console.log(`⚠️ Falha: ${err.message}`);

        // 🔥 FALLBACK: Sem filtro
        try {
            const ytArgs2 = [
                "--cookies", COOKIES_FILE,
                "--extractor-args", "youtube:player_client=android",
                "--user-agent", USER_AGENT,
                "-x",
                "--audio-format", "mp3",
                "--no-playlist",
                "-o", audioPath,
                searchQuery,
            ];

            console.log(`📝 yt-dlp (fallback) ${ytArgs2.join(' ')}`);

            await new Promise((resolve, reject) => {
                execFile("yt-dlp", ytArgs2, { timeout: 120000 }, (error) => {
                    if (error) reject(error);
                    else resolve();
                });
            });

            if (!fs.existsSync(audioPath) || fs.statSync(audioPath).size < 100) {
                throw new Error("Arquivo não encontrado no fallback");
            }

            await enviarAudio(sock, remoteJid, audioPath, query);

        } catch (err2) {
            console.log(`⚠️ Fallback falhou: ${err2.message}`);

            await sock.sendMessage(remoteJid, {
                text: `┏━━━━━━━━━━━━━━━━━━━━━┓\n` +
                      `┃   ❌ *MÚSICA NÃO ENCONTRADA*\n` +
                      `┗━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                      `🔍 Não encontrei resultados para:\n` +
                      `    _"${query}"_\n\n` +
                      `💡 *Dicas:*\n` +
                      `  • Tente com o nome do artista\n` +
                      `  • Verifique a ortografia\n` +
                      `  • Use: !play artista - música\n` +
                      `  • Use um link do YouTube`,
            });
        }
    }

    isProcessingMusic = false;
    processMusicQueue(sock);
}

// ═══════════════════════════════════════════
//             ENVIAR ÁUDIO
// ═══════════════════════════════════════════

async function enviarAudio(sock, remoteJid, audioPath, query) {
    try {
        const stats = fs.statSync(audioPath);
        const tamanhoMB = Math.round(stats.size / (1024 * 1024));
        const audioBuffer = fs.readFileSync(audioPath);

        const msgTexto =
            `┏━━━━━━━━━━━━━━━━━━━━━┓\n` +
            `┃   🎶 *NOW PLAYING*          \n` +
            `┗━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
            `🎵 *${query}*\n\n` +
            `┌─────────────────────\n` +
            `│ 📀 Qualidade: MP3 320kbps\n` +
            `│ 📦 Tamanho: ${tamanhoMB}MB\n` +
            `└─────────────────────\n\n` +
            `▶️▶️▶️▶️▶️▶️▶️▶️▶️▶️▶️\n` +
            `📥 *Para baixar:* Toque no arquivo e salve!`;

        await sock.sendMessage(remoteJid, { text: msgTexto });

        await sock.sendMessage(remoteJid, {
            document: audioBuffer,
            mimetype: "audio/mpeg",
            fileName: `${query.substring(0, 50)}.mp3`,
            caption: `🎵 *${query}*\n📦 ${tamanhoMB}MB`,
        });

        try {
            await sock.sendMessage(remoteJid, {
                audio: audioBuffer,
                mimetype: "audio/mpeg",
                fileName: `${query.substring(0, 30)}.mp3`,
            });
        } catch (e) {
            console.log("⚠️ Não foi possível enviar como áudio.");
        }

        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);

    } catch (err) {
        console.error("❌ ERRO enviarAudio:", err);
        await sock.sendMessage(remoteJid, {
            text: `❌ Erro ao enviar música. Tente novamente.`,
        });
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    }
}

// ═══════════════════════════════════════════
//          LIMPEZA AUTOMÁTICA
// ═══════════════════════════════════════════

function limparTemp() {
    if (fs.existsSync(TEMP_DIR)) {
        const files = fs.readdirSync(TEMP_DIR);
        let count = 0;
        files.forEach((file) => {
            const filePath = path.join(TEMP_DIR, file);
            try {
                if (file.startsWith("audio_") && file.endsWith(".mp3")) {
                    fs.unlinkSync(filePath);
                    count++;
                }
            } catch (e) {}
        });
        if (count > 0) {
            console.log(`🧹 Limpeza: ${count} arquivos removidos.`);
        }
    }
}

setInterval(limparTemp, 1800000);
setTimeout(limparTemp, 5000);

// ═══════════════════════════════════════════
//           COMANDO !play
// ═══════════════════════════════════════════

module.exports = {
    nome: "play",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const queryRaw = args.join(" ");

        if (!queryRaw) {
            return sock.sendMessage(remoteJid, {
                text: `┏━━━━━━━━━━━━━━━━━━━━━┓\n` +
                      `┃   🎵 *PLAYER DE MÚSICA*     \n` +
                      `┗━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                      `📌 *Como usar:*\n` +
                      `  !play <nome da música>\n\n` +
                      `💡 *Exemplos:*\n` +
                      `  !play Billie Jean\n` +
                      `  !play MC Hariel - Lei da Vida\n` +
                      `  !play Imagine Dragons Enemy\n` +
                      `  !play https://youtu.be/dQw4w9WgXcQ\n\n` +
                      `┌─────────────────────\n` +
                      `│ ⏳ Cooldown: 15s\n` +
                      `│ 📀 Formato: MP3 320kbps\n` +
                      `│ 🎵 Fonte: YouTube\n` +
                      `└─────────────────────`,
            });
        }

        if (userCooldown.has(remetenteId)) {
            const diff = Date.now() - userCooldown.get(remetenteId);
            if (diff < COOLDOWN_MS) {
                const restante = Math.ceil((COOLDOWN_MS - diff) / 1000);
                return sock.sendMessage(remoteJid, {
                    text: `⏳ *Aguarde ${restante}s* para pedir outra música.`,
                });
            }
        }
        userCooldown.set(remetenteId, Date.now());

        const query = queryRaw.replace(/[`$\\]/g, "").slice(0, 200);
        const position = musicQueue.length + 1;
        musicQueue.push({ remoteJid, query });

        await sock.sendMessage(remoteJid, {
            text: `🎵 *Buscando:* "${query}"\n📍 Posição: ${position}º\n⏳ Processando...`,
        });

        if (!isProcessingMusic) {
            processMusicQueue(sock);
        }
    },
};
