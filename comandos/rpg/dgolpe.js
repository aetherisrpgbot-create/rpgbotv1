// !dgolpe - GOLPE NA DUNGEON (VERSÃO ROBUSTA)
const { getJogador, adicionarXP, atualizarSaldo } = require("../../servicos/jogador");
const { lerJogadores, escreverJogadores } = require("../../servicos/banco");
const { getAtributosCombate } = require("../../utils/helpers");
const { isDefesaAtiva, aplicarReducaoDefesa } = require("../../servicos/combate");
const { 
    getDungeon, 
    getInimigosVivos, 
    removerInimigo, 
    finalizarDungeon, 
    getPuzzleAtual,
    concluirSala
} = require("../../servicos/dungeon");

module.exports = {
    nome: "dgolpe",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const dungeon = getDungeon(remetenteId);
        if (!dungeon || dungeon.finalizada) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Você não está em uma dungeon ativa!"
            });
        }

        const inimigos = getInimigosVivos(remetenteId);
        if (inimigos.length === 0) {
            const puzzle = getPuzzleAtual(remetenteId);
            let msg = `✅ *Todos os inimigos foram derrotados!*\n\n`;
            if (puzzle) {
                msg += `🧩 *Puzzle:* ${puzzle.pergunta}\n`;
                if (puzzle.opcoes) {
                    msg += `   Opções: ${puzzle.opcoes.join(" | ")}\n`;
                }
                msg += `\n📌 !responder <resposta>`;
            }
            return sock.sendMessage(remoteJid, { text: msg });
        }

        const jogador = getJogador(remetenteId, msg.pushName || "Usuário");
        const stats = getAtributosCombate(jogador);
        const inimigo = inimigos[0];
        const dados = lerJogadores();

        // ===== GOLPE =====
        let dano = stats.poder * 2 + Math.floor(Math.random() * 10) - inimigo.defesa;
        if (dano < 1) dano = 1;

        let critico = false;
        if (Math.random() * 100 < stats.critico + 10) {
            dano *= 2;
            critico = true;
        }

        inimigo.vida -= dano;
        if (inimigo.vida < 0) inimigo.vida = 0;

        let resposta = `💥 *GOLPE NA DUNGEON!*\n\n`;
        resposta += `🎯 ${inimigo.nome} (Nv.${inimigo.nivel})\n`;
        resposta += `💥 Dano: *${dano}*${critico ? " 💥 CRÍTICO!" : ""}\n`;
        resposta += `❤️ ${inimigo.vida}/${inimigo.vidaMax}\n\n`;

        if (inimigo.vida <= 0) {
            const resultado = removerInimigo(remetenteId, inimigo.id);
            if (!resultado.sucesso) {
                return sock.sendMessage(remoteJid, { text: `❌ ${resultado.erro}` });
            }

            jogador.saldo += inimigo.dinheiro;
            const result = adicionarXP(remetenteId, jogador.nome, inimigo.xp);
            dados[remetenteId] = jogador;
            escreverJogadores(dados);

            resposta += `✅ *${inimigo.nome} derrotado!*\n`;
            resposta += `💰 +R$${inimigo.dinheiro}\n`;
            resposta += `⭐ +${inimigo.xp} XP\n`;

            const restantes = getInimigosVivos(remetenteId);
            if (restantes.length === 0) {
                await concluirSala(remetenteId);
                const puzzle = getPuzzleAtual(remetenteId);
                resposta += `\n✅ *Todos derrotados!*\n`;
                if (puzzle) {
                    resposta += `\n🧩 *Puzzle:* ${puzzle.pergunta}\n`;
                    if (puzzle.opcoes) {
                        resposta += `   Opções: ${puzzle.opcoes.join(" | ")}\n`;
                    }
                    resposta += `\n📌 !responder <resposta>`;
                }
            } else {
                resposta += `\n👹 Restam: ${restantes.length}`;
            }
        } else {
            let danoInimigo = inimigo.poder + Math.floor(Math.random() * 6) - stats.defesa;
            if (danoInimigo < 1) danoInimigo = 1;

            if (isDefesaAtiva(inimigo)) {
                danoInimigo = aplicarReducaoDefesa(inimigo, danoInimigo);
            }

            jogador.vida -= danoInimigo;
            if (jogador.vida < 0) jogador.vida = 0;

            dados[remetenteId] = jogador;
            escreverJogadores(dados);

            resposta += `👹 ${inimigo.nome} atacou! 💥 *${danoInimigo}*\n`;

            if (jogador.vida <= 0) {
                resposta += `\n💀 *VOCÊ MORREU!*\n🏃 !dungeon sair`;
                finalizarDungeon(remetenteId);
            }
        }

        await sock.sendMessage(remoteJid, { text: resposta });
    }
};
