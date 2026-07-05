const { isAdmin } = require("../../utils/permissoes");

module.exports = {
    nome: "ban",

    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup) => {

        if (!isGroup) {
            return sock.sendMessage(remoteJid, {
                text: "⚠️ Comando apenas em grupos."
            });
        }

        if (!(await isAdmin(sock, remoteJid, remetenteId))) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Apenas administradores podem banir."
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

        if (alvo === remetenteId) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Você não pode banir a si mesmo."
            });
        }

        try {

            await sock.groupParticipantsUpdate(
                remoteJid,
                [alvo],
                "remove"
            );

            await sock.sendMessage(remoteJid, {
                text: `🚫 @${alvo.split("@")[0]} foi banido!`,
                mentions: [alvo]
            });

        } catch (err) {

            console.log("ERRO BAN:", err);

            return sock.sendMessage(remoteJid, {
                text: "⚠️ Não consegui banir. Verifique se sou administrador."
            });
        }
    }
};
