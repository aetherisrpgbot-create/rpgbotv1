// !depositar
module.exports = {
    nome: "depositar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { getJogador, atualizarSaldo } = require("../../servicos/jogador");
        
        const valor = parseInt(args[0]);
        if (isNaN(valor) || valor <= 0) {
            return sock.sendMessage(remoteJid, { text: '❌ Valor inválido. Use: !depositar 100' });
        }
        
        const jogador = getJogador(remetenteId, msg.pushName || 'Usuário');
        if (jogador.saldo < valor) {
            return sock.sendMessage(remoteJid, { text: '❌ Saldo insuficiente.' });
        }
        
        atualizarSaldo(remetenteId, -valor, 'saldo');
        atualizarSaldo(remetenteId, valor, 'banco');
        
        await sock.sendMessage(remoteJid, { 
            text: `💰 Você depositou R$${valor} no banco.\nSaldo: R$${jogador.saldo - valor}\nBanco: R$${jogador.banco + valor}` 
        });
    }
};
