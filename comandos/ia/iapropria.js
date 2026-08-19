// comandos/ia/iapropria.js - IA PRÓPRIA
const { chamarIA } = require('../../servicos/iaPython');

module.exports = {
    nome: "iapropria",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const mensagem = args.join(" ") || "oi";

            await sock.sendMessage(remoteJid, {
                text: `🧠 *Pensando...*\n⏳ Aguarde um instante.`
            });

            const resposta = await chamarIA(mensagem);

            await sock.sendMessage(remoteJid, {
                text: `🧠 *IA:*\n\n${resposta}`
            });

        } catch (err) {
            console.log("❌ ERRO iapropria:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro: ${err.message?.substring(0, 100) || 'Tente novamente.'}`
            });
        }
    }
};
