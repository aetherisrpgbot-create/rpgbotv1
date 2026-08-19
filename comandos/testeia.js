// comandos/testeia.js
const { chamarIA } = require('../servicos/iaPython');

module.exports = {
    nome: "testeia",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const mensagem = args.join(" ") || "oi";
            
            await sock.sendMessage(remoteJid, {
                text: `🧠 *Testando IA...*\n⏳ Aguarde.`
            });

            const resposta = await chamarIA(mensagem);

            await sock.sendMessage(remoteJid, {
                text: `🧠 *Resposta do Python:*\n\n${resposta}`
            });

        } catch (err) {
            console.log("❌ ERRO testeia:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro: ${err.message?.substring(0, 100) || 'Tente novamente.'}`
            });
        }
    }
};
