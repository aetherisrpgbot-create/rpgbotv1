// !consultadv
module.exports = {
    nome: "consultadv",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup) => {
        const { lerAdvertencias } = require("../../servicos/banco");
        
        if (!isGroup) {
            return sock.sendMessage(remoteJid, { text: '❌ Apenas em grupos.' });
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
        const total = dados[alvo] || 0;

        await sock.sendMessage(remoteJid, {
            text: `📋 ADVERTÊNCIAS\n\n👤 Usuário: @${alvo.split('@')[0]}\n⚠️ Advertências: ${total}/3`,
            mentions: [alvo]
        });
    }
};
