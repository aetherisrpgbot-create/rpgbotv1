// !resetmissoes - Reseta as missões de um usuário (ADMIN)
const { resetarMissoes } = require("../../servicos/missoes");
const { isAdmin } = require("../../utils/permissoes");

module.exports = {
    nome: "resetmissoes",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup) => {
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
            const numero = args[0].replace('@', '').replace(/[^0-9]/g, '');
            alvo = numero + '@s.whatsapp.net';
        }

        if (!alvo) {
            return sock.sendMessage(remoteJid, { 
                text: '❌ Marque ou responda a mensagem do usuário.\nExemplo: !resetmissoes @usuario'
            });
        }

        try {
            resetarMissoes(alvo);
            
            await sock.sendMessage(remoteJid, {
                text: `🔄 *MISSÕES RESETADAS!*\n\n` +
                      `👤 Usuário: @${alvo.split('@')[0]}\n\n` +
                      `✅ Todas as missões foram resetadas!\n` +
                      `🔄 Novas missões serão geradas ao usar !missoes.`,
                mentions: [alvo]
            });
        } catch (err) {
            console.log("ERRO resetmissoes:", err);
            await sock.sendMessage(remoteJid, {
                text: '❌ Erro ao resetar missões.'
            });
        }
    }
};
