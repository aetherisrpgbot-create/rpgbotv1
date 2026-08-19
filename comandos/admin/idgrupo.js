// !idgrupo - MOSTRA O ID DO GRUPO ATUAL (SEMPRE FUNCIONA)
module.exports = {
    nome: "idgrupo",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup) => {
        if (!isGroup) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Este comando só funciona em grupos!"
            });
        }

        const texto = `╭━━━ 📋 *ID DO GRUPO* ━━━╮\n\n` +
                      `📌 *ID:*\n` +
                      `\`${remoteJid}\`\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━━━━\n` +
                      `📌 Para adicionar este grupo:\n` +
                      `   !addgrupo ${remoteJid}\n\n` +
                      `📌 Para remover:\n` +
                      `   !remgrupo ${remoteJid}\n\n` +
                      `╰━━━━━━━━━━━━━━━━━━━━╯`;

        await sock.sendMessage(remoteJid, { text: texto });
    }
};
