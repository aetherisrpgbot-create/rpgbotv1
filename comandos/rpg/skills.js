// !skills - Mostra habilidades da classe
const { getJogador, CLASSES } = require("../../servicos/jogador");

module.exports = {
    nome: "skills",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const jogador = getJogador(remetenteId, msg.pushName || "Jogador");
            
            // Verifica se o jogador tem classe
            if (!jogador.classe || jogador.classe === "Sem Classe") {
                return sock.sendMessage(remoteJid, {
                    text: `❌ *Você ainda não escolheu uma classe!*\n\n` +
                          `Use !classe para escolher:\n` +
                          `!classe guerreiro\n` +
                          `!classe mago\n` +
                          `!classe arqueiro\n` +
                          `!classe assassino`
                });
            }

            // 🔥 PEGA A CLASSE DO JOGADOR
            const classeNome = jogador.classe.toLowerCase();
            const classe = CLASSES[classeNome];

            if (!classe) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ *Classe "${jogador.classe}" não encontrada!*\n\n` +
                          `Use !classe para escolher uma classe válida.`
                });
            }

            // 🔥 MOSTRA AS SKILLS
            let texto = `⚔️ *SKILLS DA CLASSE ${jogador.classe.toUpperCase()}*\n\n`;
            texto += `⭐ Seu nível: ${jogador.nivel}\n`;
            texto += `🔵 Mana: ${jogador.mana}/${jogador.manaMax}\n\n`;
            texto += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

            for (const skill of classe.skills) {
                const status = jogador.nivel >= skill.nivel ? "✅" : "🔒";
                texto += `${status} *${skill.nome}*\n`;
                texto += `   🆔 ID: ${skill.id}\n`;
                texto += `   ⭐ Nível necessário: ${skill.nivel}\n`;
                texto += `   💥 Dano: ${skill.dano}\n`;
                texto += `   ⚡ Mana: ${skill.custo_mana}\n`;
                texto += `   ⏳ Cooldown: ${skill.cooldown}s\n\n`;
            }

            texto += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            texto += `💡 *Para usar:* !usarskill <id>\n`;
            texto += `📌 Exemplo: !usarskill golpe_forte`;

            await sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.log("ERRO skills:", err);
            await sock.sendMessage(remoteJid, {
                text: "❌ Erro ao carregar skills. Tente novamente."
            });
        }
    }
};
