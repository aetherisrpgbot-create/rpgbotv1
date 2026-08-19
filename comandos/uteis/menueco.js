// !menueco - MENU ECONOMIA
module.exports = {
    nome: "menueco",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const texto = `
╭━━━〔 💰 *ECONOMIA* 💰 〕━━━╮

📜 *Comandos Financeiros*

!trabalhar   → Ganhar dinheiro
!descansar   → Recuperar energia
!acordar     → Acordar antes do descanso
!saldo       → Ver saldo
!depositar   → Depositar no banco
!sacar       → Sacar do banco
!rankrico    → Ranking de riqueza
!roubar      → Roubar alguém
!seguranca   → Contratar segurança

━━━━━━━━━━━━━━━━━
📌 Digite !menu para voltar.
`;

        await sock.sendMessage(remoteJid, { text: texto });
    }
};
