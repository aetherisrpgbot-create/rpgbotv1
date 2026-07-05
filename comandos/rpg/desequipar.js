// !desequipar
const ITENS = require("../../dados/itens");
const { getJogador } = require("../../servicos/jogador");
const { lerJogadores, escreverJogadores } = require("../../servicos/banco");

module.exports = {
    nome: "desequipar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const tipo = args[0]?.toLowerCase();
        const jogador = getJogador(remetenteId, msg.pushName || "Usuário");

        if (!tipo || !["arma", "armadura", "acessorio"].includes(tipo)) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Use:\n!desequipar arma\n!desequipar armadura\n!desequipar acessorio"
            });
        }

        let itemId = null;
        if (tipo === "arma") itemId = jogador.arma;
        else if (tipo === "armadura") itemId = jogador.armadura;
        else if (tipo === "acessorio") itemId = jogador.acessorio;

        if (!itemId) {
            return sock.sendMessage(remoteJid, {
                text: `❌ Você não tem ${tipo} equipada.`
            });
        }

        const item = ITENS[itemId];
        const nome = item?.nome || itemId;

        if (tipo === "arma") jogador.arma = null;
        else if (tipo === "armadura") jogador.armadura = null;
        else if (tipo === "acessorio") jogador.acessorio = null;

        const dados = lerJogadores();
        dados[remetenteId] = jogador;
        escreverJogadores(dados);

        await sock.sendMessage(remoteJid, {
            text: `✅ *${nome}* desequipado com sucesso!`
        });
    }
};
