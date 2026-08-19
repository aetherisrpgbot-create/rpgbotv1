// !responder - RESPONDE PUZZLE DA DUNGEON
const { getDungeon, getSalaAtual, getPuzzleAtual, avancarSala, finalizarDungeon, concluirSala, entregarRecompensa } = require("../../servicos/dungeon");
const { limparTexto } = require("../../utils/helpers");

module.exports = {
    nome: "responder",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const dungeon = getDungeon(remetenteId);
        if (!dungeon) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Você não está em uma dungeon!\n📌 Use !dungeon entrar para começar."
            });
        }

        if (dungeon.finalizada) {
            return sock.sendMessage(remoteJid, {
                text: "🏆 Você já completou esta dungeon!"
            });
        }

        const puzzle = getPuzzleAtual(remetenteId);
        if (!puzzle) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Não há puzzle nesta sala!"
            });
        }

        const sala = getSalaAtual(remetenteId);
        if (sala.inimigosVivos && sala.inimigosVivos.length > 0) {
            return sock.sendMessage(remoteJid, {
                text: `❌ Derrote todos os inimigos primeiro!\n👹 ${sala.inimigosVivos.length} inimigo(s) restante(s).`
            });
        }

        const resposta = args.join(" ").trim();
        if (!resposta) {
            let texto = `╭━━━ 🧩 *PUZZLE DA SALA* ━━━╮\n\n`;
            texto += `📝 ${puzzle.pergunta}\n`;
            if (puzzle.opcoes) {
                texto += `\n📌 Opções:\n`;
                for (const opcao of puzzle.opcoes) {
                    texto += `   • ${opcao}\n`;
                }
            }
            if (puzzle.dica) {
                texto += `\n💡 Dica: ${puzzle.dica}`;
            }
            texto += `\n\n📌 !responder <resposta>`;
            texto += `\n\n╰━━━━━━━━━━━━━━━━━━━━╯`;
            return sock.sendMessage(remoteJid, { text: texto });
        }

        const respostaLimpa = limparTexto(resposta);
        const respostaCorreta = limparTexto(puzzle.resposta);

        if (respostaLimpa !== respostaCorreta) {
            let texto = `╭━━━ ❌ *RESPOSTA ERRADA* ━━━╮\n\n`;
            texto += `🧩 ${puzzle.pergunta}\n`;
            if (puzzle.opcoes) {
                texto += `📌 Opções: ${puzzle.opcoes.join(" | ")}\n`;
            }
            texto += `\n📌 Tente novamente: !responder <resposta>`;
            texto += `\n\n╰━━━━━━━━━━━━━━━━━━━━╯`;
            return sock.sendMessage(remoteJid, { text: texto });
        }

        // ============================================================
        // ✅ RESPOSTA CERTA - CONCLUI SALA E AVANÇA
        // ============================================================
        await concluirSala(remetenteId);
        const resultado = avancarSala(remetenteId);

        if (!resultado.sucesso) {
            return sock.sendMessage(remoteJid, { text: `❌ ${resultado.erro}` });
        }

        // ============================================================
        // 🏆 DUNGEON CONCLUÍDA
        // ============================================================
        if (resultado.finalizada) {
            const recompensa = entregarRecompensa(remetenteId);
            const xp = recompensa?.xp || 0;
            const dinheiro = recompensa?.dinheiro || 0;
            const itemNome = recompensa?.itemNome || null;

            let texto = `╭━━━ 🏆 *DUNGEON CONCLUÍDA!* ━━━╮\n\n`;
            texto += `🎉 Parabéns, você completou ${dungeon.nome}!\n\n`;
            texto += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
            texto += `📊 *RECOMPENSAS:*\n`;
            texto += `⭐ +${xp} XP\n`;
            texto += `💰 +R$${dinheiro}`;
            if (itemNome && itemNome !== "null" && itemNome !== "") {
                texto += `\n🗡️ Item: ${itemNome}`;
            }
            texto += `\n\n╰━━━━━━━━━━━━━━━━━━━━╯`;

            finalizarDungeon(remetenteId);
            return sock.sendMessage(remoteJid, { text: texto });
        }

        // ============================================================
        // 🔥 TRANSIÇÃO PARA A PRÓXIMA SALA (COM DESTAQUE PARA O BOSS)
        // ============================================================
        const novaSala = getSalaAtual(remetenteId);
        const novoPuzzle = getPuzzleAtual(remetenteId);
        const novosInimigos = novaSala.inimigosVivos || [];
        const totalSalas = dungeon.salas.length;
        const ehBoss = dungeon.salaAtual === totalSalas - 1;

        let texto = `╭━━━ ✅ *RESPOSTA CORRETA!* ━━━╮\n\n`;

        // ===== 🔥 ANÚNCIO DO BOSS =====
        if (ehBoss && novaSala.boss) {
            texto += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
            texto += `👑 *SALA DO CHEFE!*\n`;
            texto += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            texto += `${novaSala.boss.fala_entrada || "Prepare-se para a batalha final!"}\n\n`;
            texto += `👹 *${novaSala.boss.nome}*\n`;
            texto += `📝 ${novaSala.boss.historia || "O guardião final da dungeon."}\n\n`;
        }

        texto += `📌 *${novaSala.nome}*\n`;
        texto += `📝 ${novaSala.ambiente}\n\n`;

        // ===== NPC =====
        if (novaSala.npc) {
            texto += `🧙 *NPC:* ${novaSala.npc.nome}\n`;
            texto += `   💬 "${novaSala.npc.fala_inicio || "..."}"\n`;
            texto += `   📌 !falar para interagir\n\n`;
        }

        // ===== INIMIGOS =====
        if (novosInimigos.length > 0) {
            texto += `👹 *Inimigos:*\n`;
            for (const ini of novosInimigos) {
                const isBoss = ini.dificuldade === "chefe";
                texto += `   ${isBoss ? '👑 ' : ''}${ini.nome} (Nv.${ini.nivel})\n`;
            }
            texto += `\n⚔️ !datacar para atacar.`;
        } else if (novoPuzzle) {
            texto += `🧩 *Puzzle:* ${novoPuzzle.pergunta}\n`;
            if (novoPuzzle.opcoes) {
                texto += `   Opções: ${novoPuzzle.opcoes.join(" | ")}\n`;
            }
            if (novoPuzzle.dica) {
                texto += `💡 Dica: ${novoPuzzle.dica}\n`;
            }
            texto += `\n📌 !responder <resposta>`;
        }

        texto += `\n\n╰━━━━━━━━━━━━━━━━━━━━╯`;
        return sock.sendMessage(remoteJid, { text: texto });
    }
};
