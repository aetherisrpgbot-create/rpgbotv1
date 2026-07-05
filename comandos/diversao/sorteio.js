// !sorteio
module.exports = {
    nome: "sorteio",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const numero = Math.floor(Math.random() * 100) + 1;
        await sock.sendMessage(remoteJid, { text: `🎲 Número sorteado: **${numero}**` });
    }
};
