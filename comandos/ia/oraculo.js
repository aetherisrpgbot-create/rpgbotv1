// !oraculo - PERGUNTA AO ORÁCULO DE AETHERIS
const { gerarResposta } = require("../../servicos/ia");

module.exports = {
    nome: "oraculo",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const pergunta = args.join(" ");
        if (!pergunta) {
            return sock.sendMessage(remoteJid, {
                text: "🔮 *ORÁCULO DE AETHERIS*\n\n" +
                      "Faça sua pergunta, jovem aventureiro.\n" +
                      "Exemplo: !oraculo Onde está o próximo Fragmento?\n\n" +
                      "📌 O Oráculo vê o passado, presente e futuro de Aetheris..."
            });
        }

        const nome = msg.pushName || "Aventureiro";
        const resposta = await gerarResposta("oraculo", pergunta, nome);

        await sock.sendMessage(remoteJid, {
            text: `🔮 *ORÁCULO DE AETHERIS*\n\n"${resposta}"`
        });
    }
};
