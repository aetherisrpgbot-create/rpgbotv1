// !missoes
const { gerarMissoes } = require("../../servicos/missoes");
const { getJogador } = require("../../servicos/jogador");

module.exports = {
    nome: "missoes",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const jogador = getJogador(remetenteId, msg.pushName || "Jogador");
        const missoes = gerarMissoes(remetenteId, jogador.nivel);

        if (!missoes || missoes.length === 0) {
            return sock.sendMessage(remoteJid, {
                text: "🎯 *Todas as missões foram concluídas!*\n\nVolte amanhã para novas missões."
            });
        }

        let texto = `🎯 *MISSÕES ATIVAS*\n`;
        texto += `👤 ${jogador.nome} | ⭐ Nível ${jogador.nivel}\n`;
        texto += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        for (const m of missoes) {
            const status = m.concluida ? "✅" : "⏳";
            const progresso = m.progresso || 0;
            const barra = criarBarraProgresso(progresso, m.quantidade);
            
            texto += `${status} *${m.nome}*\n`;
            texto += `   📝 ${m.descricao}\n`;
            texto += `   📊 ${barra} ${progresso}/${m.quantidade}\n`;
            texto += `   🎁 ${m.recompensa.xp || 0} XP | R$${m.recompensa.dinheiro || 0}\n\n`;
        }

        texto += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        texto += `💡 Complete uma missão e outra aparecerá!`;

        await sock.sendMessage(remoteJid, { text: texto });
    }
};

function criarBarraProgresso(atual, total) {
    const tamanho = 10;
    const preenchido = Math.min(Math.round((atual / total) * tamanho), tamanho);
    const vazio = tamanho - preenchido;
    return '█'.repeat(preenchido) + '░'.repeat(vazio);
}
