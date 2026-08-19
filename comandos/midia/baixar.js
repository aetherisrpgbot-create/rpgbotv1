// comandos/midia/baixar.js - VERSÃO COMPLETA ATUALIZADA
const fs = require("fs");
const path = require("path");
const os = require("os");
const { exec } = require("child_process");
const axios = require("axios");

// ============================================================
// 🔥 CONFIGURAÇÕES
// ============================================================

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const COOKIES_FILE = path.join(__dirname, '../../cookies.txt');

// ============================================================
// 🔥 NORMALIZAÇÃO
// ============================================================

function normalizarTexto(texto) {
    return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function detectarModo(texto) {
    const normalizado = normalizarTexto(texto);
    const modos = { 'video': 'video', 'audio': 'audio', 'gif': 'gif', 'imagem': 'imagem' };
    if (modos[normalizado]) return modos[normalizado];
    for (const [key, value] of Object.entries(modos)) {
        if (normalizado.includes(key)) return value;
    }
    return null;
}

module.exports = {
    nome: "baixar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            if (args.length === 0) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Use: !baixar <modo> <link ou nome>

📌 *MODOS:*
!baixar video https://youtu.be/...
!baixar video gato fofo      ← Busca no YouTube
!baixar audio Imagine Dragons ← Busca e baixa MP3
!baixar gif fogos            ← Busca GIF animado
!baixar imagem https://i.imgur.com/foto.jpg  ← SÓ LINK!

📌 *EXEMPLOS:*
!baixar video Minecraft gameplay
!baixar audio música relaxante
!baixar gif gato dançando
!baixar imagem https://i.imgur.com/abc.jpg

📌 *ATENÇÃO:*
• Vídeo, áudio e gif: ACEITAM BUSCA POR NOME
• Imagem: SÓ LINKS
• Instagram: NÃO SUPORTADO
• Google Drive: NÃO SUPORTADO`
                });
            }

            let modo = detectarModo(args[0]);
            let query = args.slice(1).join(" ").trim();

            if (!query) {
                query = args[0];
                modo = detectarTipoPorLink(query);
                if (!modo) {
                    return sock.sendMessage(remoteJid, {
                        text: `❌ Não foi possível detectar o tipo.\nUse: !baixar video <link>`
                    });
                }
            }

            const isUrl = query.startsWith('http://') || query.startsWith('https://');

            // 🔥 IMAGEM SÓ LINK
            if (modo === 'imagem' && !isUrl) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ *Imagem só funciona com LINK!*

📌 *EXEMPLOS:*
!baixar imagem https://i.imgur.com/foto.jpg
!baixar imagem https://example.com/imagem.png`
                });
            }

            // 🔥 BLOQUEIA INSTAGRAM
            if (query.includes('instagram.com')) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ *Instagram não é suportado.*

📌 Motivo: Bloqueia downloads sem autenticação.
📌 Alternativa: YouTube, TikTok, Twitter ou links diretos.`
                });
            }

            // 🔥 BLOQUEIA GOOGLE DRIVE
            if (query.includes('share.google') || query.includes('drive.google.com')) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ *Google Drive não é suportado.*

📌 Motivo: Bloqueia downloads diretos.
📌 Alternativa: Baixe o arquivo manualmente e envie.`
                });
            }

            const tiposValidos = ['video', 'imagem', 'audio', 'gif'];
            if (!tiposValidos.includes(modo)) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Modo inválido: "${args[0]}"\n\nModos: video, audio, gif, imagem`
                });
            }

            await sock.sendMessage(remoteJid, {
                text: `📥 *Baixando ${modo}...*\n🔍 "${query}"\n⏳ Isso pode levar alguns segundos.`
            });

            const tempDir = os.tmpdir();
            const tempFile = path.join(tempDir, `download_${Date.now()}`);

            const resultado = await baixarComModo(query, modo, tempFile);

            if (!resultado || !resultado.buffer || resultado.buffer.length < 100) {
                throw new Error(`Não foi possível baixar o ${modo}`);
            }

            const tamanhoMB = Math.round(resultado.buffer.length / (1024 * 1024));
            if (tamanhoMB > 50) {
                return sock.sendMessage(remoteJid, {
                    text: `⚠️ *Arquivo muito grande!* (${tamanhoMB}MB)\n\nWhatsApp limite: 50MB.`
                });
            }

            const captions = {
                video: `🎬 *Vídeo baixado!*\n📦 ${tamanhoMB}MB`,
                imagem: `🖼️ *Imagem baixada!*\n📦 ${tamanhoMB}MB`,
                audio: `🎵 *Áudio baixado!*\n📦 ${tamanhoMB}MB`,
                gif: `🎬 *GIF baixado!*\n📦 ${tamanhoMB}MB`
            };

            const plataforma = detectarPlataforma(query);
            const plataformaEmoji = {
                youtube: '▶️', tiktok: '🎵', twitter: '🐦',
                facebook: '👍', soundcloud: '☁️', desconhecida: '🌐'
            };

            const legenda = `${captions[modo]}\n📱 ${plataformaEmoji[plataforma] || '🌐'} ${plataforma || 'Desconhecida'}`;

            if (modo === 'video' || modo === 'gif') {
                const sendOptions = { video: resultado.buffer, caption: legenda };
                if (modo === 'gif') sendOptions.gifPlayback = true;
                await sock.sendMessage(remoteJid, sendOptions);
            } else if (modo === 'imagem') {
                await sock.sendMessage(remoteJid, { image: resultado.buffer, caption: legenda });
            } else if (modo === 'audio') {
                await sock.sendMessage(remoteJid, {
                    audio: resultado.buffer,
                    mimetype: 'audio/mpeg',
                    fileName: `audio_${Date.now()}.mp3`
                });
            }

        } catch (err) {
            console.log("❌ ERRO baixar:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao baixar.\n\n${err.message?.substring(0, 100) || 'Tente novamente.'}`
            });
        }
    }
};

// ============================================================
// 🔍 DETECÇÕES
// ============================================================

function detectarTipoPorLink(link) {
    const lower = link.toLowerCase();
    if (lower.match(/\.(mp4|mkv|webm|mov)$/i)) return 'video';
    if (lower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)) return 'imagem';
    if (lower.match(/\.(mp3|wav|flac|aac|ogg|m4a)$/i)) return 'audio';
    if (lower.includes('youtube.com') || lower.includes('youtu.be') || lower.includes('tiktok.com')) return 'video';
    if (lower.includes('soundcloud.com')) return 'audio';
    if (lower.includes('tenor.com') || lower.includes('giphy.com')) return 'gif';
    return null;
}

function detectarPlataforma(url) {
    const lower = url.toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
    if (lower.includes('tiktok.com')) return 'tiktok';
    if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
    if (lower.includes('facebook.com')) return 'facebook';
    if (lower.includes('soundcloud.com')) return 'soundcloud';
    if (lower.includes('tenor.com') || lower.includes('giphy.com')) return 'gif';
    return 'desconhecida';
}

// ============================================================
// 📥 BAIXAR POR MODO
// ============================================================

async function baixarComModo(query, modo, tempFile) {
    const isUrl = query.startsWith('http://') || query.startsWith('https://');
    let metodos = [];

    if (modo === 'video') {
        metodos.push(() => baixarComYtDlp(query, tempFile, 'video'));
        if (!isUrl) metodos.push(() => baixarComYtDlp(`ytsearch1:${query}`, tempFile, 'video'));
        metodos.push(() => baixarComAxios(query, tempFile, 'video'));
    }

    if (modo === 'audio') {
        metodos.push(() => baixarComYtDlp(query, tempFile, 'audio'));
        if (!isUrl) metodos.push(() => baixarComYtDlp(`ytsearch1:${query}`, tempFile, 'audio'));
    }

    if (modo === 'gif') {
        metodos.push(() => baixarComYtDlp(query, tempFile, 'gif'));
        if (!isUrl) metodos.push(() => baixarComYtDlp(`ytsearch1:${query}`, tempFile, 'gif'));
        metodos.push(() => baixarGifTenor(query, tempFile));
    }

    if (modo === 'imagem') {
        metodos.push(() => baixarComYtDlp(query, tempFile, 'imagem'));
        metodos.push(() => baixarComAxios(query, tempFile, 'imagem'));
    }

    metodos.push(() => baixarComWget(query, tempFile));

    let ultimoErro = null;
    for (const metodo of metodos) {
        try {
            const resultado = await metodo();
            if (resultado && resultado.buffer && resultado.buffer.length > 100) {
                return resultado;
            }
        } catch (err) {
            console.log(`⚠️ Falhou: ${err.message}`);
            ultimoErro = err;
        }
    }

    throw new Error(`Todos os métodos falharam: ${ultimoErro?.message || 'desconhecido'}`);
}

// ============================================================
// 📥 1. YT-DLP (ATUALIZADO COM PARÂMETROS QUE FUNCIONAM)
// ============================================================

async function baixarComYtDlp(query, tempFile, modo) {
    let format = 'best';
    let outputExt = '.%(ext)s';
    let extraArgs = '';

    if (modo === 'video') {
        format = 'best[ext=mp4]/best';
    } else if (modo === 'audio') {
        format = 'bestaudio';
        outputExt = '.mp3';
        extraArgs = '-x --audio-format mp3 --audio-quality 0';
    } else if (modo === 'imagem') {
        format = 'best[ext=jpg]/best[ext=png]/best';
    } else if (modo === 'gif') {
        format = 'best[ext=gif]/best';
    }

    const outputPath = `${tempFile}${outputExt}`;

    // 🔥 PARÂMETROS QUE FUNCIONAM (cookies + android)
    const cmd = `yt-dlp --cookies "${COOKIES_FILE}" --extractor-args "youtube:player_client=android" --user-agent "${USER_AGENT}" -f "${format}" ${extraArgs} -o "${outputPath}" "${query}" 2>/dev/null`;

    console.log(`📝 yt-dlp: ${cmd}`);
    await new Promise((resolve, reject) => {
        exec(cmd, { maxBuffer: 1024 * 1024 * 50 }, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    const dir = path.dirname(tempFile);
    const base = path.basename(tempFile);
    const files = fs.readdirSync(dir);

    for (const file of files) {
        if (file.startsWith(base)) {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).size > 100) {
                const buffer = fs.readFileSync(filePath);
                fs.unlinkSync(filePath);
                const ext = path.extname(file).toLowerCase().replace('.', '');
                return { buffer, tipo: modo, ext, plataforma: 'yt-dlp' };
            }
        }
    }

    throw new Error('Arquivo não encontrado');
}

// ============================================================
// 📥 2. AXIOS
// ============================================================

async function baixarComAxios(url, tempFile, modo) {
    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
            'User-Agent': USER_AGENT
        }
    });

    const buffer = Buffer.from(response.data);
    if (buffer.length < 100) throw new Error('Arquivo muito pequeno');

    const ext = modo === 'video' ? 'mp4' : 
                 modo === 'audio' ? 'mp3' : 
                 modo === 'gif' ? 'gif' : 'jpg';

    return { buffer, tipo: modo, ext, plataforma: 'axios' };
}

// ============================================================
// 📥 3. TENOR (GIF)
// ============================================================

async function baixarGifTenor(query, tempFile) {
    const outputPath = `${tempFile}.gif`;

    // 🔥 TENOR TAMBÉM PRECISA DOS PARÂMETROS
    const cmd = `yt-dlp --cookies "${COOKIES_FILE}" --extractor-args "youtube:player_client=android" --user-agent "${USER_AGENT}" -f "best[ext=gif]/best" -o "${outputPath}" "tenor:${query}" 2>/dev/null`;

    console.log(`📝 Tenor: ${cmd}`);
    await new Promise((resolve, reject) => {
        exec(cmd, { maxBuffer: 1024 * 1024 * 50 }, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size < 100) {
        throw new Error('GIF não encontrado no Tenor');
    }

    const buffer = fs.readFileSync(outputPath);
    fs.unlinkSync(outputPath);

    return { buffer, tipo: 'gif', ext: 'gif', plataforma: 'tenor' };
}

// ============================================================
// 📥 4. WGET (FALLBACK)
// ============================================================

async function baixarComWget(query, tempFile) {
    const outputPath = `${tempFile}.tmp`;
    const cmd = `wget -q -O "${outputPath}" "${query}" 2>/dev/null || curl -s -o "${outputPath}" "${query}" 2>/dev/null`;

    console.log(`📝 wget: ${cmd}`);
    await new Promise((resolve, reject) => {
        exec(cmd, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size < 100) {
        throw new Error('Download falhou');
    }

    const buffer = fs.readFileSync(outputPath);
    fs.unlinkSync(outputPath);

    return { buffer, tipo: 'desconhecido', ext: 'bin', plataforma: 'wget' };
}
