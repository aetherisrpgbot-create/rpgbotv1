// !perfil
module.exports = {
    nome: "perfil",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { getJogador } = require("../../servicos/jogador");
        const jogador = getJogador(remetenteId, msg.pushName || 'Usuário');

        const perfil = `
╔══════════════════╗
      👤 PERFIL
╚══════════════════╝

🏷️ Nome: ${jogador.nome}

🏷️ Classe: ${jogador.classe}

❤️ Vida: ${jogador.vida}/${jogador.vidaMax}
⚔️ Poder: ${jogador.poder}
🛡️ Defesa: ${jogador.defesa}
🎯 Crítico: ${jogador.critico}%
💨 Esquiva: ${jogador.esquiva}%

⭐ Nível: ${jogador.nivel}
✨ XP: ${jogador.xp}/${jogador.nivel * 100}

💰 Carteira: R$${jogador.saldo}
🏦 Banco: R$${jogador.banco}

⚔️ A aventura apenas começou...

⚡ Stamina: ${jogador.stamina}/${jogador.maxStamina}
😵 Cansaço: ${jogador.fatigue}%
`;

        await sock.sendMessage(remoteJid, { text: perfil });
    }
};
