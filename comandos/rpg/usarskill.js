// !usarskill - COM IMAGEM MORTA, MISSÕES, RECOMPENSAS E PENALIDADE DE MORTE
const fs = require("fs");

module.exports = {
    nome: "usarskill",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { getJogador, adicionarXP, atualizarSaldo, CLASSES } = require("../../servicos/jogador");
        const { lerJogadores, escreverJogadores } = require("../../servicos/banco");
        const { getAtributosCombate } = require("../../utils/helpers");
        const { combatesAtivos, finalizarCombate } = require("./combate_estado");
        const { progressoMissao } = require("../../servicos/missoes");
        const { aplicarPenalidadeMorte } = require("../../utils/morte");
        const { skillDuelo, emDuelo } = require("../../servicos/duelo");

        try {
            const nomeSkill = args.join(" ").toLowerCase();
            
            // ===== PRIORIDADE 1: VERIFICA SE ESTÁ EM DUELO (PvP) =====
            const estaEmDuelo = emDuelo(remetenteId);

            if (estaEmDuelo.emDuelo) {
                const resultado = skillDuelo(remetenteId, nomeSkill);
                if (!resultado.sucesso) {
                    return sock.sendMessage(remoteJid, { text: `❌ ${resultado.erro}` });
                }

                const duelo = resultado.duelo;
                let msg = `⚔️ *${resultado.nomeSkill}*\n\n`;
                if (resultado.esquivou) {
                    msg += `💨 @${resultado.nomeDefensor} *ESQUIVOU* da skill!\n\n`;
                } else {
                    msg += `💥 @${resultado.nomeAtacante} causou *${resultado.dano}* de dano!\n`;
                    if (resultado.critico) msg += `💥 *ACERTO CRÍTICO NA SKILL!*\n`;
                    msg += `🔵 Mana restante: ${resultado.manaRestante}\n\n`;
                }
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
            const jogador = getJogador(remetenteId, msg.pushName || "Jogador");

            if (!jogador.classe || jogador.classe === "Sem Classe") {
                return sock.sendMessage(remoteJid, {
                    text: `❌ *Você não possui classe!*\n\nUse !classe para escolher uma.`
                });
            }

            const classeNome = jogador.classe.toLowerCase();
            const classe = CLASSES[classeNome];

            if (!classe) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ *Classe "${jogador.classe}" não encontrada!*`
                });
            }

            const skill = classe.skills.find(s => s.id === nomeSkill);

            if (!skill) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ *Skill não encontrada!*\n\nUse !skills para ver todas.`
                });
            }

            if (jogador.nivel < skill.nivel) {
                return sock.sendMessage(remoteJid, {
                    text: `🔒 *Skill bloqueada!*\n\n⭐ Nível necessário: ${skill.nivel}\n📊 Seu nível: ${jogador.nivel}`
                });
            }

            const inimigo = combatesAtivos[remetenteId];
            if (!inimigo) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ *Você não está em combate!*\n\nUse !treino para iniciar."
                });
            }

            // ===== COOLDOWN =====
            const agora = Date.now();
            if (!jogador.cooldowns) jogador.cooldowns = {};

            if (jogador.cooldowns[skill.id] && jogador.cooldowns[skill.id] > agora) {
                const restante = Math.ceil((jogador.cooldowns[skill.id] - agora) / 1000);
                return sock.sendMessage(remoteJid, {
                    text: `⏳ *Skill em cooldown!*\n\nRestante: ${restante}s`
                });
            }

            // ===== VERIFICA MANA =====
            if (jogador.mana < skill.custo_mana) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ *Mana insuficiente!*\n\n🔵 Necessário: ${skill.custo_mana}\n🔵 Atual: ${jogador.mana}`
                });
            }

            // ===== USA A SKILL =====
            jogador.mana -= skill.custo_mana;
            jogador.cooldowns[skill.id] = agora + (skill.cooldown * 1000);

            const stats = getAtributosCombate(jogador);
            let dano = skill.dano + Math.floor(stats.poder / 2) - inimigo.defesa;
            if (dano < 1) dano = 1;

            let critico = false;
            if (Math.random() * 100 < stats.critico) {
                dano *= 2;
                critico = true;
            }

            inimigo.vida -= dano;
            if (inimigo.vida < 0) inimigo.vida = 0;

            const dados = lerJogadores();

            // ===== VITÓRIA =====
            if (inimigo.vida <= 0) {
                console.log("🔥 VITÓRIA!");

                let mult = 1;
                if (inimigo.dificuldade === "facil") mult = 0.5;
                else if (inimigo.dificuldade === "normal") mult = 1.0;
                else if (inimigo.dificuldade === "dificil") mult = 2.0;
                else if (inimigo.dificuldade === "chefe") mult = 4.0;

                const baseDinheiro = 50 + (inimigo.nivel * 20);
                const baseXP = 20 + (inimigo.nivel * 6);

                const recompensaDinheiro = Math.floor(baseDinheiro * mult);
                const recompensaXP = Math.floor(baseXP * mult);

                // ===== ADICIONA DINHEIRO =====
                jogador.saldo += recompensaDinheiro;

                // ===== ADICIONA XP =====
                const result = adicionarXP(remetenteId, jogador.nome, recompensaXP);

                // ===== 🔥 RECARREGA O JOGADOR PRA PEGAR O XP ATUALIZADO =====
                const jogadorAtualizado = getJogador(remetenteId, msg.pushName || "Jogador");
                
                // ===== 🔥 TRANSFERE O SALDO PRO JOGADOR ATUALIZADO =====
                jogadorAtualizado.saldo = jogador.saldo;

                // ===== SALVA O JOGADOR COM XP E SALDO =====
                dados[remetenteId] = jogadorAtualizado;
                escreverJogadores(dados);

                finalizarCombate(remetenteId);

                const missoesConcluidas = progressoMissao(remetenteId, "skills");
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
                    bonusMsg = `\n👑 *VOCÊ DERROTOU UM CHEFE COM SKILL!* 👑\n🌟 *GLÓRIA ETERNA!* 🌟\n`;
                }

                const mensagem = `⚔️ *${skill.nome}*\n\n` +
                          `💥 Dano: *${dano}*\n` +
                          `${critico ? "💥 *ACERTO CRÍTICO NA SKILL!*\n" : ""}` +
                          `🔵 Mana: ${jogadorAtualizado.mana}/${jogadorAtualizado.manaMax}\n\n` +
                          `🏆 *INIMIGO DERROTADO!*\n` +
                          `${bonusMsg}` +
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

            dados[remetenteId] = jogador;
            escreverJogadores(dados);

            await sock.sendMessage(remoteJid, {
                text: `⚔️ *${skill.nome}*\n\n` +
                      `💥 Dano: *${dano}*\n` +
                      `${critico ? "💥 *ACERTO CRÍTICO NA SKILL!*\n" : ""}` +
                      `🔵 Mana: ${jogador.mana}/${jogador.manaMax}\n\n` +
                      `👹 *Vida do inimigo:* ${inimigo.vida}/${inimigo.vidaMax}`
            });

        } catch (err) {
            console.log("ERRO usarskill:", err);
            await sock.sendMessage(remoteJid, {
                text: "❌ Erro ao usar skill. Tente novamente."
            });
        }
    }
};
