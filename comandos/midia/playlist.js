// !playlist - MOSTRA A FILA DE MÚSICAS
const { musicQueue } = require("./play");

module.exports = {
    nome: "playlist",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        if (musicQueue.length === 0) {
            return sock.sendMessage(remoteJid, {
                text: "🎵 *FILA VAZIA*\n\nNão há músicas na fila.\nUse !play <música> para adicionar."
            });
        }

        let texto = `🎵 *FILA DE MÚSICAS*\n\n`;
        const max = Math.min(musicQueue.length, 10);
        for (let i = 0; i < max; i++) {
            const item = musicQueue[i];
            const pos = i === 0 ? "▶️" : `${i + 1}º`;
            texto += `${pos} ${item.query}\n`;
        }

        if (musicQueue.length > 10) {
            texto += `\n... e mais ${musicQueue.length - 10} música(s) na fila.`;
        }

        texto += `\n\n📌 Total: ${musicQueue.length} música(s)`;
        await sock.sendMessage(remoteJid, { text: texto });
    }
};
