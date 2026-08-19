// !treino - COM IMAGENS, FADIGA, VERIFICAÇÃO E ATRIBUTOS
const { combatesAtivos, iniciarCombate } = require("./combate_estado");
const fs = require("fs");

module.exports = {
    nome: "treino",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { getJogador } = require("../../servicos/jogador");
        const { lerJogadores, escreverJogadores } = require("../../servicos/banco");
        const { getAtributosCombate } = require("../../utils/helpers");
        const { progressoMissao } = require("../../servicos/missoes");
        
        const jogador = getJogador(remetenteId, msg.pushName || "Usuário");
        const agora = Date.now();

        // ===== VERIFICA DESCANSO =====
        if (jogador.restEnd && jogador.restEnd > agora) {
            const restante = jogador.restEnd - agora;
            const minutos = Math.ceil(restante / 60000);
            return sock.sendMessage(remoteJid, {
                text: `😴 *Você está descansando!*\n\n⏳ Tempo restante: ${minutos} minuto(s).`
            });
        }

        // ===== VERIFICA SE ESTÁ MUITO CANSADO =====
        if (jogador.fatigue >= 80) {
            return sock.sendMessage(remoteJid, {
                text: `😵 *VOCÊ ESTÁ EXAUSTO!*\n\n` +
                      `💀 Cansaço: ${jogador.fatigue}%\n\n` +
                      `💤 Você está muito cansado para treinar!\n` +
                      `Use !descansar para se recuperar.`
            });
        }

        // ===== VERIFICA SE JÁ ESTÁ EM COMBATE =====
        if (combatesAtivos[remetenteId]) {
            return sock.sendMessage(remoteJid, { text: "⚔️ Você já está em combate!" });
        }

        // ===== SELECIONA DIFICULDADE =====
        const dificuldade = args[0]?.toLowerCase() || "normal";
        
        const dificuldades = {
            facil: { custoStamina: 0, multiplicador: 0.6, emoji: "🟢", nome: "FÁCIL", fatigue: 2 },
            normal: { custoStamina: 0, multiplicador: 1.0, emoji: "🟡", nome: "NORMAL", fatigue: 5 },
            dificil: { custoStamina: 0, multiplicador: 1.8, emoji: "🔴", nome: "DIFÍCIL", fatigue: 10 },
            chefe: { custoStamina: 0, multiplicador: 3.0, emoji: "💀", nome: "CHEFE", fatigue: 20 }
        };

        const config = dificuldades[dificuldade];
        if (!config) {
            return sock.sendMessage(remoteJid, {
                text: `⚔️ *DIFICULDADES DISPONÍVEIS:*\n\n` +
                      `🟢 *facil* - Fatigue: 2\n` +
                      `🟡 *normal* - Fatigue: 5\n` +
                      `🔴 *dificil* - Fatigue: 10\n` +
                      `💀 *chefe* - Fatigue: 20\n\n` +
                      `📌 *Use:* !treino <dificuldade>\n` +
                      `Exemplo: !treino chefe`
            });
        }

        // ===== SÓ DESCONTA FADIGA =====
        jogador.fatigue = Math.min(100, (jogador.fatigue || 0) + config.fatigue);

        // ===== INICIA COMBATE =====
        const inimigo = iniciarCombate(remetenteId, jogador.nivel, config.multiplicador);
        
        // ===== PEGA ATRIBUTOS COM ITENS =====
        const stats = getAtributosCombate(jogador);

        // ===== SALVA JOGADOR =====
        const dados = lerJogadores();
        dados[remetenteId] = jogador;
        escreverJogadores(dados);

        // ===== PROGRESSO DE MISSÃO (TREINAR) =====
        const missoesConcluidas = progressoMissao(remetenteId, "treinar");
        let msgMissao = "";
        if (missoesConcluidas.length > 0) {
            msgMissao = "\n🎯 *MISSÕES ATUALIZADAS!*\n";
            for (const m of missoesConcluidas) {
                msgMissao += `✅ *${m.nome}* concluída!\n`;
                if (m.recompensa.xp) msgMissao += `   ⭐ +${m.recompensa.xp} XP\n`;
                if (m.recompensa.dinheiro) msgMissao += `   💰 +R$${m.recompensa.dinheiro}\n`;
            }
        }

        // ===== MENSAGEM DE INÍCIO COM IMAGEM =====
        let imagemPath = "";
        if (inimigo.dificuldade === "facil") {
            imagemPath = `./imagens/inimigos/facil/vivo/${inimigo.imagem}_vivo.png`;
        } else if (inimigo.dificuldade === "normal") {
            imagemPath = `./imagens/inimigos/normal/vivo/${inimigo.imagem}_vivo.png`;
        } else if (inimigo.dificuldade === "dificil") {
            imagemPath = `./imagens/inimigos/dificil/vivo/${inimigo.imagem}_vivo.png`;
        } else if (inimigo.dificuldade === "chefe") {
            imagemPath = `./imagens/inimigos/chefe/vivo/${inimigo.imagem}_vivo.png`;
        } else {
            imagemPath = `./imagens/inimigos/facil/vivo/${inimigo.imagem}_vivo.png`;
        }

        const mensagem = `⚔️ *TREINO INICIADO!*\n\n` +
                  `${config.emoji} *DIFICULDADE: ${config.nome}*\n` +
                  `👹 ${inimigo.nome}\n` +
                  `📋 ${inimigo.descricao}\n` +
                  `⭐ Nível: ${inimigo.nivel}\n\n` +
                  `❤️ *Vida:* ${inimigo.vida}/${inimigo.vidaMax}\n` +
                  `⚔️ *Poder:* ${inimigo.poder}\n` +
                  `🛡️ *Defesa:* ${inimigo.defesa}\n\n` +
                  `━━━━━━━━━━━━━━━━━━━━━━\n` +
                  `📊 *SEUS ATRIBUTOS COM ITENS:*\n` +
                  `⚔️ Poder: ${stats.poder}\n` +
                  `🛡️ Defesa: ${stats.defesa}\n` +
                  `🎯 Crítico: ${stats.critico}%\n` +
                  `💨 Esquiva: ${stats.esquiva}%\n\n` +
                  `😵 +${config.fatigue} Fatigue (${jogador.fatigue}%)\n\n` +
                  `🎯 *COMANDOS:*\n` +
                  `!atacar - Ataque normal\n` +
                  `!usarskill <ID> - Habilidade\n` +
                  `!combo - 3 ataques seguidos\n` +
                  `!golpe - Super golpe\n` +
                  `!fugir - Tentar fugir` +
                  `${msgMissao}`;

        try {
            if (fs.existsSync(imagemPath)) {
                await sock.sendMessage(remoteJid, {
                    image: fs.readFileSync(imagemPath),
                    caption: mensagem
                });
            } else {
                await sock.sendMessage(remoteJid, { text: mensagem });
                console.log(`⚠️ Imagem não encontrada: ${imagemPath}`);
            }
        } catch (err) {
            console.log(`❌ Erro ao enviar imagem:`, err);
            await sock.sendMessage(remoteJid, { text: mensagem });
        }
    }
};
