// !remgrupo <id> - REMOVE GRUPO DA LISTA (SÓ ADM GLOBAL)
const { removerGrupo, isGlobalAdmin } = require("../../config/auth");

module.exports = {
    nome: "remgrupo",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup, isAdmin) => {
        // ===== VERIFICA SE É ADM GLOBAL =====
        if (!isAdmin && !isGlobalAdmin(remetenteId)) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Apenas administradores globais podem remover grupos!"
            });
        }

        const grupoId = args[0];
        if (!grupoId) {
            return sock.sendMessage(remoteJid, {
                text: `❌ Use: !remgrupo <id>\n\n` +
                      `📌 Exemplo:\n` +
                      `   !remgrupo 120363427739738043@g.us`
            });
        }

        // ===== VALIDA O ID =====
        if (!grupoId.endsWith('@g.us')) {
            return sock.sendMessage(remoteJid, {
                text: "❌ ID inválido! Deve terminar com @g.us"
            });
        }

        const resultado = removerGrupo(grupoId);
        if (!resultado) {
            return sock.sendMessage(remoteJid, {
                text: `⚠️ O grupo \`${grupoId}\` não está na lista de autorizados!`
            });
        }

        await sock.sendMessage(remoteJid, {
            text: `✅ *Grupo removido!*\n\n` +
                  `📌 ID: \`${grupoId}\`\n\n` +
                  `📌 O grupo não pode mais usar o bot.`
        });
    }
};
