// !seguranca
module.exports = {
    nome: "seguranca",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { getJogador } = require("../../servicos/jogador");
        const { lerJogadores, escreverJogadores } = require("../../servicos/banco");
        
        const dados = lerJogadores();
        const jogador = getJogador(remetenteId, msg.pushName || "Usuário");

        jogador.segurancaAte ??= 0;

        if (Date.now() < jogador.segurancaAte) {
            const dias = Math.ceil((jogador.segurancaAte - Date.now()) / 86400000);
            return sock.sendMessage(remoteJid, {
                text: `🛡️ Você já possui um segurança!\n\n⏳ Proteção restante: ${dias} dia(s)`
            });
        }

        if (jogador.saldo < 100) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Você precisa de R$100 para contratar um segurança."
            });
        }

        jogador.saldo -= 100;
        jogador.segurancaAte = Date.now() + (3 * 24 * 60 * 60 * 1000);

        dados[remetenteId] = jogador;
        escreverJogadores(dados);

        await sock.sendMessage(remoteJid, {
            text: `🛡️ SEGURANÇA CONTRATADO!\n\n💸 Custo: R$100\n\n👮 Seu dinheiro estará protegido contra roubos por 3 dias.`
        });
    }
};
