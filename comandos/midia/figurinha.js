// !figurinha - Cria figurinha de imagem ou vídeo
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { bufferToSticker } = require("../../utils/helpers");
const pino = require("pino");

module.exports = {
    nome: "figurinha",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            // ===== DETECTA SE É IMAGEM OU VÍDEO =====
            const isVideo = !!msg.message?.videoMessage || !!quoted?.videoMessage;
            const media = msg.message?.imageMessage || msg.message?.videoMessage ||
                         quoted?.imageMessage || quoted?.videoMessage;

            if (!media) {
                return sock.sendMessage(remoteJid, {
                    text: "📌 Envie ou responda uma imagem ou vídeo com !figurinha"
                });
            }

            // ===== BAIXA A MÍDIA =====
            const buffer = await downloadMediaMessage(
                { key: msg.key, message: quoted || msg.message },
                "buffer",
                {},
                { logger: pino() }
            );

            if (!buffer) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Não consegui baixar a mídia."
                });
            }

            // ===== CONVERTE PARA FIGURINHA =====
            const sticker = await bufferToSticker(buffer, isVideo);
            await sock.sendMessage(remoteJid, { sticker });

        } catch (err) {
            console.log("❌ Erro figurinha:", err);
            await sock.sendMessage(remoteJid, {
                text: "❌ Erro ao criar figurinha."
            });
        }
    }
};
