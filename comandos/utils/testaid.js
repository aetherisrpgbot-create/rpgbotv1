// !testaid - Testa os IDs
module.exports = {
    nome: "testaid",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup) => {
        if (!isGroup) {
            return sock.sendMessage(remoteJid, { text: '❌ Apenas em grupos.' });
        }

        try {
            // PEGA ID DO BOT
            const botId = sock.user.id;
            
            // PEGA DADOS DO GRUPO
            const meta = await sock.groupMetadata(remoteJid);
            
            let texto = `🔍 *TESTE DE IDS*\n\n`;
            texto += `📱 ID do bot (sock.user.id): ${botId}\n\n`;
            texto += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            texto += `👥 *PARTICIPANTES:*\n`;
            
            // LISTA TODOS OS PARTICIPANTES COM SEUS IDS COMPLETOS
            for (const p of meta.participants) {
                const isBot = p.id === botId;
                const admin = p.admin === "admin" || p.admin === "superadmin";
                
                texto += `${isBot ? '🤖 ' : ''}${admin ? '👑 ' : '👤 '}`;
                texto += `ID: ${p.id}`;
                texto += isBot ? ' (EU)' : '';
                texto += admin ? ' [ADMIN]' : ' [MEMBRO]';
                texto += `\n`;
            }
            
            texto += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
            texto += `🤖 *BOT É ADMIN?* `;
            
            // VERIFICA SE O BOT ESTÁ NA LISTA COMO ADMIN
            const botNaLista = meta.participants.find(p => p.id === botId);
            const isAdmin = botNaLista && (botNaLista.admin === "admin" || botNaLista.admin === "superadmin");
            
            texto += isAdmin ? '✅ SIM' : '❌ NÃO';

            await sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.log("ERRO testaid:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro: ${err.message}`
            });
        }
    }
};
