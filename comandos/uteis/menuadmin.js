// !menuadmin - MENU ADMIN
module.exports = {
    nome: "menuadmin",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const texto = `
╭━━━〔 👑 *ADMINISTRAÇÃO* 👑 〕━━━╮

📜 *Comandos de Administração*

!ban         → Banir usuário
!promover    → Promover a admin
!rebaixar    → Rebaixar admin
!mute        → Mutar usuário
!unmute      → Desmutar usuário
!adv         → Advertir usuário
!rmadv       → Remover advertência
!limparadv   → Limpar advertências
!consultadv  → Consultar advertências
!rankadv     → Ranking de advertências
!resetmissoes → Resetar missões
!antiviewonce → Proteção viewonce
!fechar      → Fechar o grupo
!abrir       → Abrir o grupo

━━━━━━━━━━━━━━━━━
📌 Digite !menu para voltar.
`;

        await sock.sendMessage(remoteJid, { text: texto });
    }
};
