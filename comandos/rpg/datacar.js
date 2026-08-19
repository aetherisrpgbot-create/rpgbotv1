// !datacar - ATACA NA DUNGEON (COM STAMINA)
const { getDungeon, getInimigosVivos, removerInimigo, getSalaAtual, finalizarDungeon, concluirSala } = require("../../servicos/dungeon");
const { getJogador, adicionarXP } = require("../../servicos/jogador");
const { getAtributosCombate } = require("../../utils/helpers");
const { lerJogadores, escreverJogadores } = require("../../servicos/banco");

module.exports = {
    nome: "datacar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const dungeon = getDungeon(remetenteId);
        if (!dungeon) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Você não está em uma dungeon!"
            });
        }

        const inimigos = getInimigosVivos(remetenteId);
        if (inimigos.length === 0) {
            const sala = getSalaAtual(remetenteId);
            let texto = `✅ *Todos os inimigos foram derrotados!*\n\n`;
            if (sala?.puzzle) {
                texto += `🧩 *Puzzle:* ${sala.puzzle.pergunta}\n`;
                if (sala.puzzle.dica) {
                    texto += `💡 Dica: ${sala.puzzle.dica}\n`;
                }
                texto += `\n📌 !responder <resposta>`;
            }
            return sock.sendMessage(remoteJid, { text: texto });
        }

        const jogador = getJogador(remetenteId, msg.pushName || "Usuário");
        const stats = getAtributosCombate(jogador);
        const inimigo = inimigos[0];
        const ehBoss = inimigo.dificuldade === "chefe";

        // ============================================================
        // ⚡ GASTA STAMINA
        // ============================================================
        const CUSTO_STAMINA = 2;
        
        if (jogador.stamina < CUSTO_STAMINA) {
            return sock.sendMessage(remoteJid, {
                text: `╭━━━ ⚡ *STAMINA INSUFICIENTE* ━━━╮\n\n` +
                      `❌ Você não tem stamina suficiente para atacar!\n` +
                      `⚡ Necessário: ${CUSTO_STAMINA}\n` +
                      `⚡ Atual: ${jogador.stamina}\n\n` +
                      `💤 Use !descansar para recuperar.\n` +
                      `\n╰━━━━━━━━━━━━━━━━━━━━╯`
            });
        }

        jogador.stamina -= CUSTO_STAMINA;

        // ===== ATAQUE =====
        let dano = stats.poder + Math.floor(Math.random() * 10) - (inimigo.defesa || 5);
        if (dano < 1) dano = 1;

        inimigo.vidaAtual -= dano;
        if (inimigo.vidaAtual < 0) inimigo.vidaAtual = 0;

        // ============================================================
        // 💬 MENSAGENS DO BOSS
        // ============================================================
        let bossFala = "";
        if (ehBoss) {
            const vidaPercentual = (inimigo.vidaAtual / inimigo.vidaMax) * 100;
            const sala = getSalaAtual(remetenteId);
            const bossData = sala?.boss;
            
            if (bossData) {
                if (inimigo.vidaAtual <= 0) {
                    bossFala = `\n👑 *${bossData.fala_derrota || "Você me derrotou... Use o Fragmento com sabedoria."}*\n`;
                } else if (vidaPercentual < 30) {
                    bossFala = `\n👑 *${bossData.fala_dano || "Você... me surpreende... mas ainda não é o bastante!"}*\n`;
                } else if (vidaPercentual < 60) {
                    bossFala = `\n👑 *${bossData.fala_dano || "Você é mais forte do que eu imaginava..."}*\n`;
                } else {
                    bossFala = `\n👑 *${bossData.fala_entrada || "Você tem coragem, ou é só mais um tolo?"}*\n`;
                }
            }
        }

        // ===== MONTAR MENSAGEM =====
        let texto = `╭━━━ ⚔️ *ATAQUE NA DUNGEON* ━━━╮\n\n`;
        
        if (ehBoss) {
            texto += `👑 *${inimigo.nome}*\n`;
            texto += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
        } else {
            texto += `🎯 ${inimigo.nome}\n`;
        }
        
        texto += `💥 Dano: *${dano}*\n`;
        texto += `❤️ ${inimigo.vidaAtual}/${inimigo.vidaMax}\n`;
        texto += `⚡ -${CUSTO_STAMINA} Stamina (${jogador.stamina}/${jogador.maxStamina})\n`;
        
        if (bossFala) {
            texto += bossFala;
        }

        // ============================================================
        // 💀 MORREU
        // ============================================================
        if (inimigo.vidaAtual <= 0) {
            const idx = inimigos.indexOf(inimigo);
            removerInimigo(remetenteId, idx);

            const xpGanho = inimigo.xp || 30;
            const dinheiroGanho = inimigo.dinheiro || 20;

            jogador.saldo += dinheiroGanho;
            const result = adicionarXP(remetenteId, jogador.nome, xpGanho);

            const jogadorAtualizado = getJogador(remetenteId, msg.pushName || "Usuário");
            jogadorAtualizado.saldo = jogador.saldo;
            jogadorAtualizado.stamina = jogador.stamina;

            const dadosAtualizados = lerJogadores();
            dadosAtualizados[remetenteId] = jogadorAtualizado;
            escreverJogadores(dadosAtualizados);

            texto += `\n━━━━━━━━━━━━━━━━━━━━━━━\n`;
            texto += `✅ *${inimigo.nome} derrotado!*\n`;
            texto += `💰 +${dinheiroGanho}\n`;
            texto += `⭐ +${xpGanho} XP\n`;
            if (result.subiu) {
                texto += `🎉 Subiu para o nível ${result.nivel}!\n`;
            }

            const restantes = getInimigosVivos(remetenteId);

            if (restantes.length === 0) {
                await concluirSala(remetenteId);
                texto += `\n━━━━━━━━━━━━━━━━━━━━━━━\n`;
                
                // ===== MENSAGEM ESPECIAL SE FOR BOSS =====
                if (ehBoss) {
                    texto += `👑 *CHEFE DERROTADO!*\n`;
                    texto += `🏰 *SALA DO CHEFE CONCLUÍDA!*\n`;
                } else {
                    texto += `🏰 *SALA CONCLUÍDA!*\n`;
                }
                texto += `✅ Todos os inimigos derrotados!\n\n`;

                const sala = getSalaAtual(remetenteId);
                if (sala?.puzzle) {
                    texto += `🧩 *Puzzle:* ${sala.puzzle.pergunta}\n`;
                    if (sala.puzzle.dica) {
                        texto += `💡 Dica: ${sala.puzzle.dica}\n`;
                    }
                    texto += `\n📌 !responder <resposta>`;
                }
            } else {
                texto += `\n👹 Restam: ${restantes.length}`;
            }
        } else {
            // ============================================================
            // 👹 ATAQUE DO INIMIGO
            // ============================================================
            let danoInimigo = (inimigo.poder || 10) + Math.floor(Math.random() * 6) - (stats.defesa || 5);
            if (danoInimigo < 1) danoInimigo = 1;

            jogador.vida -= danoInimigo;
            if (jogador.vida < 0) jogador.vida = 0;

            const dados = lerJogadores();

            // ============================================================
            // 💀 MORTE
            // ============================================================
            if (jogador.vida <= 0) {
                const xpPerdido = Math.floor(jogador.xp * 0.10);
                const dinheiroPerdido = Math.floor(jogador.saldo * 0.05);

                jogador.xp = Math.max(0, jogador.xp - xpPerdido);
                jogador.saldo = Math.max(0, jogador.saldo - dinheiroPerdido);
                jogador.vida = Math.floor(jogador.vidaMax * 0.3);
                jogador.stamina = Math.floor(jogador.maxStamina * 0.5);

                dados[remetenteId] = jogador;
                escreverJogadores(dados);
                finalizarDungeon(remetenteId);

                texto = `╭━━━ 💀 *VOCÊ MORREU!* ━━━╮\n\n`;
                texto += `👹 ${inimigo.nome} foi mais forte...\n\n`;
                texto += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
                texto += `📊 *PENALIDADES:*\n`;
                texto += `⭐ -${xpPerdido} XP\n`;
                texto += `💰 -R$${dinheiroPerdido}\n`;
                texto += `💚 Vida: ${jogador.vida}/${jogador.vidaMax}\n`;
                texto += `⚡ Stamina: ${jogador.stamina}/${jogador.maxStamina}\n\n`;
                texto += `🏃 Você foi expulso da dungeon!\n`;
                texto += `\n╰━━━━━━━━━━━━━━━━━━━━╯`;

                return sock.sendMessage(remoteJid, { text: texto });
            }

            dados[remetenteId] = jogador;
            escreverJogadores(dados);

            texto += `\n━━━━━━━━━━━━━━━━━━━━━━━\n`;
            texto += `👹 ${inimigo.nome} atacou! 💥 *${danoInimigo}*\n`;
            texto += `❤️ ${jogador.vida}/${jogador.vidaMax}`;
        }

        texto += `\n\n╰━━━━━━━━━━━━━━━━━━━━╯`;
        await sock.sendMessage(remoteJid, { text: texto });
    }
};
