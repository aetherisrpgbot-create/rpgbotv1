// !ranking
module.exports = {
    nome: "ranking",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { getRankingXP } = require("../../servicos/jogador");
        
        const ranking = getRankingXP().slice(0, 10);
        let texto = `🏆 ════ RANKING GLOBAL ════ 🏆\n\n`;

        ranking.forEach((user, index) => {
            const nome = user.nome || 'Desconhecido';
            texto += `#${index + 1} 👤 ${nome}\n⭐ Nível: ${user.nivel}\n✨ XP: ${user.xp}\n\n`;
        });

        await sock.sendMessage(remoteJid, { text: texto });
    }
};
