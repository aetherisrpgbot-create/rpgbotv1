// !manutencao on/off - ATIVA/DESATIVA MODO MANUTENÇÃO (SÓ ADM GLOBAL)
const { setModoManutencao, isGlobalAdmin } = require("../../config/auth");

module.exports = {
    nome: "manutencao",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup, isAdmin) => {
        // ===== VERIFICA SE É ADM GLOBAL =====
        if (!isAdmin && !isGlobalAdmin(remetenteId)) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Apenas administradores globais podem ativar o modo manutenção!"
            });
        }

        const comando = args[0]?.toLowerCase();
        if (!comando || (comando !== "on" && comando !== "off")) {
            return sock.sendMessage(remoteJid, {
                text: `❌ Use: !manutencao on/off\n\n` +
                      `📌 Exemplo:\n` +
                      `   !manutencao on  → Ativa manutenção\n` +
                      `   !manutencao off → Desativa manutenção`
            });
        }

        const ativo = comando === "on";
        setModoManutencao(ativo);

        await sock.sendMessage(remoteJid, {
            text: ativo
                ? `🛠️ *MODO MANUTENÇÃO ATIVADO!*\n\n` +
                  `🚫 Apenas ADMs globais podem usar o bot.\n` +
                  `📌 Use !manutencao off para desativar.`
                : `✅ *MODO MANUTENÇÃO DESATIVADO!*\n\n` +
                  `📌 O bot voltou ao funcionamento normal.`
        });
    }
};
