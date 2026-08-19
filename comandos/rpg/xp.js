// !xp - Mostra XP com logs
const { lerJogadores } = require("../../servicos/banco");

module.exports = {
    nome: "xp",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        console.log(`📊 !xp chamado por ${remetenteId}`);
        
        // 🔥 LÊ DIRETO DO ARQUIVO
        const dados = lerJogadores();
        console.log(`📊 Total de jogadores no arquivo: ${Object.keys(dados).length}`);
        
        const jogador = dados[remetenteId];
        console.log(`📊 Jogador encontrado? ${jogador ? 'SIM' : 'NÃO'}`);
        
        if (!jogador) {
            console.log(`❌ Jogador ${remetenteId} NÃO encontrado no ARQ_JOGADOR.json`);
            return sock.sendMessage(remoteJid, {
                text: "❌ Você ainda não tem um perfil.\nUse !menu para começar!"
            });
        }
        
        console.log(`📊 XP do jogador: ${jogador.xp}`);
        console.log(`📊 Nível do jogador: ${jogador.nivel}`);
        
        const nivel = jogador.nivel || 1;
        const xp = jogador.xp || 0;
        const xpNecessario = nivel * 100;
        const progresso = Math.floor((xp / xpNecessario) * 100);
        
        const barraSize = 20;
        const preenchido = Math.floor((xp / xpNecessario) * barraSize);
        const vazio = barraSize - preenchido;
        const barra = '█'.repeat(preenchido) + '░'.repeat(vazio);

        const mensagem = `
╔═══════════════════╗
   📊 *STATUS DE XP* 
╚═══════════════════╝

👤 *${jogador.nome || "Jogador"}*

⭐ Nível: *${nivel}*
✨ XP: *${xp}* / *${xpNecessario}*

📊 Progresso: *${progresso}%*
${barra}

━━━━━━━━━━━━━━━━━━━━━
🏷️ Classe: ${jogador.classe || "Sem Classe"}
💪 Stamina: ${jogador.stamina || 100}/${jogador.maxStamina || 100}
😵 Cansaço: ${jogador.fatigue || 0}%

💡 Dicas:
• Mande mensagens para ganhar XP
• Use !trabalhar para ganhar XP e dinheiro
• Treine para ganhar XP em batalhas
`;

        console.log(`📊 Enviando mensagem com XP: ${xp}`);
        await sock.sendMessage(remoteJid, { text: mensagem });
    }
};
