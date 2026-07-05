// !loja
const ITENS = require("../../dados/itens");
const { verificarCombate } = require("../../utils/combate");

module.exports = {
    nome: "loja",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        let texto = `🛒 *LOJA DO RPG*\n\n`;

// ===== VERIFICA SE ESTÁ EM COMBATE =====
const combateCheck = verificarCombate(remetenteId);
if (combateCheck.bloqueado) {
    return sock.sendMessage(remoteJid, { text: combateCheck.mensagem });
}

        // Agrupa por tipo
        const tipos = {
            arma: "⚔️ ARMAS",
            armadura: "🛡️ ARMADURAS",
            acessorio: "💍 ACESSÓRIOS",
            consumivel: "🧪 CONSUMÍVEIS"
        };

        for (const tipo of Object.keys(tipos)) {
            const itens = Object.values(ITENS).filter(item => item.tipo === tipo);
            if (itens.length === 0) continue;
            
            texto += `━━━ ${tipos[tipo]} ━━━\n`;
            for (const item of itens) {
                texto += `📦 ${item.nome}\n`;
                texto += `   🆔 ${item.id}\n`;
                texto += `   💰 R$${item.valor}\n`;
                if (item.classe) texto += `   🏷️ ${item.classe}\n`;
                texto += `\n`;
            }
        }

        texto += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        texto += `💡 Use: !comprar <id>`;

        await sock.sendMessage(remoteJid, { text: texto });
    }
};
