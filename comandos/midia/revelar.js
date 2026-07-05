// !revelar - Revela mídia de visualização única
module.exports = {
    nome: "revelar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { downloadMediaMessage } = require("@whiskeysockets/baileys");
        const { isAdmin } = require("../../utils/permissoes");

        try {
            const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
            const isGroup = remoteJid?.endsWith('@g.us');
            
            if (!isGroup) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Este comando é apenas para grupos."
                });
            }
            
            if (!(await isAdmin(sock, remoteJid, remetenteId))) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Apenas administradores podem usar esse comando."
                });
            }

            const quoted = contextInfo?.quotedMessage;
            if (!quoted) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Responda uma mídia de visualização única."
                });
            }

            const mediaType = quoted.imageMessage ? "image" : quoted.videoMessage ? "video" : null;
            if (!mediaType) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Isso não é uma foto ou vídeo de visualização única."
                });
            }

            const mediaMsg = {
                key: {
                    remoteJid,
                    id: contextInfo.stanzaId,
                    fromMe: false,
                    participant: contextInfo.participant
                },
                message: quoted
            };

            const media = await downloadMediaMessage(
                mediaMsg,
                "buffer",
                {},
                {
                    logger: console,
                    reuploadRequest: sock.updateMediaMessage
                }
            );

            if (!media) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Não consegui baixar a mídia."
                });
            }

            if (mediaType === "image") {
                await sock.sendMessage(remoteJid, {
                    image: media,
                    caption: "👁️ Foto de visualização única revelada."
                });
            } else {
                await sock.sendMessage(remoteJid, {
                    video: media,
                    caption: "👁️ Vídeo de visualização única revelado."
                });
            }

        } catch (err) {
            console.log("ERRO revelar:", err);
            await sock.sendMessage(remoteJid, { 
                text: "❌ Erro ao revelar mídia." 
            });
        }
    }
};
