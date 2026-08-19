// !stop - PARA A MÚSICA E LIMPA A FILA
const { musicQueue, isProcessingMusic } = require("./play");

module.exports = {
    nome: "stop",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        // Limpa a fila
        musicQueue.length = 0;
        
        await sock.sendMessage(remoteJid, {
            text: `⏹️ *MÚSICA PARADA!*\n\n` +
                  `🎵 A fila foi limpa.\n` +
                  `📌 Use !play <música> para começar de novo.`
        });
    }
};
