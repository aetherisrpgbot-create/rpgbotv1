// !foto - CONVERTE FIGURINHA EM IMAGEM
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { exec } = require("child_process");

module.exports = {
    nome: "foto",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
            const quoted = contextInfo?.quotedMessage;

            if (!quoted || !quoted.stickerMessage) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Responda uma *FIGURINHA* com !foto\n\n📌 Exemplo: !foto (respondendo uma figurinha)'
                });
            }

            await sock.sendMessage(remoteJid, {
                text: '⏳ Convertendo figurinha para imagem...'
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

            let imagemBuffer = media;

            // 🔥 SE FOR WEBP ANIMADO, EXTRAI O PRIMEIRO FRAME
            if (isWebP && isAnimated) {
                console.log('🎬 Figurinha animada detectada, extraindo primeiro frame...');
                const tempDir = os.tmpdir();
                const inputPath = path.join(tempDir, `sticker_${Date.now()}.webp`);
                const outputPath = path.join(tempDir, `sticker_${Date.now()}.png`);

                fs.writeFileSync(inputPath, media);

                const cmd = `ffmpeg -y -i "${inputPath}" -vf "select=eq(n\\,0)" -vframes 1 "${outputPath}" 2>/dev/null`;

                await new Promise((resolve) => {
                    exec(cmd, () => resolve());
                });

                if (fs.existsSync(outputPath)) {
                    imagemBuffer = fs.readFileSync(outputPath);
                    fs.unlinkSync(inputPath);
                    fs.unlinkSync(outputPath);
                } else {
                    // Fallback: tenta converter normal
                    const cmd2 = `ffmpeg -y -i "${inputPath}" -vf "scale=512:512:flags=lanczos" -vframes 1 "${outputPath}" 2>/dev/null`;
                    await new Promise((resolve) => {
                        exec(cmd2, () => resolve());
                    });
                    if (fs.existsSync(outputPath)) {
                        imagemBuffer = fs.readFileSync(outputPath);
                        fs.unlinkSync(inputPath);
                        fs.unlinkSync(outputPath);
                    }
                }
            }

            // 🔥 ENVIA A IMAGEM
            await sock.sendMessage(remoteJid, {
                image: imagemBuffer,
                caption: '📸 *Figurinha convertida em imagem!*'
            });

        } catch (err) {
            console.log("❌ ERRO foto:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao converter figurinha.\n\n${err.message?.substring(0, 80) || ''}`
            });
        }
    }
};
