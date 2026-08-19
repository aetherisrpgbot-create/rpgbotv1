// !criador - PERGUNTA SOBRE O FUNDADOR DA ORDEM
const { gerarResposta } = require("../../servicos/ia");

module.exports = {
    nome: "criador",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const pergunta = args.join(" ");
        const nome = msg.pushName || "Aventureiro";

        if (!pergunta) {
            return sock.sendMessage(remoteJid, {
                text: `👑 *WIDNES, O ARCANJO DE AETHERIS*

Dizem que Widnes foi o primeiro a encontrar um Fragmento do Coração.
Ele fundou a Ordem do RPGBOT e treinou os primeiros aventureiros.

Alguns dizem que ele ainda caminha entre nós.
Outros acreditam que ele se tornou parte do próprio Coração.

📜 *Digite !criador <pergunta>* para saber mais.`
            });
        }

        const resposta = await gerarResposta("criador", pergunta, nome);

        await sock.sendMessage(remoteJid, {
            text: `👑 *WIDNES, O ARCANJO DE AETHERIS*\n\n"${resposta}"`
        });
    }
};
