// !menuutils - MENU UTILIDADES
module.exports = {
    nome: "menuutils",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const texto = `
╭━━━〔 ⚙️ *UTILIDADES* ⚙️ 〕━━━╮

📜 *Comandos Úteis*

!ping        → Testar o bot
!menu        → Menu principal

━━━━━━━━━━━━━━━━━
📌 Digite !menu para voltar.
`;

        await sock.sendMessage(remoteJid, { text: texto });
    }
};
