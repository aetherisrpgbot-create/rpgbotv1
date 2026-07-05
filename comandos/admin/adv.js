const { isAdmin } = require("../../utils/permissoes");
const { lerAdvertencias, escreverAdvertencias } = require("../../servicos/banco");

module.exports = {
    nome: "adv",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup) => {
        if (!isGroup) {
            return sock.sendMessage(remoteJid, { text: '❌ Apenas em grupos.' });
        }

        if (!(await isAdmin(sock, remoteJid, remetenteId))) {
            return sock.sendMessage(remoteJid, { text: '❌ Apenas administradores podem advertir.' });
        }

        let alvo = null;
        if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
            alvo = msg.message.extendedTextMessage.contextInfo.participant;
        } else if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
            alvo = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (args[0]?.startsWith('@')) {
            alvo = args[0].replace('@', '') + '@s.whatsapp.net';
        }

        if (!alvo) {
            return sock.sendMessage(remoteJid, { text: '❌ Marque ou responda a mensagem do usuário.' });
        }

        if (await isAdmin(sock, remoteJid, alvo)) {
            return sock.sendMessage(remoteJid, { text: '❌ Não é possível advertir um administrador.' });
        }

        let motivo = "Não informado";
        if (args.length > 0) {
            if (args[0].startsWith('@')) {
                motivo = args.slice(1).join(' ') || "Não informado";
            } else {
                motivo = args.join(' ') || "Não informado";
            }
        }

        const dados = lerAdvertencias();
        dados[alvo] = (dados[alvo] || 0) + 1;
        const total = dados[alvo];

        if (total >= 3) {
            delete dados[alvo];
            escreverAdvertencias(dados);

            try {
                await sock.groupParticipantsUpdate(remoteJid, [alvo], "remove");
                return sock.sendMessage(remoteJid, {
                    text: `🚫 USUÁRIO REMOVIDO\n\n👤 @${alvo.split('@')[0]}\n📋 Advertências: 3/3\n\n📝 Motivo: ${motivo}`,
                    mentions: [alvo]
                });
            } catch (err) {
                console.log("ERRO ADV REMOVER:", err);
                return sock.sendMessage(remoteJid, {
                    text: `⚠️ @${alvo.split('@')[0]} atingiu 3 advertências, mas não consegui remover. Verifique se sou administrador.`,
                    mentions: [alvo]
                });
            }
        }

        escreverAdvertencias(dados);
        await sock.sendMessage(remoteJid, {
            text: `⚠️ ADVERTÊNCIA\n\n👤 Usuário: @${alvo.split('@')[0]}\n📋 Advertências: ${total}/3\n\n📝 Motivo: ${motivo}\n\n⚠️ Ao atingir 3 advertências o usuário será removido!`,
            mentions: [alvo]
        });
    }
};
