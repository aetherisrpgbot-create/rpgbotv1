// !equipamentos
const ITENS = require("../../dados/itens");
const { getJogador } = require("../../servicos/jogador");

module.exports = {
    nome: "equipamentos",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const jogador = getJogador(remetenteId, msg.pushName || "Usuário");

        const arma = jogador.arma ? ITENS[jogador.arma]?.nome : "Nenhuma";
        const armadura = jogador.armadura ? ITENS[jogador.armadura]?.nome : "Nenhuma";
        const acessorio = jogador.acessorio ? ITENS[jogador.acessorio]?.nome : "Nenhum";

        await sock.sendMessage(remoteJid, {
            text: `⚔️ *EQUIPAMENTOS DE ${jogador.nome.toUpperCase()}*\n\n` +
                  `🗡️ Arma: ${arma}\n` +
                  `🛡️ Armadura: ${armadura}\n` +
                  `💍 Acessório: ${acessorio}`
        });
    }
};
