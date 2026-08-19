// !mestre - PERGUNTA AO MESTRE SÁBIO (COM IA)
const { gerarResposta } = require("../../servicos/ia");

module.exports = {
    nome: "mestre",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const pergunta = args.join(" ");
        if (!pergunta) {
            return sock.sendMessage(remoteJid, {
                text: "📜 *MESTRE SÁBIO THEODORO*\n\n" +
                      "Pergunte sobre matemática, ciência, história ou filosofia.\n" +
                      "Exemplo: !mestre Como funciona a gravidade?\n\n" +
                      "📌 Theodoro explica tudo com analogias medievais!"
            });
        }

        const nome = msg.pushName || "Aventureiro";
        const resposta = await gerarResposta("mestre", pergunta, nome);

        await sock.sendMessage(remoteJid, {
            text: `📜 *MESTRE SÁBIO THEODORO*\n\n"${resposta}"`
        });
    }
};
