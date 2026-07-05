// !rankquiz - Ranking dos melhores do quiz
module.exports = {
    nome: "rankquiz",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { lerJogadores } = require("../../servicos/banco");
        
        const dados = lerJogadores();
        
        // Filtra quem já respondeu perguntas
        const jogadores = Object.entries(dados)
            .filter(([id, data]) => data.perguntasHoje > 0 || data.errosHoje > 0)
            .map(([id, data]) => ({
                id,
                nome: data.nome || "Anônimo",
                acertos: data.perguntasHoje || 0,
                erros: data.errosHoje || 0
            }))
            .sort((a, b) => b.acertos - a.acertos)
            .slice(0, 10);

        if (jogadores.length === 0) {
            return sock.sendMessage(remoteJid, {
                text: "📚 Ninguém respondeu perguntas ainda!\n\nUse !pergunta para começar!"
            });
        }

        let texto = `
╔═══════════════════════════════════╗
║  📚 RANKING DO QUIZ 📚           ║
╚═══════════════════════════════════╝

`;

        jogadores.forEach((jogador, index) => {
            const medalha = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "👤";
            const total = jogador.acertos + jogador.erros;
            const taxa = total > 0 ? Math.round((jogador.acertos / total) * 100) : 0;
            
            texto += `${medalha} *${jogador.nome}*\n`;
            texto += `   ✅ Acertos: ${jogador.acertos}\n`;
            texto += `   ❌ Erros: ${jogador.erros}\n`;
            texto += `   🎯 Taxa: ${taxa}%\n\n`;
        });

        texto += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        texto += `📝 Use !pergunta para jogar!`;

        await sock.sendMessage(remoteJid, { text: texto });
    }
};
