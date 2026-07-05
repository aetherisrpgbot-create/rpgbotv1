// !idgrupo - Mostra o ID do grupo
module.exports = {
    nome: "idgrupo",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const isGroup = remoteJid?.endsWith('@g.us');
        if (!isGroup) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Este comando é apenas para GRUPOS."
            });
        }

        await sock.sendMessage(remoteJid, {
            text: `📋 *ID DO GRUPO:*\n\n${remoteJid}\n\n📌 Copie esse ID e coloque no arquivo config/auth.js`
        });
    }
};
