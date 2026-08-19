// !remadmin <numero> - REMOVE ADMIN GLOBAL (SÓ ADM GLOBAL)
const { removerAdmin, isGlobalAdmin } = require("../../config/auth");

module.exports = {
    nome: "remadmin",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup, isAdmin) => {
        // ===== VERIFICA SE É ADM GLOBAL =====
        if (!isAdmin && !isGlobalAdmin(remetenteId)) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Apenas administradores globais podem remover ADMs!"
            });
        }

        const adminId = args[0];
        if (!adminId) {
            return sock.sendMessage(remoteJid, {
                text: `❌ Use: !remadmin <numero>\n\n` +
                      `📌 Exemplo:\n` +
                      `   !remadmin 5581999999999`
            });
        }

        // ===== FORMATA O ID =====
        let adminIdFormatado = adminId;
        if (!adminId.includes('@')) {
            adminIdFormatado = `${adminId}@s.whatsapp.net`;
        }

        if (!adminIdFormatado.endsWith('@s.whatsapp.net')) {
            return sock.sendMessage(remoteJid, {
                text: "❌ ID inválido! Deve ser um número de WhatsApp."
            });
        }

        const resultado = removerAdmin(adminIdFormatado);
        if (!resultado) {
            return sock.sendMessage(remoteJid, {
                text: `⚠️ O admin \`${adminIdFormatado}\` não está na lista!`
            });
        }

        await sock.sendMessage(remoteJid, {
            text: `✅ *Admin global removido!*\n\n` +
                  `📌 ID: \`${adminIdFormatado}\`\n\n` +
                  `📌 Este usuário perdeu o acesso global.`
        });
    }
};
