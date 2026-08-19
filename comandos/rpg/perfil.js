// !perfil - Mostra perfil completo
const { lerJogadores } = require("../../servicos/banco");
const { getAtributosCombate } = require("../../utils/helpers");

module.exports = {
    nome: "perfil",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        // 🔥 LÊ DIRETO DO ARQUIVO
        const dados = lerJogadores();
        const jogador = dados[remetenteId];
        
        if (!jogador) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Você ainda não tem um perfil.\nUse !menu para começar!"
            });
        }
        
        const stats = getAtributosCombate(jogador);

        const perfil = `
╔══════════════════╗
      👤 PERFIL
╚══════════════════╝

🏷️ Nome: ${jogador.nome || "Jogador"}

🏷️ Classe: ${jogador.classe || "Sem Classe"}

━━━━━━━━━━━━━━━━
📊 *ATRIBUTOS:*
❤️ Vida: ${jogador.vida || 100}/${jogador.vidaMax || 100}
⚔️ Poder: ${stats.poder || 10}
🛡️ Defesa: ${stats.defesa || 5}
🎯 Crítico: ${stats.critico || 5}%
💨 Esquiva: ${stats.esquiva || 3}%

━━━━━━━━━━━━━━━━
⭐ Nível: ${jogador.nivel || 1}
✨ XP: ${jogador.xp || 0}/${(jogador.nivel || 1) * 100}

💰 Carteira: R$${jogador.saldo || 0}
🏦 Banco: R$${jogador.banco || 0}

⚡ Stamina: ${jogador.stamina || 100}/${jogador.maxStamina || 100}
😵 Cansaço: ${jogador.fatigue || 0}%
`;

        await sock.sendMessage(remoteJid, { text: perfil });
    }
};
