// !testbot - Mostra ID do bot e verifica admin
module.exports = {
    nome: "testbot",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup) => {
        const { getBotId, isBotAdmin } = require("../../utils/helpers");
        
        if (!isGroup) {
            return sock.sendMessage(remoteJid, { text: '❌ Este comando é apenas para grupos.' });
        }

        try {
            const botId = getBotId(sock);
            
            // Busca dados do grupo
            const metadata = await sock.groupMetadata(remoteJid);
            
            // Verifica se o bot é admin
            const botAdmin = await isBotAdmin(sock, remoteJid, botId);
            
            // Procura o bot na lista de participantes
            const botNaLista = metadata.participants.find(p => {
                return p.id === botId || p.id.split('@')[0] === botId.split('@')[0];
            });
            
            let texto = `🤖 *TESTE DO BOT*\n\n`;
            texto += `📱 ID do bot: ${botId}\n`;
            texto += `📱 ID do socket: ${sock.user.id}\n\n`;
            texto += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            texto += `👑 *BOT É ADMIN?* ${botAdmin ? '✅ SIM' : '❌ NÃO'}\n`;
            
            if (botNaLista) {
                texto += `✅ Bot ENCONTRADO na lista\n`;
                texto += `📋 Status: ${botNaLista.admin || 'membro'}\n`;
            } else {
                texto += `❌ Bot NÃO encontrado na lista!\n`;
                texto += `🔍 Verifique se o ID está correto.\n`;
            }
            
            texto += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
            texto += `👥 Total: ${metadata.participants.length} participantes`;

            await sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.log("ERRO testbot:", err);
            await sock.sendMessage(remoteJid, {
                text: "❌ Erro ao testar bot."
            });
        }
    }
};
