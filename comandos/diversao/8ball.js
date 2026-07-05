// !8ball
module.exports = {
    nome: "8ball",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const respostas = [
            'Sim, definitivamente.', 'Não.', 'Tem que ver com os cara lá', 
            'Pergunte novamente mais tarde.', 'Talvez...', 'Com certeza!', 
            'Melhor não dizer agora.', 'Sim, mas se esforce.', 'Não conte com isso.'
        ];
        const resposta = respostas[Math.floor(Math.random() * respostas.length)];
        await sock.sendMessage(remoteJid, { text: `🔮 ${resposta}` });
    }
};
