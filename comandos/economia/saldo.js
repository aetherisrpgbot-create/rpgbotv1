// !saldo
module.exports = {
    nome: "saldo",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { getJogador } = require("../../servicos/jogador");
        const jogador = getJogador(remetenteId, msg.pushName || 'Usuário');
        
        await sock.sendMessage(remoteJid, { 
            text: `💰 *${jogador.nome}*\nDinheiro: R$${jogador.saldo}\nBanco: R$${jogador.banco}` 
        });
    }
};
