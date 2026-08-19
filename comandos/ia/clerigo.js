// !clerigo - PERGUNTA AO CLÉRIGO (COM IA)
const { gerarResposta } = require("../../servicos/ia");

module.exports = {
    nome: "clerigo",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const pergunta = args.join(" ");
        if (!pergunta) {
            return sock.sendMessage(remoteJid, {
                text: "🙏 *CLÉRIGO ALDRIC*\n\n" +
                      "Pergunte sobre poções, ervas, curas ou teologia.\n" +
                      "Exemplo: !clerigo Como fazer uma poção de vida?\n\n" +
                      "📌 Aldric conhece os segredos das ervas e da luz."
            });
        }

        const nome = msg.pushName || "Aventureiro";
        const resposta = await gerarResposta("clerigo", pergunta, nome);

        await sock.sendMessage(remoteJid, {
            text: `🙏 *CLÉRIGO ALDRIC*\n\n"${resposta}"`
        });
    }
};
