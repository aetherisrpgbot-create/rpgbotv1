// !recusar - RECUSA UM DESAFIO DE DUELO
const { recusarDuelo } = require("../../servicos/duelo");

module.exports = {
    nome: "recusar",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup) => {
        if (!isGroup) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Este comando só funciona em grupos!"
            });
        }

        const resultado = recusarDuelo(remetenteId);
        if (!resultado.sucesso) {
            return sock.sendMessage(remoteJid, {
                text: `❌ ${resultado.erro}`
            });
        }

        await sock.sendMessage(remoteJid, {
            text: `❌ *DESAFIO RECUSADO!*\n\n` +
                  `@${remetenteId.split('@')[0]} recusou o duelo.\n\n` +
                  `Uma pena... 😢`,
            mentions: [remetenteId]
        });
    }
};
