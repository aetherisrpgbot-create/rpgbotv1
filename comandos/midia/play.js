const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");

// ═══════════════════════════════════════════
//          🎵 SISTEMA DE MÚSICA 🎵
// ═══════════════════════════════════════════

const musicQueue = [];
let isProcessingMusic = false;
const userCooldown = new Map();
const userLimits = new Map();
const LIMITE_DIARIO = 10;
const COOLDOWN_MS = 15000;
const TEMP_DIR = './temp';

// ═══════════════════════════════════════════
//            PROCESSAR FILA
// ═══════════════════════════════════════════

async function processMusicQueue(sock) {
    if (isProcessingMusic || musicQueue.length === 0) return;
    isProcessingMusic = true;

    const { remoteJid, query } = musicQueue.shift();

    if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const audioPath = `${TEMP_DIR}/${fileName}.mp3`;

    // Usa execFile com argumentos separados (previne command injection)
    const ytArgs = [
        '-f', 'bestaudio',
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '2',
        '--write-thumbnail',
        '--convert-thumbnails', 'jpg',
        '--write-info-json',
        '--no-playlist',
        '--max-filesize', '50M',
        '-o', audioPath,
        `ytsearch1:${query}`
    ];

    console.log(`🎵 Baixando: ${query}`);

    execFile('yt-dlp', ytArgs, { timeout: 60000 }, async (error) => {
        if (error || !fs.existsSync(audioPath)) {
            // Tenta novamente sem thumbnail
            const ytArgs2 = [
                '-f', 'bestaudio',
                '--extract-audio',
                '--audio-format', 'mp3',
                '--audio-quality', '2',
                '--no-playlist',
                '--max-filesize', '50M',
                '-o', audioPath,
                `ytsearch1:${query}`
            ];

            execFile('yt-dlp', ytArgs2, { timeout: 60000 }, async (err2) => {
                if (err2 || !fs.existsSync(audioPath)) {
                    await sock.sendMessage(remoteJid, {
                        text: `╔══════════════════════╗\n` +
                              `║   ❌ *MÚSICA NÃO ENCONTRADA*\n` +
                              `╚══════════════════════╝\n\n` +
                              `🔍 Não encontrei resultados para:\n` +
                              `    _"${query}"_\n\n` +
                              `💡 *Dicas:*\n` +
                              `  • Tente com o nome do artista\n` +
                              `  • Verifique a ortografia\n` +
                              `  • Use: !play artista - música`
                    });
                    isProcessingMusic = false;
                    processMusicQueue(sock);
                    return;
                }
                await enviarAudio(sock, remoteJid, audioPath, null, query);
            });
            return;
        }

        // Lê informações do vídeo
        let info = null;
        const infoFile = `${TEMP_DIR}/${fileName}.info.json`;
        if (fs.existsSync(infoFile)) {
            try {
                info = JSON.parse(fs.readFileSync(infoFile, 'utf8'));
                fs.unlinkSync(infoFile);
            } catch (e) {}
        }

        await enviarAudio(sock, remoteJid, audioPath, info, query);
    });
}

// ═══════════════════════════════════════════
//             ENVIAR ÁUDIO
// ═══════════════════════════════════════════

async function enviarAudio(sock, remoteJid, audioPath, info, query) {
    try {
        const titulo = info?.title || query || path.basename(audioPath, '.mp3');
        const canal = info?.channel || info?.uploader || 'YouTube';
        const url = info?.webpage_url || '';
        const duracao = info?.duration ? formatDuration(info.duration) : '??:??';

        // Procura thumbnail
        let thumbBuffer = null;
        const baseName = path.basename(audioPath, '.mp3');
        const files = fs.readdirSync(TEMP_DIR);
        const thumbFiles = files.filter(f =>
            f.startsWith(baseName) &&
            (f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp'))
        );

        if (thumbFiles.length > 0) {
            const thumbPath = path.join(TEMP_DIR, thumbFiles[0]);
            thumbBuffer = fs.readFileSync(thumbPath);
            fs.unlinkSync(thumbPath);
        }

        // ═══ MENSAGEM BONITA COM CARD ═══
        const msgTexto =
            `┏━━━━━━━━━━━━━━━━━━━━━┓\n` +
            `┃   🎶 *NOW PLAYING*          \n` +
            `┗━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
            `🎵 *${titulo}*\n\n` +
            `┌─────────────────────\n` +
            `│ 🎤 Artista: ${canal}\n` +
            `│ ⏱️ Duração: ${duracao}\n` +
            `│ 📀 Qualidade: Alta (MP3)\n` +
            `└─────────────────────\n\n` +
            `${url ? `🔗 ${url}\n\n` : ''}` +
            `▶️▶️▶️▶️▶️▶️▶️▶️▶️▶️▶️\n` +
            `_Enviando áudio..._`;

        if (thumbBuffer && url) {
            await sock.sendMessage(remoteJid, {
                text: msgTexto,
                contextInfo: {
                    externalAdReply: {
                        title: `🎵 ${titulo}`,
                        body: `${canal} • ${duracao}`,
                        thumbnail: thumbBuffer,
                        mediaType: 1,
                        mediaUrl: url,
                        sourceUrl: url
                    }
                }
            });
        } else {
            await sock.sendMessage(remoteJid, { text: msgTexto });
        }

        // Envia o áudio
        await sock.sendMessage(remoteJid, {
            audio: { url: audioPath },
            mimetype: 'audio/mp4',
            fileName: `${titulo}.mp3`
        });

        // Limpa arquivo
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);

    } catch (err) {
        console.error("❌ ERRO enviarAudio:", err);
        await sock.sendMessage(remoteJid, {
            text: `┏━━━━━━━━━━━━━━━━━━━━━┓\n` +
                  `┃   ⚠️ *ERRO AO ENVIAR*       \n` +
                  `┗━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                  `Ocorreu um erro ao enviar a música.\n` +
                  `Tente novamente em alguns segundos!`
        });
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    }

    isProcessingMusic = false;
    processMusicQueue(sock);
}

// ═══════════════════════════════════════════
//           FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════

function formatDuration(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

function sanitizeQuery(query) {
    // Remove caracteres potencialmente perigosos
    return query.replace(/[`$\\]/g, '').slice(0, 200);
}

// ═══════════════════════════════════════════
//          LIMPEZA AUTOMÁTICA
// ═══════════════════════════════════════════

setInterval(() => {
    if (fs.existsSync(TEMP_DIR)) {
        const files = fs.readdirSync(TEMP_DIR);
        const now = Date.now();
        files.forEach(file => {
            const filePath = path.join(TEMP_DIR, file);
            try {
                const stats = fs.statSync(filePath);
                if (now - stats.mtimeMs > 1800000) {
                    fs.unlinkSync(filePath);
                }
            } catch (e) {}
        });
    }
}, 3600000);

// ═══════════════════════════════════════════
//           COMANDO !play
// ═══════════════════════════════════════════

module.exports = {
    nome: "play",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const queryRaw = args.join(' ');

        // ═══ SEM ARGUMENTO ═══
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
                      `  !play Imagine Dragons Enemy\n\n` +
                      `┌─────────────────────\n` +
                      `│ 📊 Limite: ${LIMITE_DIARIO} músicas/dia\n` +
                      `│ ⏳ Cooldown: ${COOLDOWN_MS / 1000}s entre pedidos\n` +
                      `│ 📀 Formato: MP3 alta qualidade\n` +
                      `└─────────────────────`
            });
        }

        // ═══ COOLDOWN ═══
        if (userCooldown.has(remetenteId)) {
            const diff = Date.now() - userCooldown.get(remetenteId);
            if (diff < COOLDOWN_MS) {
                const restante = Math.ceil((COOLDOWN_MS - diff) / 1000);
                return sock.sendMessage(remoteJid, {
                    text: `⏳ *Aguarde ${restante}s* para pedir outra música.`
                });
            }
        }
        userCooldown.set(remetenteId, Date.now());

        // ═══ LIMITE DIÁRIO ═══
        const hoje = new Date().toDateString();
        if (!userLimits.has(remetenteId)) {
            userLimits.set(remetenteId, { data: hoje, count: 0 });
        }
        const userData = userLimits.get(remetenteId);
        if (userData.data !== hoje) {
            userData.data = hoje;
            userData.count = 0;
        }
        if (userData.count >= LIMITE_DIARIO) {
            return sock.sendMessage(remoteJid, {
                text: `┏━━━━━━━━━━━━━━━━━━━━━┓\n` +
                      `┃   🚫 *LIMITE ATINGIDO*       \n` +
                      `┗━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                      `Você já usou suas *${LIMITE_DIARIO} músicas* hoje.\n\n` +
                      `🕐 O limite reseta à meia-noite.\n` +
                      `Volte amanhã! 🎶`
            });
        }
        userData.count++;

        // ═══ SANITIZA E ADICIONA À FILA ═══
        const query = sanitizeQuery(queryRaw);
        const position = musicQueue.length + 1;
        musicQueue.push({ remoteJid, query });

        const filaTexto = position === 1
            ? `⚡ Processando agora...`
            : `📍 Posição na fila: *${position}º*`;

        await sock.sendMessage(remoteJid, {
            text: `┏━━━━━━━━━━━━━━━━━━━━━┓\n` +
                  `┃   🔎 *BUSCANDO MÚSICA*       \n` +
                  `┗━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                  `🎵 _"${query}"_\n\n` +
                  `${filaTexto}\n` +
                  `📊 Uso hoje: ${userData.count}/${LIMITE_DIARIO}`
        });

        if (!isProcessingMusic) {
            processMusicQueue(sock);
        }
    }
};
