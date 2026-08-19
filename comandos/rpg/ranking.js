// !ranking - Ranking global de jogadores
const { lerJogadores } = require("../../servicos/banco");

module.exports = {
    nome: "ranking",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const dados = lerJogadores();
        
        // ===== FILTRA E ORDENA =====
        const ranking = Object.entries(dados)
            .filter(([id, data]) => data.nivel > 0 || data.xp > 0)
            .map(([id, data]) => ({
                id,
                nome: data.nome || "Desconhecido",
                nivel: data.nivel || 1,
                xp: data.xp || 0,
                saldo: data.saldo || 0,
                classe: data.classe || "Sem Classe"
            }))
            .sort((a, b) => b.nivel - a.nivel || b.xp - a.xp)
            .slice(0, 10);

        if (ranking.length === 0) {
            return sock.sendMessage(remoteJid, {
                text: "📊 Nenhum jogador encontrado!"
            });
        }

        // ===== MONTA O RANKING =====
        let texto = `🏆 *RANKING GLOBAL*\n\n`;

        ranking.forEach((user, i) => {
            const medalha = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}º`;
            
            texto += `${medalha} *${user.nome}*\n`;
            texto += `   🏷️ ${user.classe}\n`;
            texto += `   ⭐ Nível: ${user.nivel}\n`;
            texto += `   ✨ XP: ${user.xp}\n`;
            texto += `   💰 R$${user.saldo}\n\n`;
        });

        // ===== TOTAL DE JOGADORES =====
        const totalJogadores = Object.keys(dados).length;
        texto += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        texto += `👥 Total: ${totalJogadores} jogadores`;

        await sock.sendMessage(remoteJid, { text: texto });
    }
};
