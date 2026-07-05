// !equipar
const ITENS = require("../../dados/itens");
const { getJogador } = require("../../servicos/jogador");
const { lerJogadores, escreverJogadores } = require("../../servicos/banco");

module.exports = {
    nome: "equipar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const itemId = args[0];
        const jogador = getJogador(remetenteId, msg.pushName || "Usuário");

        if (!itemId) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Use: !equipar <id_do_item>"
            });
        }

        const item = ITENS[itemId];
        if (!item) {
            return sock.sendMessage(remoteJid, { text: "❌ Item inexistente." });
        }

        if (!jogador.inventario[itemId] || jogador.inventario[itemId] <= 0) {
            return sock.sendMessage(remoteJid, { text: "❌ Você não possui esse item." });
        }

        // Verifica se já está equipado
        if (item.tipo === "arma" && jogador.arma === itemId) {
            return sock.sendMessage(remoteJid, { text: "❌ Você já está com essa arma equipada." });
        }
        if (item.tipo === "armadura" && jogador.armadura === itemId) {
            return sock.sendMessage(remoteJid, { text: "❌ Você já está com essa armadura equipada." });
        }
        if (item.tipo === "acessorio" && jogador.acessorio === itemId) {
            return sock.sendMessage(remoteJid, { text: "❌ Você já está com esse acessório equipado." });
        }

        // Equipa
        if (item.tipo === "arma") jogador.arma = itemId;
        else if (item.tipo === "armadura") jogador.armadura = itemId;
        else if (item.tipo === "acessorio") jogador.acessorio = itemId;
        else {
            return sock.sendMessage(remoteJid, { text: "❌ Esse item não pode ser equipado." });
        }

        const dados = lerJogadores();
        dados[remetenteId] = jogador;
        escreverJogadores(dados);

        await sock.sendMessage(remoteJid, {
            text: `✅ *${item.nome}* equipado com sucesso!`
        });
    }
};
