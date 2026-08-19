// !falar - FALA COM NPC NA DUNGEON
const { getDungeon, getSalaAtual, gerarDialogoNPC } = require("../../servicos/dungeon");

module.exports = {
    nome: "falar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        // ===== VERIFICA SE ESTÁ EM UMA DUNGEON =====
        const dungeon = getDungeon(remetenteId);
        if (!dungeon) {
            return sock.sendMessage(remoteJid, {
                text: `╭━━━ ❌ *ERRO* ━━━╮\n\n` +
                      `❌ Você não está em uma dungeon!\n` +
                      `📌 Use !dungeon entrar para começar.\n\n` +
                      `╰━━━━━━━━━━━━━━━━━━━━╯`
            });
        }

        if (dungeon.finalizada) {
            return sock.sendMessage(remoteJid, {
                text: `╭━━━ 🏆 *DUNGEON CONCLUÍDA* ━━━╮\n\n` +
                      `🏆 Você já completou esta dungeon!\n` +
                      `📌 Use !dungeon entrar para começar outra.\n\n` +
                      `╰━━━━━━━━━━━━━━━━━━━━╯`
            });
        }

        // ===== VERIFICA SE A SALA TEM NPC =====
        const sala = getSalaAtual(remetenteId);
        const npc = sala?.npc;
        
        if (!npc) {
            return sock.sendMessage(remoteJid, {
                text: `╭━━━ 🧙 *SEM NPC* ━━━╮\n\n` +
                      `❌ Não há ninguém para falar aqui.\n` +
                      `📌 Use !dungeon status para ver a sala.\n\n` +
                      `╰━━━━━━━━━━━━━━━━━━━━╯`
            });
        }

        // ===== PEGA A MENSAGEM DO JOGADOR =====
        const jogadorNome = msg.pushName || "Aventureiro";
        const acao = args.join(" ") || "chegou na sua sala";

        // ===== MOSTRA "DIGITANDO..." =====
        await sock.sendMessage(remoteJid, { 
            text: `🧙 *${npc.nome} está refletindo...*` 
        });

        // ===== GERA DIÁLOGO COM IA =====
        const contexto = {
            nome: dungeon.nome,
            lore: dungeon.lore || "Uma masmorra antiga."
        };

        const dialogo = await gerarDialogoNPC(npc, jogadorNome, acao, contexto);

        // ===== ENVIA A RESPOSTA =====
        let texto = `╭━━━ 🧙 *${npc.nome}* ━━━╮\n\n`;
        texto += `"${dialogo}"\n\n`;
        texto += `╰━━━━━━━━━━━━━━━━━━━━╯`;

        await sock.sendMessage(remoteJid, { text: texto });
    }
};
