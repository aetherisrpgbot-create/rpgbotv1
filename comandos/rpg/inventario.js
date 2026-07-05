// !inventario
const ITENS = require("../../dados/itens");
const { getJogador } = require("../../servicos/jogador");

module.exports = {
    nome: "inventario",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const jogador = getJogador(remetenteId, msg.pushName || "Usuário");
        const inventario = jogador.inventario || {};

        if (Object.keys(inventario).length === 0) {
            return sock.sendMessage(remoteJid, {
                text: `🎒 *INVENTÁRIO DE ${jogador.nome.toUpperCase()}*\n\nSeu inventário está vazio.`
            });
        }

        let texto = `🎒 *INVENTÁRIO DE ${jogador.nome.toUpperCase()}*\n\n`;

        for (const [id, qtd] of Object.entries(inventario)) {
            const item = ITENS[id];
            if (!item) continue;
            texto += `📦 ${item.nome} x${qtd}\n`;
            texto += `   🆔 ${id}\n\n`;
        }

        texto += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        texto += `💡 Use: !equipar <id> | !usar <id>`;

        await sock.sendMessage(remoteJid, { text: texto });
    }
};
