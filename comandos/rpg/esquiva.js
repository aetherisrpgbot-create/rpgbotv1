// !esquiva - VER CHANCE DE ESQUIVA
const { getJogador } = require("../../servicos/jogador");
const { getAtributosCombate } = require("../../utils/helpers");

module.exports = {
    nome: "esquiva",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const jogador = getJogador(remetenteId, msg.pushName || "Aventureiro");
        const stats = getAtributosCombate(jogador);

        const mensagem = `
╭━━━ 💨 *ESQUIVA* ━━━╮

👤 ${jogador.nome}
💨 Chance: *${stats.esquiva}%*

💨 Esquiva anula completamente o dano.
`;

        await sock.sendMessage(remoteJid, { text: mensagem });
    }
};
