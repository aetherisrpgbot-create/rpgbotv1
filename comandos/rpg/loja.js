// !loja - MOSTRA ITENS DISPONÍVEIS PARA COMPRA
const ITENS = require("../../dados/itens");

module.exports = {
    nome: "loja",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        // ===== FILTRA ITENS COM VALOR > 0 =====
        const itensLoja = Object.entries(ITENS).filter(([id, item]) => {
            return item.valor > 0; // Só itens compráveis
        });

        if (itensLoja.length === 0) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Nenhum item disponível na loja no momento."
            });
        }

        let texto = `╭━━━ 🛒 *LOJA DO AVENTUREIRO* ━━━╮\n\n`;

        for (const [id, item] of itensLoja) {
            texto += `📌 *${item.nome}*\n`;
            texto += `   🆔 ${id}\n`;
            texto += `   💰 R$${item.valor}\n`;
            if (item.ataque) texto += `   ⚔️ +${item.ataque} Ataque\n`;
            if (item.defesa) texto += `   🛡️ +${item.defesa} Defesa\n`;
            if (item.critico) texto += `   💥 +${item.critico}% Crítico\n`;
            if (item.esquiva) texto += `   💨 +${item.esquiva}% Esquiva\n`;
            texto += `\n`;
        }

        texto += `📌 !comprar <id> para comprar.\n`;
        texto += `\n╰━━━━━━━━━━━━━━━━━━━━╯`;

        await sock.sendMessage(remoteJid, { text: texto });
    }
};
