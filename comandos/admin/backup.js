const fs = require("fs");
const { criarBackup, enviarBackup } = require("../../backup.js");

module.exports = {
    nome: "backup",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup) => {
        const chatId = isGroup ? remoteJid : remetenteId;

        await sock.sendMessage(chatId, {
            text: "⏳ *Gerando backup...*\n\nAguarde alguns segundos..."
        });

        try {
            const backup = await criarBackup();
            
            await sock.sendMessage(chatId, {
                document: fs.readFileSync(backup.caminho),
                mimetype: "application/zip",
                fileName: backup.nome,
                caption: `📦 *BACKUP DO BOT*\n\n✅ Backup criado com sucesso!\n📦 Tamanho: ${(fs.statSync(backup.caminho).size / 1024 / 1024).toFixed(2)} MB`
            });
        } catch (err) {
            console.log("ERRO backup:", err);
            await sock.sendMessage(chatId, {
                text: "❌ Erro ao gerar backup."
            });
        }
    }
};
