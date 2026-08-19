// !dano - CALCULA DANO DE ATAQUE, GOLPE, COMBO E SKILL
const { getJogador } = require("../../servicos/jogador");
const { getAtributosCombate } = require("../../utils/helpers");
const { CLASSES } = require("../../servicos/jogador");

module.exports = {
    nome: "dano",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const jogador = getJogador(remetenteId, msg.pushName || "Aventureiro");
        const stats = getAtributosCombate(jogador);

        const poder = stats.poder;
        const critico = stats.critico;

        // ===== ATAQUE NORMAL =====
        const ataqueMin = Math.floor(poder * 0.7);
        const ataqueMax = Math.floor(poder * 1.3);
        const ataqueCritico = Math.floor(ataqueMax * 2);

        // ===== GOLPE (Poder * 2 + crítico +10%) =====
        const golpeBase = poder * 2;
        const golpeMin = Math.floor(golpeBase * 0.7);
        const golpeMax = Math.floor(golpeBase * 1.3);
        const golpeCritico = Math.floor(golpeMax * 2);

        // ===== COMBO (3 ataques) =====
        const comboMin = Math.floor((poder * 0.7) * 3);
        const comboMax = Math.floor((poder * 1.3) * 3);
        const comboCritico = Math.floor(comboMax * 2);

        // ===== SKILL (dano da skill + poder/2) =====
        let skillsInfo = [];
        const classe = jogador.classe?.toLowerCase();
        if (CLASSES && CLASSES[classe]) {
            const skills = CLASSES[classe].skills || [];
            for (const skill of skills) {
                const skillBase = skill.dano + Math.floor(poder / 2);
                const skillMin = Math.floor(skillBase * 0.8);
                const skillMax = Math.floor(skillBase * 1.2);
                const skillCritico = Math.floor(skillMax * 2);
                skillsInfo.push({
                    nome: skill.nome,
                    id: skill.id,
                    min: skillMin,
                    max: skillMax,
                    critico: skillCritico,
                    nivel: skill.nivel,
                    custoMana: skill.custo_mana
                });
            }
        }

        // ===== MONTA MENSAGEM =====
        let mensagem = `
╔═══════════════════╗
  ⚔️ *DANO DE COMBATE*   
╚═══════════════════╝

👤 ${jogador.nome}
⚔️ Poder: ${poder}
💥 Crítico: ${critico}%

━━━━━━━━━━━━━━━━━━━

⚔️ *ATAQUE NORMAL*
   Mínimo: ${ataqueMin}  |  Máximo: ${ataqueMax}
   💥 Crítico: ${ataqueCritico}

💥 *GOLPE* (Poder × 2)
   Mínimo: ${golpeMin}  |  Máximo: ${golpeMax}
   💥 Crítico: ${golpeCritico}

🔥 *COMBO* (3 ataques)
   Mínimo: ${comboMin}  |  Máximo: ${comboMax}
   💥 Crítico: ${comboCritico}

━━━━━━━━━━━━━━━━━━━

`;

        // ===== ADICIONA SKILLS =====
        if (skillsInfo.length > 0) {
            mensagem += `✨ *SKILLS* (dano + poder/2)\n\n`;
            for (const s of skillsInfo) {
                mensagem += `   ${s.nome} (Nv.${s.nivel})\n`;
                mensagem += `      Dano: ${s.min}-${s.max}  |  💥 Crítico: ${s.critico}\n`;
                mensagem += `      💰 Mana: ${s.custoMana}\n\n`;
            }
        } else {
            mensagem += `✨ *SKILLS*\n   ❌ Nenhuma skill disponível.\n   Use !classe para escolher uma classe.\n`;
        }

        mensagem += `
━━━━━━━━━━━━━━━━━━━
📌 *Dica:* Crítico dobra o dano!
   Use !golpe, !combo ou !usarskill para atacar.
`;

        await sock.sendMessage(remoteJid, { text: mensagem });
    }
};
