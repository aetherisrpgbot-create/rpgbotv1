// !rankadv
module.exports = {
    nome: "rankadv",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup) => {
        const { lerAdvertencias } = require("../../servicos/banco");
        
        if (!isGroup) {
            return sock.sendMessage(remoteJid, { text: '❌ Apenas em grupos.' });
        }

        const dados = lerAdvertencias();
        const ranking = Object.entries(dados).sort((a, b) => b[1] - a[1]);

        if (ranking.length === 0) {
            return sock.sendMessage(remoteJid, { text: '✅ Nenhum usuário possui advertências.' });
        }

        let texto = `⚠️ RANKING DE ADVERTÊNCIAS ⚠️\n\n`;
        const mentions = [];

        ranking.slice(0, 10).forEach(([id, advs], i) => {
            const medalha = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🔸";
            texto += `${medalha} @${id.split('@')[0]} → ${advs}/3\n`;
            mentions.push(id);
        });

        await sock.sendMessage(remoteJid, { text: texto, mentions });
    }
};
