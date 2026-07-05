// !golpe - COM IMAGEM MORTA, MISSÕES E RECOMPENSAS
const fs = require("fs");

module.exports = {
    nome: "golpe",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { getJogador, adicionarXP, atualizarSaldo } = require("../../servicos/jogador");
        const { lerJogadores, escreverJogadores } = require("../../servicos/banco");
        const { getAtributosCombate } = require("../../utils/helpers");
        const { combatesAtivos, finalizarCombate } = require("./combate_estado");
        const { progressoMissao } = require("../../servicos/missoes");

        const combate = combatesAtivos[remetenteId];
        if (!combate) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Você não está em combate. Use !treino"
            });
        }

        const dados = lerJogadores();
        const jogador = getJogador(remetenteId, msg.pushName || "Usuário");
        const stats = getAtributosCombate(jogador);
        const inimigo = combate;

        // ===== VERIFICA STAMINA =====
        let custoStamina = 2 + Math.floor(jogador.nivel * 0.8);
        if (custoStamina < 2) custoStamina = 2;
        if (custoStamina > 10) custoStamina = 10;

        if (jogador.stamina < custoStamina) {
            return sock.sendMessage(remoteJid, {
                text: `⚡ *Stamina insuficiente!*\n\n` +
                      `💥 Necessário: ${custoStamina}\n` +
                      `⚡ Atual: ${jogador.stamina}`
            });
        }

        jogador.stamina -= custoStamina;

        // ===== DANO DO GOLPE =====
        let dano = stats.poder * 2 + Math.floor(Math.random() * 10) - inimigo.defesa;
        if (dano < 1) dano = 1;

        let critico = false;
        if (Math.random() * 100 < stats.critico + 10) {
            dano *= 2;
            critico = true;
        }

        inimigo.vida -= dano;
        if (inimigo.vida < 0) {
            inimigo.vida = 0;
        }

        // ===== VITÓRIA =====
        if (inimigo.vida <= 0) {
            console.log("🔥 VITÓRIA!");

            // ===== MULTIPLICADORES POR DIFICULDADE =====
            let mult = 1;
            if (inimigo.dificuldade === "facil") mult = 0.5;
            else if (inimigo.dificuldade === "normal") mult = 1.0;
            else if (inimigo.dificuldade === "dificil") mult = 2.0;
            else if (inimigo.dificuldade === "chefe") mult = 4.0;

            const baseDinheiro = 80 + (inimigo.nivel * 30);
            const baseXP = 25 + (inimigo.nivel * 8);

            const recompensaDinheiro = Math.floor(baseDinheiro * mult);
            const recompensaXP = Math.floor(baseXP * mult);

            // ===== ADICIONA RECOMPENSAS =====
            jogador.saldo += recompensaDinheiro;
            const result = adicionarXP(remetenteId, jogador.nome, recompensaXP);

            // ===== SALVA JOGADOR =====
            dados[remetenteId] = jogador;
            escreverJogadores(dados);

            // ===== FINALIZA COMBATE =====
            finalizarCombate(remetenteId);

            // ===== PROGRESSO DE MISSÃO =====
            const missoesConcluidas = progressoMissao(remetenteId, "matar");
            
            let msgMissao = "";
            if (missoesConcluidas.length > 0) {
                msgMissao = "\n🎯 *MISSÕES ATUALIZADAS!*\n";
                for (const m of missoesConcluidas) {
                    msgMissao += `✅ *${m.nome}* concluída!\n`;
                    if (m.recompensa.xp) msgMissao += `   ⭐ +${m.recompensa.xp} XP\n`;
                    if (m.recompensa.dinheiro) msgMissao += `   💰 +R$${m.recompensa.dinheiro}\n`;
                }
            }

            // ===== MENSAGEM =====
            let imagemPath = "";
            if (inimigo.dificuldade === "facil") {
                imagemPath = `./imagens/inimigos/facil/morto/${inimigo.imagem}_morto.png`;
            } else if (inimigo.dificuldade === "normal") {
                imagemPath = `./imagens/inimigos/normal/morto/${inimigo.imagem}_morto.png`;
            } else if (inimigo.dificuldade === "dificil") {
                imagemPath = `./imagens/inimigos/dificil/morto/${inimigo.imagem}_morto.png`;
            } else if (inimigo.dificuldade === "chefe") {
                imagemPath = `./imagens/inimigos/chefe/morto/${inimigo.imagem}_morto.png`;
            } else {
                imagemPath = `./imagens/inimigos/facil/morto/${inimigo.imagem}_morto.png`;
            }

            const mensagem = `💥 *SUPER GOLPE FINAL!*\n\n` +
                      `👹 ${inimigo.nome} foi destruído!\n` +
                      `📊 Dificuldade: ${inimigo.dificuldade.toUpperCase()} (x${mult})\n\n` +
                      `⚔️ Dano: *${dano}*\n` +
                      `${critico ? "💥 *CRÍTICO DUPLO!*\n" : ""}` +
                      `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                      `💰 +R$${recompensaDinheiro}\n` +
                      `⭐ +${recompensaXP} XP\n\n` +
                      (result.subiu
                          ? `🎉 Você subiu ${result.niveisGanhos || 1} nível(is)!\n🏅 Nível atual: ${result.nivel}`
                          : "") +
                      `${msgMissao}`;

            try {
                if (fs.existsSync(imagemPath)) {
                    await sock.sendMessage(remoteJid, {
                        image: fs.readFileSync(imagemPath),
                        caption: mensagem
                    });
                } else {
                    await sock.sendMessage(remoteJid, { text: mensagem });
                }
            } catch (err) {
                await sock.sendMessage(remoteJid, { text: mensagem });
            }

            return;
        }

        // ===== ATAQUE DO INIMIGO =====
        let danoInimigo = inimigo.poder + Math.floor(Math.random() * 6) - stats.defesa;
        if (danoInimigo < 1) danoInimigo = 1;

        let esquivou = false;
        if (Math.random() * 100 < stats.esquiva) {
            danoInimigo = 0;
            esquivou = true;
        }

        jogador.vida -= danoInimigo;
        if (jogador.vida < 0) jogador.vida = 0;

// ===== DERROTA =====
if (jogador.vida <= 0) {
    finalizarCombate(remetenteId);

    // ===== APLICA PENALIDADE =====
    const { aplicarPenalidadeMorte } = require("../../utils/morte");
    const penalidade = aplicarPenalidadeMorte(jogador);

    dados[remetenteId] = jogador;
    escreverJogadores(dados);

    return sock.sendMessage(remoteJid, {
        text: `💀 *DERROTA!*\n\n` +
              `Você foi derrotado por ${inimigo.nome}.\n\n` +
              `━━━━━━━━━━━━━━━━━━━━━━\n` +
              `📊 *PENALIDADES:*\n` +
              `⭐ -${penalidade.perdaXP} XP\n` +
              `💰 -R$${penalidade.perdaDinheiro}\n` +
              `⚡ -${penalidade.perdaStamina} Stamina\n` +
              `😵 +${penalidade.fatigueGanha} Fatigue\n\n` +
              `❤️ Vida restaurada.\n\n` +
              `Use !descansar para se recuperar.`
    });
}

        // ===== SALVA ESTADO =====
        dados[remetenteId] = jogador;
        escreverJogadores(dados);

        await sock.sendMessage(remoteJid, {
            text: `💥 *SUPER GOLPE!*\n\n` +
                  `👹 ${inimigo.nome}\n\n` +
                  `⚔️ Dano: *${dano}*\n` +
                  `${critico ? "💥 *CRÍTICO!*\n" : ""}` +
                  `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                  `❤️ Sua vida: ${jogador.vida}/${jogador.vidaMax}\n` +
                  `👹 Vida do inimigo: ${inimigo.vida}/${inimigo.vidaMax}\n\n` +
                  `⚡ -${custoStamina} Stamina\n\n` +
                  `Digite !golpe novamente`
        });
    }
};
