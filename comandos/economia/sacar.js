// !sacar
module.exports = {
    nome: "sacar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { getJogador, atualizarSaldo } = require("../../servicos/jogador");
        
        const valor = parseInt(args[0]);
        if (isNaN(valor) || valor <= 0) {
            return sock.sendMessage(remoteJid, { text: '❌ Valor inválido. Use: !sacar 100' });
        }
        
        const jogador = getJogador(remetenteId, msg.pushName || 'Usuário');
        if (jogador.banco < valor) {
            return sock.sendMessage(remoteJid, { text: '❌ Saldo no banco insuficiente.' });
        }
        
        atualizarSaldo(remetenteId, -valor, 'banco');
        atualizarSaldo(remetenteId, valor, 'saldo');
        
        await sock.sendMessage(remoteJid, { 
            text: `🏧 Você sacou R$${valor} do banco.\nSaldo: R$${jogador.saldo + valor}\nBanco: R$${jogador.banco - valor}` 
        });
    }
};
