// !estatisticas - MOSTRA ESTATÍSTICAS DO BOT (SÓ ADM)
const { getEstatisticas, getTopUsuarios, getComandosMaisUsados } = require("../../servicos/database");

module.exports = {
    nome: "estatisticas",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup, isAdmin) => {
        if (!isAdmin) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Apenas administradores podem ver as estatísticas."
            });
        }

        const stats = getEstatisticas();
        const topUsuarios = getTopUsuarios(5);
        const topComandos = getComandosMaisUsados(5);

        let texto = `📊 *ESTATÍSTICAS DO RPGBOT*\n\n`;
        texto += `📌 Total de comandos: *${stats.total || 0}*\n`;
        texto += `📌 Hoje: *${stats.porDia?.[stats.hoje] || 0}*\n\n`;
        
        texto += `🏆 *TOP USUÁRIOS:*\n`;
        for (const u of topUsuarios) {
            texto += `   ${u.id.split('@')[0]} - ${u.comandos} comandos\n`;
        }
        
        texto += `\n🔥 *COMANDOS MAIS USADOS:*\n`;
        for (const c of topComandos) {
            texto += `   !${c.comando} - ${c.usos} usos\n`;
        }

        await sock.sendMessage(remoteJid, { text: texto });
    }
};
