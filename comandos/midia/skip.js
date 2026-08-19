// !skip - PULA A MÚSICA ATUAL
const { musicQueue, isProcessingMusic, skipMusic } = require("./play");

module.exports = {
    nome: "skip",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        if (musicQueue.length === 0 && !isProcessingMusic) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Não há música tocando no momento."
            });
        }

        // Remove a música atual da fila
        if (musicQueue.length > 0) {
            const pulada = musicQueue.shift();
            await sock.sendMessage(remoteJid, {
                text: `⏭️ *Música pulada!*\n\n🎵 ${pulada.query}\n\n📌 Próxima música será tocada.`
            });
        } else {
            await sock.sendMessage(remoteJid, {
                text: "⏭️ *Música pulada!*\n\n📌 Aguarde a próxima música."
            });
        }
    }
};
