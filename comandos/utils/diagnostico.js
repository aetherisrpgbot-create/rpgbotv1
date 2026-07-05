// !diagnostico - Diagnóstico completo do bot
module.exports = {
    nome: "diagnostico",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup) => {
        const { getBotId } = require("../../utils/permissoes");
        
        if (!isGroup) {
            return sock.sendMessage(remoteJid, { text: '❌ Apenas em grupos.' });
        }

        try {
            // PEGA ID DO BOT
            const botId = getBotId(sock);
            
            // PEGA DADOS DO GRUPO
            const meta = await sock.groupMetadata(remoteJid);
            
            // PROCURA O BOT NA LISTA
            const botNaLista = meta.participants.find(p => {
                return p.id === botId || p.id.split('@')[0] === botId.split('@')[0];
            });
            
            // VERIFICA SE É ADMIN
            const isAdmin = botNaLista && (botNaLista.admin === "admin" || botNaLista.admin === "superadmin");
            
            // MONTA RESPOSTA
            let texto = `🔍 *DIAGNÓSTICO DO BOT*\n\n`;
            texto += `📱 ID do bot (getBotId): ${botId}\n`;
            texto += `📱 ID do socket: ${sock.user.id}\n\n`;
            texto += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            texto += `👥 *PARTICIPANTES DO GRUPO:*\n`;
            
            // LISTA TODOS OS PARTICIPANTES
            for (const p of meta.participants) {
                const nome = p.id.split('@')[0];
                const isBot = p.id === botId || p.id.split('@')[0] === botId.split('@')[0];
                const admin = p.admin === "admin" || p.admin === "superadmin";
                
                texto += `${isBot ? '🤖 ' : ''}${admin ? '👑 ' : '👤 '}@${nome}`;
                texto += isBot ? ' (EU)' : '';
                texto += admin ? ' [ADMIN]' : ' [MEMBRO]';
                texto += `\n`;
            }
            
            texto += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
            texto += `👥 Total: ${meta.participants.length} participantes\n\n`;
            texto += `🤖 *BOT É ADMIN?* ${isAdmin ? '✅ SIM' : '❌ NÃO'}`;

            await sock.sendMessage(remoteJid, {
                text: texto,
                mentions: meta.participants.map(p => p.id)
            });

        } catch (err) {
            console.log("ERRO diagnostico:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro no diagnóstico:\n${err.message}`
            });
        }
    }
};
