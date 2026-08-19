// !gif - TRANSFORMA FIGURINHA DE VÍDEO EM GIF ANIMADO
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { exec } = require("child_process");

module.exports = {
    nome: "gif",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
            const quoted = contextInfo?.quotedMessage;

            if (!quoted || !quoted.stickerMessage) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Responda uma *FIGURINHA DE VÍDEO* com !gif\n\n📌 Exemplo: !gif (respondendo uma figurinha animada)'
                });
            }

            await sock.sendMessage(remoteJid, {
                text: '⏳ Convertendo figurinha de vídeo para GIF...'
            });

            const stickerMsg = {
                key: {
                    remoteJid,
                    id: contextInfo.stanzaId,
                    fromMe: false,
                    participant: contextInfo.participant
                },
                message: quoted
            };

            const media = await downloadMediaMessage(
                stickerMsg,
                'buffer',
                {},
                {
                    logger: console,
                    reuploadRequest: sock.updateMediaMessage
                }
            );

            if (!media || media.length < 100) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Não consegui baixar a figurinha.'
                });
            }

            // 🔥 DETECTA SE É WEBP ANIMADO
            const hex = media.toString('hex', 0, 100);
            const isAnimated = hex.includes('414e494d'); // 'ANIM'
            const isWebP = hex.startsWith('52494646') && hex.includes('57454250');

            if (!isWebP || !isAnimated) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Isso não é uma figurinha de vídeo (animada)!\n\nResponda uma figurinha animada com !gif'
                });
            }

            const tempDir = os.tmpdir();
            const inputPath = path.join(tempDir, `sticker_${Date.now()}.webp`);
            const outputPath = path.join(tempDir, `sticker_${Date.now()}.gif`);

            fs.writeFileSync(inputPath, media);

            // 🔥 CONVERTE WEBP ANIMADO PARA GIF
            const cmd = `ffmpeg -y -i "${inputPath}" -vf "fps=15,scale=512:512:flags=lanczos" -loop 0 "${outputPath}" 2>/dev/null`;

            console.log('📝 FFmpeg:', cmd);

            await new Promise((resolve, reject) => {
                exec(cmd, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            if (!fs.existsSync(outputPath)) {
                // Fallback: tenta com configurações diferentes
                const cmdFallback = `ffmpeg -y -i "${inputPath}" -vf "scale=512:512:flags=lanczos" -loop 0 "${outputPath}" 2>/dev/null`;
                await new Promise((resolve, reject) => {
                    exec(cmdFallback, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            }

            if (!fs.existsSync(outputPath)) {
                throw new Error("GIF não gerado");
            }

            const gifBuffer = fs.readFileSync(outputPath);

            // 🔥 LIMPA
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

            // 🔥 ENVIA O GIF
            await sock.sendMessage(remoteJid, {
                video: gifBuffer,
                caption: '🎬 *Figurinha de vídeo convertida em GIF!*',
                gifPlayback: true
            });

        } catch (err) {
            console.log("❌ ERRO gif:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao converter figurinha para GIF.\n\n${err.message?.substring(0, 80) || ''}`
            });
        }
    }
};
