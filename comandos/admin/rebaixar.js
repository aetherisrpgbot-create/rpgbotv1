// !rebaixar

const { isAdmin } = require("../../utils/permissoes");

module.exports = {
    nome: "rebaixar",

    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup) => {

        if (!isGroup) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Apenas em grupos."
            });
        }

        if (!(await isAdmin(sock, remoteJid, remetenteId))) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Apenas administradores podem rebaixar."
            });
        }

        let alvo = null;

        if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
            alvo = msg.message.extendedTextMessage.contextInfo.participant;
        } else if (
            msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length
        ) {
            alvo = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (args[0]?.startsWith("@")) {
            alvo = args[0].replace("@", "") + "@s.whatsapp.net";
        }

        if (!alvo) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Marque ou responda a mensagem do usuário."
            });
        }

        try {

            await sock.groupParticipantsUpdate(
                remoteJid,
                [alvo],
                "demote"
            );

            await sock.sendMessage(remoteJid, {
                text: `👇 @${alvo.split("@")[0]} foi REBAIXADO a membro comum.`,
                mentions: [alvo]
            });

        } catch (err) {

            console.log("ERRO REBAIXAR:", err);

            return sock.sendMessage(remoteJid, {
                text: "⚠️ Não consegui rebaixar. Verifique se sou administrador."
            });
        }
    }
};
