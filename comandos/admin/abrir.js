// !abrir - ABRE O GRUPO (SÓ ADM)
const { isAdmin } = require("../../utils/permissoes");

module.exports = {
    nome: "abrir",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup) => {
        // ===== VERIFICA SE É GRUPO =====
        if (!isGroup) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Este comando só funciona em grupos!"
            });
        }

        // ===== VERIFICA SE É ADMIN =====
        const ehAdmin = await isAdmin(sock, remoteJid, remetenteId);
        if (!ehAdmin) {
            return sock.sendMessage(remoteJid, {
                text: "❌ *Apenas administradores podem abrir o grupo!*"
            });
        }

        try {
            // ===== ABRE O GRUPO =====
            await sock.groupSettingUpdate(remoteJid, 'not_announcement');
            
            await sock.sendMessage(remoteJid, {
                text: "🔓 *GRUPO ABERTO!*\n\n" +
                      "Todos os membros podem enviar mensagens novamente."
            });
        } catch (err) {
            console.log("ERRO ao abrir grupo:", err);
            await sock.sendMessage(remoteJid, {
                text: "❌ Erro ao abrir o grupo.\nVerifique se sou administrador."
            });
        }
    }
};
