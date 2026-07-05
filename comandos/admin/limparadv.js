// !limparadv
module.exports = {
    nome: "limparadv",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup) => {
        const { isAdmin } = require("../../utils/permissoes");
        const { lerAdvertencias, escreverAdvertencias } = require("../../servicos/banco");

        if (!isGroup) {
            return sock.sendMessage(remoteJid, { text: '❌ Apenas em grupos.' });
        }

        if (!(await isAdmin(sock, remoteJid, remetenteId))) {
            return sock.sendMessage(remoteJid, { text: '❌ Apenas administradores podem usar este comando.' });
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

        const dados = lerAdvertencias();
        if (!dados[alvo]) {
            return sock.sendMessage(remoteJid, { text: '❌ Esse usuário não possui advertências.' });
        }

        delete dados[alvo];
        escreverAdvertencias(dados);

        await sock.sendMessage(remoteJid, {
            text: `✅ Advertências limpas com sucesso.\n\n👤 Usuário: @${alvo.split('@')[0]}\n⚠️ Advertências: 0/3`,
            mentions: [alvo]
        });
    }
};
