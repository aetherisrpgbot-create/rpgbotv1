// !dungeon - SISTEMA DE DUNGEON (PADRÃO MENU)
const { 
    iniciarDungeon,
    getDungeon,
    finalizarDungeon,
    getSalaAtual,
    getInimigosVivos,
    avancarSala,
    entregarRecompensa
} = require("../../servicos/dungeon");

module.exports = {
    nome: "dungeon",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const sub = args[0]?.toLowerCase() || "menu";

        // ============================================================
        // 📋 MENU PRINCIPAL
        // ============================================================
        if (sub === "menu" || !sub) {
            const dungeon = getDungeon(remetenteId);
            
            let texto = `╭━━━ 🏰 *DUNGEON* ━━━╮\n\n`;
            
            if (dungeon) {
                texto += `📍 ${dungeon.nome}\n`;
                texto += `📌 Sala ${dungeon.salaAtual + 1}/${dungeon.salas.length}\n\n`;
                texto += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
                texto += `📌 !dungeon status - Ver sala\n`;
                texto += `📌 !dungeon sair - Sair\n`;
                texto += `⚔️ !datacar - Atacar\n`;
                texto += `🧩 !responder - Puzzle\n`;
            } else {
                texto += `📌 Você não está em uma dungeon.\n\n`;
                texto += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
                texto += `📌 !dungeon listar - Ver dungeons\n`;
                texto += `📌 !dungeon entrar <id> - Entrar\n`;
            }
            
            texto += `\n╰━━━━━━━━━━━━━━━━━━━━╯`;
            return sock.sendMessage(remoteJid, { text: texto });
        }

        // ============================================================
        // 📋 LISTAR DUNGEONS
        // ============================================================
        if (sub === "listar") {
            const texto = `╭━ 🏰 *DUNGEONS DISPONÍVEIS* ━╮\n\n` +
                          `📌 🏚️ Catacumbas de Vhalor (Nv.3+)\n` +
                          `   🆔 !dungeon entrar catacumbas_de_vhalor\n\n` +
                          `━━━━━━━━━━━━━━━━━━━━━━━\n` +
                          `📌 Mais em breve...\n` +
                          `\n╰━━━━━━━━━━━━━━━━━━━━╯`;
            return sock.sendMessage(remoteJid, { text: texto });
        }

        // ============================================================
        // 🚪 ENTRAR NA DUNGEON
        // ============================================================
        if (sub === "entrar") {
            const dungeonId = args[1] || "catacumbas_de_vhalor";
            const resultado = iniciarDungeon(remetenteId, dungeonId);
            
            if (resultado.erro) {
                return sock.sendMessage(remoteJid, { text: `❌ ${resultado.erro}` });
            }

            const dungeon = resultado.dungeon;
            const sala = getSalaAtual(remetenteId);
            const inimigos = getInimigosVivos(remetenteId);
            
            let texto = `╭━━━ 🏰 *${dungeon.nome}* ━━━╮\n\n`;
            texto += `📝 ${dungeon.subtitulo}\n\n`;
            texto += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
            texto += `📌 *${sala.nome}*\n`;
            texto += `📝 ${sala.ambiente}\n\n`;
            
            if (inimigos.length > 0) {
                texto += `👹 *Inimigos:*\n`;
                for (const ini of inimigos) {
                    texto += `   ${ini.nome} (Nv.${ini.nivel})\n`;
                }
                texto += `\n⚔️ !datacar para atacar.`;
            } else {
                texto += `✅ *Sem inimigos vivos!*\n`;
                if (sala?.puzzle) {
                    texto += `\n🧩 *Puzzle:* ${sala.puzzle.pergunta}\n`;
                    if (sala.puzzle.dica) {
                        texto += `💡 Dica: ${sala.puzzle.dica}\n`;
                    }
                    texto += `\n📌 !responder <resposta>`;
                }
            }
            
            texto += `\n\n╰━━━━━━━━━━━━━━━━━━━━╯`;
            return sock.sendMessage(remoteJid, { text: texto });
        }

        // ============================================================
        // 📊 STATUS
        // ============================================================
        if (sub === "status") {
            const dungeon = getDungeon(remetenteId);
            if (!dungeon) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Você não está em uma dungeon!"
                });
            }

            const sala = getSalaAtual(remetenteId);
            const inimigos = getInimigosVivos(remetenteId);
            
            let texto = `╭━━━ 🏰 *${dungeon.nome}* ━━━╮\n\n`;
            texto += `📌 Sala ${dungeon.salaAtual + 1}/${dungeon.salas.length}\n\n`;
            texto += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
            texto += `📌 *${sala.nome}*\n`;
            texto += `📝 ${sala.ambiente}\n\n`;
            
            if (inimigos.length > 0) {
                texto += `👹 *Inimigos:*\n`;
                for (const ini of inimigos) {
                    texto += `   ${ini.nome} (Nv.${ini.nivel}) ❤️${ini.vidaAtual}/${ini.vidaMax}\n`;
                }
                texto += `\n⚔️ !datacar para atacar.`;
            } else if (sala?.puzzle) {
                texto += `🧩 *Puzzle:* ${sala.puzzle.pergunta}\n`;
                if (sala.puzzle.dica) {
                    texto += `💡 Dica: ${sala.puzzle.dica}\n`;
                }
                texto += `\n📌 !responder <resposta>`;
            } else {
                texto += `✅ *Sala concluída!*`;
                const resultado = avancarSala(remetenteId);
                if (resultado.finalizada) {
                    const recompensa = entregarRecompensa(remetenteId);
                    texto += `\n\n🏆 *DUNGEON CONCLUÍDA!*\n`;
                    texto += `⭐ +${recompensa.xp || 0} XP\n`;
                    texto += `💰 +R$${recompensa.dinheiro || 0}`;
                    if (recompensa.itemNome) {
                        texto += `\n🗡️ Item: ${recompensa.itemNome}`;
                    }
                    finalizarDungeon(remetenteId);
                }
            }
            
            texto += `\n\n╰━━━━━━━━━━━━━━━━━━━━╯`;
            return sock.sendMessage(remoteJid, { text: texto });
        }

        // ============================================================
        // 🏃 SAIR
        // ============================================================
        if (sub === "sair") {
            const dungeon = getDungeon(remetenteId);
            if (!dungeon) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Você não está em uma dungeon."
                });
            }
            finalizarDungeon(remetenteId);
            return sock.sendMessage(remoteJid, {
                text: `╭━━━ 🏃 *SAIU DA DUNGEON* ━━━╮\n\n` +
                      `📌 Você saiu da dungeon.\n` +
                      `📌 Progresso perdido.\n` +
                      `\n╰━━━━━━━━━━━━━━━━━━━━╯`
            });
        }

        // ============================================================
        // 🆘 AJUDA
        // ============================================================
        return sock.sendMessage(remoteJid, {
            text: `╭━ 🏰 *DUNGEON - AJUDA* ━╮\n\n` +
                  `📌 !dungeon - Menu\n` +
                  `📌 !dungeon listar - Ver dungeons\n` +
                  `📌 !dungeon entrar <id> - Entrar\n` +
                  `📌 !dungeon status - Ver progresso\n` +
                  `📌 !dungeon sair - Sair\n\n` +
                  `⚔️ !datacar - Atacar\n` +
                  `🧩 !responder - Responder puzzle\n` +
                  `\n╰━━━━━━━━━━━━━━━━━━━━╯`
        });
    }
};
