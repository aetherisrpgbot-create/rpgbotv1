// !critico - VER CHANCE DE CRÍTICO
const { getJogador } = require("../../servicos/jogador");
const { getAtributosCombate } = require("../../utils/helpers");

module.exports = {
    nome: "critico",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const jogador = getJogador(remetenteId, msg.pushName || "Aventureiro");
        const stats = getAtributosCombate(jogador);

        const mensagem = `
╭━ 💥 *CRÍTICO* ━╮

👤 ${jogador.nome}
🎯 Chance: *${stats.critico}%*

💥 Crítico dobra o dano do ataque.
`;

        await sock.sendMessage(remoteJid, { text: mensagem });
    }
};
