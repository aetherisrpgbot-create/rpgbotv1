// !menuia - MENU SÁBIOS DE ELDORIA
module.exports = {
    nome: "menuia",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const texto = `
╭━━━〔 🧙 *SÁBIOS DE ELDORIA* 🧙 〕━━━╮

📜 *Comandos com Inteligência Artificial*

!oraculo     → Oráculo vê o futuro
!armeiro     → Dicas de armas e combate
!clerigo     → Poções e teologia
!mestre      → Ciência e história
!personagens → Ver todos os sábios

━━━━━━━━━━━━━━━━━
📌 Digite !menu para voltar.
`;

        await sock.sendMessage(remoteJid, { text: texto });
    }
};
