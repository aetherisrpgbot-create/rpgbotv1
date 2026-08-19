// !statusbot - MOSTRA STATUS DO SISTEMA (SÓ ADM GLOBAL)
const { getStatus, isGlobalAdmin } = require("../../config/auth");

module.exports = {
    nome: "statusbot",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup, isAdmin) => {
        // ===== VERIFICA SE É ADM GLOBAL =====
        if (!isAdmin && !isGlobalAdmin(remetenteId)) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Apenas administradores globais podem ver o status do sistema!"
            });
        }

        const status = getStatus();

        let texto = `╭━━━ 📊 *STATUS DO SISTEMA* ━━━╮\n\n`;
        texto += `🛠️ Modo manutenção: ${status.modoManutencao ? '🔴 ATIVADO' : '🟢 DESATIVADO'}\n`;
        texto += `📌 Grupos autorizados: ${status.totalGrupos}\n`;
        texto += `👑 ADMs globais: ${status.totalAdmins}\n\n`;
        texto += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
        texto += `📋 *GRUPOS AUTORIZADOS:*\n`;
        for (const grupo of status.grupos) {
            texto += `   • ${grupo}\n`;
        }
        texto += `\n━━━━━━━━━━━━━━━━━━━━━━━\n`;
        texto += `👑 *ADMs GLOBAIS:*\n`;
        for (const admin of status.admins) {
            texto += `   • ${admin}\n`;
        }
        texto += `\n╰━━━━━━━━━━━━━━━━━━━━╯`;

        await sock.sendMessage(remoteJid, { text: texto });
    }
};
