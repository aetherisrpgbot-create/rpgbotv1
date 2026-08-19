// !armeiro - PERGUNTA AO MESTRE ARMEIRO (COM IA)
const { gerarResposta } = require("../../servicos/ia");

module.exports = {
    nome: "armeiro",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const pergunta = args.join(" ");
        if (!pergunta) {
            return sock.sendMessage(remoteJid, {
                text: "⚔️ *MESTRE ARMEIRO GORM*\n\n" +
                      "Pergunte sobre armas, armaduras, classes ou combate.\n" +
                      "Exemplo: !armeiro Qual a melhor arma para um guerreiro?\n\n" +
                      "📌 Gorm é especialista em forja e batalha!"
            });
        }

        const nome = msg.pushName || "Aventureiro";
        const resposta = await gerarResposta("armeiro", pergunta, nome);

        await sock.sendMessage(remoteJid, {
            text: `⚔️ *MESTRE ARMEIRO GORM*\n\n"${resposta}"`
        });
    }
};
