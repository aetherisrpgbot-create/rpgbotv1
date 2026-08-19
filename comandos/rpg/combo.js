// !combo - COM IMAGEM MORTA, MISSÕES, RECOMPENSAS E PENALIDADE DE MORTE
const fs = require("fs");

module.exports = {
    nome: "combo",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { getJogador, adicionarXP, atualizarSaldo } = require("../../servicos/jogador");
        const { lerJogadores, escreverJogadores } = require("../../servicos/banco");
        const { getAtributosCombate } = require("../../utils/helpers");
        const { combatesAtivos, finalizarCombate } = require("./combate_estado");
        const { progressoMissao } = require("../../servicos/missoes");
        const { aplicarPenalidadeMorte } = require("../../utils/morte");
        const { comboDuelo, emDuelo } = require("../../servicos/duelo");

        // ===== PRIORIDADE 1: VERIFICA SE ESTÁ EM DUELO (PvP) =====
        const estaEmDuelo = emDuelo(remetenteId);

        if (estaEmDuelo.emDuelo) {
            const resultado = comboDuelo(remetenteId);
            if (!resultado.sucesso) {
                return sock.sendMessage(remoteJid, { text: `❌ ${resultado.erro}` });
            }

            const duelo = resultado.duelo;
            let msg = `🔥 *COMBO!*\n\n` +
                      `${resultado.logs.join("\n")}\n\n` +
                      `💥 *Dano total:* ${resultado.danoTotal}\n` +
                      `${resultado.criticoCount > 0 ? `💥 *Críticos:* ${resultado.criticoCount}\n` : ""}`;

            msg += `📊 *Status atual:*\n❤️ @${duelo.desafianteId.split('@')[0]}: ${duelo.vidaDesafiante}/${duelo.vidaMaxDesafiante}\n❤️ @${duelo.desafiadoId.split('@')[0]}: ${duelo.vidaDesafiado}/${duelo.vidaMaxDesafiado}`;

            if (resultado.vencedor) {
                msg += `\n\n🏆 *${resultado.vencedor === duelo.desafianteId ? 'DESAFIANTE' : 'DESAFIADO'} VENCEU!*\n⭐ @${resultado.vencedor.split('@')[0]} ganhou +${resultado.recompensa.vencedor.xp} XP e R$${resultado.recompensa.vencedor.dinheiro}!\n💔 @${resultado.perdedor.split('@')[0]} perdeu ${resultado.recompensa.perdedor.xp} XP e R$${resultado.recompensa.perdedor.dinheiro}.\n👏 Parabéns ao vencedor!`;
            } else {
                msg += `\n\n🎯 *Próximo turno:* @${duelo.turno.split('@')[0]}`;
            }

            await sock.sendMessage(remoteJid, { text: msg, mentions: [duelo.desafianteId, duelo.desafiadoId, duelo.turno] });
            return;
        }

        // ===== COMBATE NORMAL (PvE) =====
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
        let custoStamina = 10 + Math.floor(jogador.nivel * 1);
        if (custoStamina < 10) custoStamina = 10;
        if (custoStamina > 35) custoStamina = 35;

        if (jogador.stamina < custoStamina) {
            return sock.sendMessage(remoteJid, {
                text: `⚡ *Stamina insuficiente para combo!*\n\n` +
                      `💥 Necessário: ${custoStamina}\n` +
                      `⚡ Atual: ${jogador.stamina}`
            });
        }

        jogador.stamina -= custoStamina;

        // ===== EXECUTA COMBO =====
        let danoTotal = 0;
        let logs = [];
        let criticoCount = 0;

        for (let i = 0; i < 3; i++) {
            let dano = stats.poder + Math.floor(Math.random() * 8) - inimigo.defesa;
            if (dano < 1) dano = 1;

            let critico = false;
            if (Math.random() * 100 < stats.critico) {
                dano *= 2;
                critico = true;
                criticoCount++;
            }

            danoTotal += dano;
            logs.push(`⚔️ Golpe ${i + 1}: ${critico ? "💥 CRÍTICO " : ""}${dano}`);
        }

        inimigo.vida -= danoTotal;
        if (inimigo.vida < 0) inimigo.vida = 0;

        // ===== VITÓRIA =====
        if (inimigo.vida <= 0) {
            console.log("🔥 VITÓRIA!");

            let mult = 1;
            if (inimigo.dificuldade === "facil") mult = 0.5;
            else if (inimigo.dificuldade === "normal") mult = 1.0;
            else if (inimigo.dificuldade === "dificil") mult = 2.0;
            else if (inimigo.dificuldade === "chefe") mult = 4.0;

            const baseDinheiro = 70 + (inimigo.nivel * 25);
            const baseXP = 20 + (inimigo.nivel * 6);

            const recompensaDinheiro = Math.floor(baseDinheiro * mult);
            const recompensaXP = Math.floor(baseXP * mult);

            // ===== ADICIONA DINHEIRO =====
            jogador.saldo += recompensaDinheiro;

            // ===== ADICIONA XP =====
            const result = adicionarXP(remetenteId, jogador.nome, recompensaXP);

            // ===== 🔥 RECARREGA O JOGADOR PRA PEGAR O XP ATUALIZADO =====
            const jogadorAtualizado = getJogador(remetenteId, msg.pushName || "Usuário");
            
            // ===== 🔥 TRANSFERE O SALDO PRO JOGADOR ATUALIZADO =====
            jogadorAtualizado.saldo = jogador.saldo;

            // ===== SALVA O JOGADOR COM XP E SALDO =====
            dados[remetenteId] = jogadorAtualizado;
            escreverJogadores(dados);

            finalizarCombate(remetenteId);

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

            let bonusMsg = "";
            if (inimigo.dificuldade === "chefe") {
                bonusMsg = `\n👑 *CHEFE DERROTADO NO COMBO!* 👑\n🌟 *VOCÊ É LENDÁRIO!* 🌟\n\n`;
            } else if (inimigo.dificuldade === "dificil") {
                bonusMsg = `\n🔥 *VOCÊ DESTRUIU UM INIMIGO PODEROSO NO COMBO!* 🔥\n\n`;
            }

            const mensagem = `🏆 *COMBO FINALIZADO!*\n\n` +
                      `👹 ${inimigo.nome} derrotado!\n` +
                      `${bonusMsg}` +
                      `${logs.join("\n")}\n\n` +
                      `💥 *Dano total:* ${danoTotal}\n` +
                      `${criticoCount > 0 ? `💥 *Críticos:* ${criticoCount}\n` : ""}` +
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

        // ===== DERROTA =====
        if (jogador.vida <= 0) {
            finalizarCombate(remetenteId);

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
            text: `⚔️ *COMBO*\n\n` +
                  `👹 ${inimigo.nome}\n\n` +
                  `${logs.join("\n")}\n\n` +
                  `💥 *Dano total:* ${danoTotal}\n` +
                  `${criticoCount > 0 ? `💥 *Críticos:* ${criticoCount}\n` : ""}` +
                  `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                  `❤️ Sua vida: ${jogador.vida}/${jogador.vidaMax}\n` +
                  `👹 Vida do inimigo: ${inimigo.vida}/${inimigo.vidaMax}\n\n` +
                  `⚡ -${custoStamina} Stamina`
        });
    }
};
