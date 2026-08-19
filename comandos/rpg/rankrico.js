// !rankrico - Ranking de riqueza (saldo + banco)
const { lerJogadores } = require("../../servicos/banco");

module.exports = {
    nome: "rankrico",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const dados = lerJogadores();
        
        // Calcula riqueza total (saldo + banco)
        const ranking = Object.entries(dados)
            .map(([id, data]) => ({
                id,
                nome: data.nome || "Desconhecido",
                saldo: data.saldo || 0,
                banco: data.banco || 0,
                total: (data.saldo || 0) + (data.banco || 0),
                nivel: data.nivel || 1
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        if (ranking.length === 0) {
            return sock.sendMessage(remoteJid, {
                text: "📊 Nenhum jogador encontrado!"
            });
        }

        let texto = `💰 *RANKING DE RIQUEZA*\n\n`;

        ranking.forEach((user, i) => {
            const medalha = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}º`;
            texto += `${medalha} *${user.nome}*\n`;
            texto += `   💰 Carteira: R$${user.saldo}\n`;
            texto += `   🏦 Banco: R$${user.banco}\n`;
            texto += `   💎 Total: R$${user.total}\n`;
            texto += `   ⭐ Nível: ${user.nivel}\n\n`;
        });

        await sock.sendMessage(remoteJid, { text: texto });
    }
};
