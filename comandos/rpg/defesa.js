// !defesa - CALCULA SUA DEFESA TOTAL
const { getJogador } = require("../../servicos/jogador");
const { getAtributosCombate } = require("../../utils/helpers");

module.exports = {
    nome: "defesa",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const jogador = getJogador(remetenteId, msg.pushName || "Aventureiro");
        const stats = getAtributosCombate(jogador);

        const mensagem = `
╔════════════════════╗
    🛡️ *DEFESA TOTAL*        
╚════════════════════╝

👤 ${jogador.nome}
🛡️ Defesa: *${stats.defesa}*

📌 A defesa reduz o dano recebido.
   Quanto maior, menos dano você toma.
`;

        await sock.sendMessage(remoteJid, { text: mensagem });
    }
};
