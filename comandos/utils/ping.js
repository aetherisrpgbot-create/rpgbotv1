// !ping
module.exports = {
    nome: "ping",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        await sock.sendMessage(remoteJid, { text: '🏓 Pong!' });
    }
};
