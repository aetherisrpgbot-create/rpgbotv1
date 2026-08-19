// comandos/ia/ia.js
const { chamarIA } = require('../../servicos/iaPython');

module.exports = {
    nome: "ia",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const mensagem = args.join(" ").trim();

            if (!mensagem) {
                return sock.sendMessage(remoteJid, {
                    text: `🧠 *IA Inteligente*

📌 *Como usar:*
!ia <mensagem>

💡 *Exemplos:*
!ia oi
!ia quem criou você
!ia me dá uma receita de brigadeiro
!ia !perfil`
                });
            }

            await sock.sendMessage(remoteJid, {
                text: `🧠 *Pensando...*\n⏳ Aguarde um instante.`
            });

            // 🔥 PASSA O remetenteId COMO USUÁRIO
            const resposta = await chamarIA(mensagem, remetenteId);

            await sock.sendMessage(remoteJid, {
                text: `🧠 *IA:*\n\n${resposta}`
            });

        } catch (err) {
            console.log("❌ ERRO ia:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro: ${err.message?.substring(0, 100) || 'Tente novamente.'}`
            });
        }
    }
};
