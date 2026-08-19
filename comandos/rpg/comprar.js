// !comprar <id> - COMPRA UM ITEM DA LOJA
const ITENS = require("../../dados/itens");
const { getJogador } = require("../../servicos/jogador");
const { lerJogadores, escreverJogadores } = require("../../servicos/banco");

module.exports = {
    nome: "comprar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const itemId = args[0];
        if (!itemId) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Use: !comprar <id>\nExemplo: !comprar pocao_vida"
            });
        }

        const item = ITENS[itemId];
        if (!item) {
            return sock.sendMessage(remoteJid, {
                text: `❌ Item "${itemId}" não encontrado!`
            });
        }

        // ===== 🔥 VERIFICA SE O ITEM PODE SER COMPRADO =====
        if (!item.valor || item.valor <= 0) {
            return sock.sendMessage(remoteJid, {
                text: `❌ Este item não está disponível para compra.`
            });
        }

        const jogador = getJogador(remetenteId);
        if (jogador.saldo < item.valor) {
            return sock.sendMessage(remoteJid, {
                text: `❌ Saldo insuficiente!\n💰 Você: R$${jogador.saldo}\n💰 Preço: R$${item.valor}`
            });
        }

        // ===== COMPRA =====
        jogador.saldo -= item.valor;

        if (!jogador.inventario) jogador.inventario = {};
        jogador.inventario[itemId] = (jogador.inventario[itemId] || 0) + 1;

        const dados = lerJogadores();
        dados[remetenteId] = jogador;
        escreverJogadores(dados);

        await sock.sendMessage(remoteJid, {
            text: `✅ *Compra realizada!*\n\n📦 ${item.nome}\n💰 -R$${item.valor}\n💳 Saldo restante: R$${jogador.saldo}`
        });
    }
};
