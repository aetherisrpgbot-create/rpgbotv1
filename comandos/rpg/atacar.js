// !atacar - COM IMAGEM MORTA, MISSÕES E RECOMPENSAS
const fs = require("fs");

module.exports = {
    nome: "atacar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { getJogador, adicionarXP, atualizarSaldo } = require("../../servicos/jogador");
        const { lerJogadores, escreverJogadores } = require("../../servicos/banco");
        const { getAtributosCombate } = require("../../utils/helpers");
        const { combatesAtivos, finalizarCombate } = require("./combate_estado");
        const { progressoMissao } = require("../../servicos/missoes");
        const { atacarDuelo, emDuelo } = require("../../servicos/duelo");
	const { isDefesaAtiva, aplicarReducaoDefesa } = require("../../servicos/combate");

        // ===== PRIORIDADE 1: VERIFICA SE ESTÁ EM DUELO (PvP) =====
        const estaEmDuelo = emDuelo(remetenteId);

        if (estaEmDuelo.emDuelo) {
            const resultado = atacarDuelo(remetenteId);
            if (!resultado.sucesso) {
                return sock.sendMessage(remoteJid, { text: `❌ ${resultado.erro}` });
            }

            const duelo = resultado.duelo;
            let msg = `⚔️ *ATAQUE!*\n\n`;
            if (resultado.esquivou) {
                msg += `💨 @${resultado.nomeDefensor} *ESQUIVOU* do ataque!\n\n`;
            } else {
                msg += `💥 @${resultado.nomeAtacante} causou *${resultado.dano}* de dano!\n`;
                if (resultado.critico) msg += `💥 *ACERTO CRÍTICO!*\n`;
                msg += `\n`;
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

        // ===== ATAQUE DO JOGADOR =====
        let dano = stats.poder + Math.floor(Math.random() * 10) - inimigo.defesa;
        if (dano < 1) dano = 1;

        let critico = false;
        if (Math.random() * 100 < stats.critico) {
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

            let mult = 1;
            if (inimigo.dificuldade === "facil") mult = 0.5;
            else if (inimigo.dificuldade === "normal") mult = 1.0;
            else if (inimigo.dificuldade === "dificil") mult = 2.0;
            else if (inimigo.dificuldade === "chefe") mult = 4.0;

            const baseDinheiro = 50 + (inimigo.nivel * 20);
            const baseXP = 10 + (inimigo.nivel * 5);

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

            const mensagem = `🏆 *VITÓRIA!*\n\n` +
                      `👹 ${inimigo.nome} derrotado!\n` +
                      `📊 Dificuldade: ${inimigo.dificuldade.toUpperCase()} (x${mult})\n\n` +
                      `⚔️ Dano: *${dano}*\n` +
                      `${critico ? "💥 *ACERTO CRÍTICO!*\n" : ""}` +
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
if (danoInimigo < 1) {
    danoInimigo = 1;
}

// ===== 🔥 APLICA REDUÇÃO DE DEFESA SE ATIVA =====
if (isDefesaAtiva(inimigo)) {
    danoInimigo = aplicarReducaoDefesa(inimigo, danoInimigo);
}


        let esquivou = false;
        if (Math.random() * 100 < stats.esquiva) {
            danoInimigo = 0;
            esquivou = true;
        }

        jogador.vida -= danoInimigo;
        if (jogador.vida < 0) {
            jogador.vida = 0;
        }

        // ===== DERROTA =====
        if (jogador.vida <= 0) {
            finalizarCombate(remetenteId);

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
            text: `⚔️ *COMBATE*\n\n` +
                  `👹 ${inimigo.nome}\n\n` +
                  `${critico ? "💥 *ACERTO CRÍTICO!*\n" : ""}` +
                  `⚔️ Você causou *${dano}* de dano.\n\n` +
                  `${esquivou
                      ? "💨 *Você esquivou do ataque!*"
                      : `👹 O inimigo causou *${danoInimigo}* de dano.`}\n\n` +
                  `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                  `❤️ Sua vida: ${jogador.vida}/${jogador.vidaMax}\n` +
                  `👹 Vida do inimigo: ${inimigo.vida}/${inimigo.vidaMax}\n\n` +
                  `⚔️ Digite !atacar para continuar`
        });
    }
};
