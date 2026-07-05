// !criarperfil - Força criação do perfil
const { getJogador } = require("../../servicos/jogador");

module.exports = {
    nome: "criarperfil",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const jogador = getJogador(remetenteId, msg.pushName || "Usuário");
        
        await sock.sendMessage(remoteJid, {
            text: `✅ *Perfil criado/atualizado!*\n\n` +
                  `📋 Nome: ${jogador.nome}\n` +
                  `⭐ Nível: ${jogador.nivel}\n` +
                  `✨ XP: ${jogador.xp}\n` +
                  `💰 Saldo: R$${jogador.saldo}`
        });
    }
};
