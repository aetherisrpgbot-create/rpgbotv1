// !moeda
module.exports = {
    nome: "moeda",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const resultado = Math.random() < 0.5 ? 'Cara' : 'Coroa';
        await sock.sendMessage(remoteJid, { text: `🪙 Lançou a moeda e deu: **${resultado}**!` });
    }
};
