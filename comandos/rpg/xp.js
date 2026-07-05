// !xp - LÊ DIRETO DO ARQUIVO
const { lerJogadores } = require("../../servicos/banco");

module.exports = {
    nome: "xp",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        // 🔥 LÊ DIRETO DO ARQUIVO
        const dados = lerJogadores();
        const jogador = dados[remetenteId];
        
        if (!jogador) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Você ainda não tem um perfil.\nUse !menu para começar!"
            });
        }
        
        const xpNecessario = jogador.nivel * 100;
        
        const mensagem = `
📊 ═════ STATUS DE XP ═════ 📊

👤 ${jogador.nome || "Jogador"}

⭐ Nível: ${jogador.nivel || 1}
✨ XP: ${jogador.xp || 0}/${xpNecessario}

🔥 Continue sua jornada para subir de nível!
`;

        await sock.sendMessage(remoteJid, { text: mensagem });
    }
};
