// ============================================================
// COMANDO DE TESTE - Verifica se a nova estrutura funciona
// ============================================================
const { getJogador, adicionarXP } = require("../servicos/jogador");

module.exports = {
    nome: "teste",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        
        // Pega o jogador usando a nova estrutura
        const jogador = getJogador(remetenteId, msg.pushName || "Teste");
        
        // Adiciona XP de teste
        const resultado = adicionarXP(remetenteId, jogador.nome, 5);
        
        await sock.sendMessage(remoteJid, {
            text: `✅ SISTEMA NOVO FUNCIONANDO!\n\n` +
                  `👤 Nome: ${jogador.nome}\n` +
                  `⭐ Nível: ${jogador.nivel}\n` +
                  `✨ XP: ${jogador.xp}\n` +
                  `💰 Saldo: R$${jogador.saldo}\n` +
                  `🏷️ Classe: ${jogador.classe}\n\n` +
                  `📦 Pastas criadas com sucesso!`
        });
    }
};
