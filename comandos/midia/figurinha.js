// !figurinha
module.exports = {
    nome: "figurinha",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { bufferToSticker } = require("../../utils/helpers");
        const { downloadMediaMessage } = require("@whiskeysockets/baileys");
        const pino = require("pino");

        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const media = msg.message?.imageMessage || msg.message?.videoMessage || 
                         quoted?.imageMessage || quoted?.videoMessage;

            if (!media) {
                return sock.sendMessage(remoteJid, {
                    text: "📌 Envie ou responda uma imagem ou vídeo com !figurinha"
                });
            }

            const isVideo = !!msg.message?.videoMessage || !!quoted?.videoMessage;

            const buffer = await downloadMediaMessage(
                { key: msg.key, message: quoted || msg.message },
                "buffer",
                {},
                { logger: pino() }
            );

            const sticker = await bufferToSticker(buffer, isVideo);
            await sock.sendMessage(remoteJid, { sticker });

        } catch (err) {
            console.log("Erro figurinha:", err);
            await sock.sendMessage(remoteJid, { text: "❌ Erro ao criar figurinha." });
        }
    }
};
