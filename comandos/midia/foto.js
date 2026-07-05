// !foto
module.exports = {
    nome: "foto",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { downloadMediaMessage } = require("@whiskeysockets/baileys");

        try {
            const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
            const quoted = contextInfo?.quotedMessage;

            if (!quoted || !quoted.stickerMessage) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Responda uma figurinha com !foto'
                });
            }

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

            if (!media) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Não consegui converter essa figurinha.'
                });
            }

            await sock.sendMessage(remoteJid, {
                image: media,
                caption: '📸 Figurinha convertida em imagem!'
            });

        } catch (err) {
            console.log("ERRO foto:", err);
            await sock.sendMessage(remoteJid, {
                text: '❌ Erro ao converter figurinha.'
            });
        }
    }
};
