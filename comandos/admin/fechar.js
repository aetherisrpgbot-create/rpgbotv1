// !fechar - FECHA O GRUPO (SÓ ADM)
const { isAdmin } = require("../../utils/permissoes");

module.exports = {
    nome: "fechar",
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
                text: "❌ *Apenas administradores podem fechar o grupo!*"
            });
        }

        try {
            // ===== FECHA O GRUPO =====
            await sock.groupSettingUpdate(remoteJid, 'announcement');
            
            await sock.sendMessage(remoteJid, {
                text: "🔒 *GRUPO FECHADO!*\n\n" +
                      "Apenas administradores podem enviar mensagens.\n" +
                      "Use !abrir para liberar novamente."
            });
        } catch (err) {
            console.log("ERRO ao fechar grupo:", err);
            await sock.sendMessage(remoteJid, {
                text: "❌ Erro ao fechar o grupo.\nVerifique se sou administrador."
            });
        }
    }
};
