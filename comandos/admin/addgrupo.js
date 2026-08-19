// !addgrupo <id> - ADICIONA GRUPO À LISTA (SÓ ADM GLOBAL)
const { adicionarGrupo, isGlobalAdmin } = require("../../config/auth");

module.exports = {
    nome: "addgrupo",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup, isAdmin) => {
        // ===== VERIFICA SE É ADM GLOBAL =====
        if (!isAdmin && !isGlobalAdmin(remetenteId)) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Apenas administradores globais podem adicionar grupos!"
            });
        }

        const grupoId = args[0];
        if (!grupoId) {
            return sock.sendMessage(remoteJid, {
                text: `❌ Use: !addgrupo <id>\n\n` +
                      `📌 Para pegar o ID do grupo atual:\n` +
                      `   !idgrupo\n\n` +
                      `📌 Exemplo:\n` +
                      `   !addgrupo 120363427739738043@g.us`
            });
        }

        // ===== VALIDA O ID =====
        if (!grupoId.endsWith('@g.us')) {
            return sock.sendMessage(remoteJid, {
                text: "❌ ID inválido! Deve terminar com @g.us"
            });
        }

        const resultado = adicionarGrupo(grupoId);
        if (!resultado) {
            return sock.sendMessage(remoteJid, {
                text: `⚠️ O grupo \`${grupoId}\` já está na lista de autorizados!`
            });
        }

        await sock.sendMessage(remoteJid, {
            text: `✅ *Grupo adicionado!*\n\n` +
                  `📌 ID: \`${grupoId}\`\n\n` +
                  `📌 O grupo agora é autorizado a usar o bot.`
        });
    }
};
