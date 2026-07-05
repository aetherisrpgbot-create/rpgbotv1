// !comprar
const ITENS = require("../../dados/itens");
const { getJogador } = require("../../servicos/jogador");
const { lerJogadores, escreverJogadores } = require("../../servicos/banco");
const { verificarCombate } = require("../../utils/combate");

module.exports = {
    nome: "comprar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const itemId = args[0];
        const jogador = getJogador(remetenteId, msg.pushName || "Usuário");
	// ===== VERIFICA SE ESTÁ EM COMBATE =====
const combateCheck = verificarCombate(remetenteId);
if (combateCheck.bloqueado) {
    return sock.sendMessage(remoteJid, { text: combateCheck.mensagem });
}

        if (!itemId || !ITENS[itemId]) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Item inválido.\nUse !loja para ver os itens."
            });
        }

        const item = ITENS[itemId];

        if (jogador.saldo < item.valor) {
            return sock.sendMessage(remoteJid, {
                text: `❌ Dinheiro insuficiente!\n💰 Necessário: R$${item.valor}\n💰 Seu saldo: R$${jogador.saldo}`
            });
        }

        jogador.saldo -= item.valor;
        jogador.inventario[itemId] = (jogador.inventario[itemId] || 0) + 1;

        const dados = lerJogadores();
        dados[remetenteId] = jogador;
        escreverJogadores(dados);

        await sock.sendMessage(remoteJid, {
            text: `✅ *${item.nome}* comprado com sucesso!\n\n💰 -R$${item.valor}`
        });
    }
};
