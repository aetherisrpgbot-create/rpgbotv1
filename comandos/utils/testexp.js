// !testexp - Testa se o XP está funcionando
const { getJogador, adicionarXP } = require("../../servicos/jogador");

module.exports = {
    nome: "testexp",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const jogador = getJogador(remetenteId, msg.pushName || "Teste");
        
        // Pega o XP antes
        const xpAntes = jogador.xp;
        const nivelAntes = jogador.nivel;
        
        // Adiciona 10 XP
        const result = adicionarXP(remetenteId, jogador.nome, 10);
        
        // Pega o XP depois
        const jogadorDepois = getJogador(remetenteId, msg.pushName || "Teste");
        
        await sock.sendMessage(remoteJid, {
            text: `🧪 *TESTE DE XP*\n\n` +
                  `📊 ANTES:\n` +
                  `   Nível: ${nivelAntes}\n` +
                  `   XP: ${xpAntes}\n\n` +
                  `📊 DEPOIS:\n` +
                  `   Nível: ${jogadorDepois.nivel}\n` +
                  `   XP: ${jogadorDepois.xp}\n\n` +
                  `📊 RESULTADO:\n` +
                  `   XP adicionado: 10\n` +
                  `   Subiu de nível: ${result.subiu ? '✅ SIM' : '❌ NÃO'}\n` +
                  `   Níveis ganhos: ${result.niveisGanhos || 0}\n` +
                  `   Nível atual: ${result.nivel}`
        });
    }
};
