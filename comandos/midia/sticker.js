// !sticker - CRIA FIGURINHA DE IMAGEM (RÁPIDO)
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { bufferToSticker } = require("../../utils/helpers");

module.exports = {
    nome: "sticker",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const imageMsg = quoted?.imageMessage || msg.message?.imageMessage;
            const videoMsg = quoted?.videoMessage || msg.message?.videoMessage;

            if (!imageMsg && !videoMsg) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Responda uma *IMAGEM* ou *VÍDEO* para criar a figurinha.\n\n📌 !sticker (respondendo uma mídia)"
                });
            }

            const isVideo = !!videoMsg;
            const buffer = await downloadMediaMessage(
                { message: quoted || msg.message },
                "buffer",
                {},
                { logger: console }
            );

            if (!buffer) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Não consegui baixar a mídia."
                });
            }

            const stickerBuffer = await bufferToSticker(buffer, isVideo);

            await sock.sendMessage(remoteJid, {
                sticker: stickerBuffer
            });

        } catch (err) {
            console.log("❌ ERRO sticker:", err);
            await sock.sendMessage(remoteJid, {
                text: "❌ Erro ao criar figurinha."
            });
        }
    }
};
