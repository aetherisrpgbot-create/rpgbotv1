// !menudiv - MENU DIVERSÃO
module.exports = {
    nome: "menudiv",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const texto = `
╭━━━〔 🎮 *DIVERSÃO* 🎮 〕━━━╮

📜 *Comandos de Entretenimento*

!dado        → Rolar dado 🎲
!moeda       → Cara ou coroa 🪙
!8ball       → Pergunta ao destino 🔮
!sorteio     → Número aleatório 🎯
!pergunta    → Quiz de conhecimento
!resposta    → Responder quiz
!rankquiz    → Ranking do quiz
!marcar      → Mencionar todos

━━━━━━━━━━━━━━━━━
📌 Digite !menu para voltar.
`;

        await sock.sendMessage(remoteJid, { text: texto });
    }
};
