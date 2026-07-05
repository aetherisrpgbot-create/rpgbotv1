// !dado
module.exports = {
    nome: "dado",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const resultado = Math.floor(Math.random() * 6) + 1;
        await sock.sendMessage(remoteJid, { text: `🎲 Você rolou um dado e caiu em... **${resultado}**!` });
    }
};
