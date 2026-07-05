// !idbot - Mostra o ID do bot
module.exports = {
    nome: "idbot",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { getBotId } = require("../../utils/helpers");
        
        const botId = getBotId(sock);
        const userId = sock.user.id;
        
        await sock.sendMessage(remoteJid, {
            text: `🤖 *ID DO BOT:*\n\n` +
                  `📱 ID completo: ${userId}\n` +
                  `📱 ID formatado: ${botId}\n\n` +
                  `Use !permissoes para ver se estou na lista de admins.`
        });
    }
};
