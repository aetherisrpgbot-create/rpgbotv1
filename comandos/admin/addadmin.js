// !addadmin <numero> - ADICIONA ADMIN GLOBAL (SÓ ADM GLOBAL)
const { adicionarAdmin, isGlobalAdmin } = require("../../config/auth");

module.exports = {
    nome: "addadmin",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup, isAdmin) => {
        // ===== VERIFICA SE É ADM GLOBAL =====
        if (!isAdmin && !isGlobalAdmin(remetenteId)) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Apenas administradores globais podem adicionar ADMs!"
            });
        }

        const adminId = args[0];
        if (!adminId) {
            return sock.sendMessage(remoteJid, {
                text: `❌ Use: !addadmin <numero>\n\n` +
                      `📌 Exemplo:\n` +
                      `   !addadmin 5581999999999`
            });
        }

        // ===== ADICIONA O ADMIN (A FUNÇÃO JÁ TRATA O FORMATO) =====
        const resultado = adicionarAdmin(adminId);
        if (!resultado) {
            return sock.sendMessage(remoteJid, {
                text: `⚠️ O admin \`${adminId}\` já está na lista!`
            });
        }

        await sock.sendMessage(remoteJid, {
            text: `✅ *Admin global adicionado!*\n\n` +
                  `📌 ID: \`${adminId}\`\n\n` +
                  `📌 Este usuário agora tem acesso a todos os grupos.`
        });
    }
};
