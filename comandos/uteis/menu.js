// !menu - MENU PRINCIPAL
module.exports = {
    nome: "menu",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { getJogador } = require("../../servicos/jogador");
        const fs = require("fs");

        const jogador = getJogador(remetenteId, msg.pushName || 'Aventureiro');

        const texto = `
╭━━━〔 👑 *RPGBOT* 👑 〕━━━╮

👤 Jogador: ${jogador.nome}
⚔️ Classe: ${jogador.classe}
⭐ Nível: ${jogador.nivel}
✨ XP: ${jogador.xp}
💰 Saldo: R$ ${jogador.saldo}

━━━━━━━━━━━━━━━━━
📜 *MENU PRINCIPAL*
━━━━━━━━━━━━━━━━━

⚔️ RPG
💰 Economia
🎯 Missões
🧙 IA
🎮 Diversão
🎨 Mídia
👑 Administração
⚙️ Utilidades

━━━━━━━━━━━━━━━━━
📌 Digite o comando desejado.

!menurpg     → Comandos de RPG
!menueco     → Comandos de Economia
!menuia      → Sábios de Eldoria
!menudiv     → Diversão
!menumidia   → Mídia
!menuadmin   → Administração
!menuutils   → Utilidades

━━━━━━━━━━━━━━━━━
🤖 RPGBOT v1.1 BETA
👑 Desenvolvido por Wid
━━━━━━━━━━━━━━━━━
`;

        try {
            await sock.sendMessage(remoteJid, {
                image: fs.readFileSync("./imagensbot/file_00000000c380720e9fa24e772c715ada.png"),
                caption: texto
            });
        } catch (err) {
            await sock.sendMessage(remoteJid, { text: texto });
        }
    }
};
