// !descansar - COM NOME DA PESSOA E DESIGN MELHORADO
module.exports = {
    nome: "descansar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { getJogador } = require("../../servicos/jogador");
        const { lerJogadores, escreverJogadores } = require("../../servicos/banco");
        
        const jogador = getJogador(remetenteId, msg.pushName || 'Usuário');
        const agora = Date.now();

        // ===== VERIFICA SE JÁ ESTÁ DESCANSANDO =====
        if (jogador.restEnd && jogador.restEnd > agora) {
            const restante = jogador.restEnd - agora;
            const minutos = Math.ceil(restante / 60000);
            const segundos = Math.ceil(restante / 1000);
            
            let tempoMsg = "";
            if (minutos > 0) {
                tempoMsg = `${minutos} minuto(s)`;
            } else {
                tempoMsg = `${segundos} segundo(s)`;
            }
            
            return sock.sendMessage(remoteJid, {
                text: `😴 *${jogador.nome} já está descansando!*\n\n` +
                      `⏳ Falta *${tempoMsg}* para acordar.\n\n` +
                      `💤 Relaxe e espere o descanso acabar.`
            });
        }

        // ===== VERIFICA SE PRECISA DESCANSAR =====
        if (jogador.stamina >= jogador.maxStamina && jogador.fatigue <= 0) {
            return sock.sendMessage(remoteJid, {
                text: `💪 *${jogador.nome} está cheio de energia!*\n\n` +
                      `⚡ Stamina: ${jogador.stamina}/${jogador.maxStamina}\n` +
                      `😵 Cansaço: ${jogador.fatigue}%\n\n` +
                      `Você não precisa descansar agora. Volte a trabalhar! 💼`
            });
        }

        // ===== CALCULA TEMPO DE DESCANSO =====
        const base = 2 * 60 * 1000; // 2 minutos base
        const tempoNivel = jogador.nivel * 5 * 1000; // +5s por nível
        const tempoFatigue = jogador.fatigue * 5 * 1000; // +5s por % de fatigue
        const tempoStamina = (jogador.maxStamina - jogador.stamina) * 200; // +200ms por stamina faltando
        
        let tempo = base + tempoNivel + tempoFatigue + tempoStamina;
        const MAX_REST = 10 * 60 * 1000; // 10 minutos máximo
        const MIN_REST = 1 * 60 * 1000; // 1 minuto mínimo
        
        if (tempo > MAX_REST) tempo = MAX_REST;
        if (tempo < MIN_REST) tempo = MIN_REST;

        // ===== INICIA DESCANSO =====
        jogador.restEnd = agora + tempo;

        const dados = lerJogadores();
        dados[remetenteId] = jogador;
        escreverJogadores(dados);

        // ===== CALCULA QUANTO VAI RECUPERAR =====
        const staminaRecuperada = jogador.maxStamina - jogador.stamina;
        const fatigueReduzida = jogador.fatigue;

        const minutos = Math.floor(tempo / 60000);
        const segundos = Math.floor((tempo % 60000) / 1000);
        const tempoMsg = minutos > 0 ? `${minutos}m${segundos}s` : `${segundos}s`;

        // ===== EMOJIS DE STATUS =====
        let statusEmoji = "";
        let statusMsg = "";
        if (jogador.fatigue >= 80) {
            statusEmoji = "💀";
            statusMsg = "EXAUSTO! Descanse urgentemente!";
        } else if (jogador.fatigue >= 50) {
            statusEmoji = "😩";
            statusMsg = "Muito cansado, bom descanso!";
        } else if (jogador.fatigue >= 20) {
            statusEmoji = "😊";
            statusMsg = "Um pouco cansado, descanse um pouco.";
        } else {
            statusEmoji = "😄";
            statusMsg = "Só uma pausa rápida!";
        }

        await sock.sendMessage(remoteJid, {
            text: `💤 *${jogador.nome} começou a descansar!*\n\n` +
                  `⏳ Tempo: *${tempoMsg}*\n` +
                  `${statusEmoji} Status: ${statusMsg}\n\n` +
                  `━━━━━━━━━━━━━━━━━━━━━━\n` +
                  `📊 *ANTES DO DESCANSO:*\n` +
                  `⚡ Stamina: ${jogador.stamina}/${jogador.maxStamina}\n` +
                  `😵 Cansaço: ${jogador.fatigue}%\n` +
                  `❤️ Vida: ${jogador.vida}/${jogador.vidaMax}\n\n` +
                  `━━━━━━━━━━━━━━━━━━━━━━\n` +
                  `🎯 *APÓS O DESCANSO VOCÊ VAI RECUPERAR:*\n` +
                  `⚡ +${staminaRecuperada} de Stamina\n` +
                  `😵 -${fatigueReduzida}% de Cansaço\n` +
                  `❤️ Vida totalmente restaurada\n\n` +
                  `💤 Durma bem, ${jogador.nome}! Zzz...`
        });
    }
};
