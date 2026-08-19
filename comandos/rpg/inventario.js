// !inventario - MOSTRA O INVENTÁRIO
const { getJogador } = require("../../servicos/jogador");

module.exports = {
    nome: "inventario",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const jogador = getJogador(remetenteId, msg.pushName || "Aventureiro");
        const inventario = jogador.inventario || {};

        if (Object.keys(inventario).length === 0) {
            return sock.sendMessage(remoteJid, {
                text: `╭━━━ 📦 *INVENTÁRIO VAZIO* ━━━╮\n\n` +
                      `❌ Você não tem nenhum item.\n` +
                      `💡 Use !loja para comprar ou faça dungeons!\n\n` +
                      `╰━━━━━━━━━━━━━━━━━━━━╯`
            });
        }

        let texto = `╭━━━ 📦 *INVENTÁRIO* ━━━╮\n\n`;

        for (const [id, quantidade] of Object.entries(inventario)) {
            // Busca o nome do item
            let nome = id;
            try {
                const ITENS = require("../../dados/itens");
                if (ITENS[id]) {
                    nome = ITENS[id].nome || id;
                }
            } catch (e) {}
            
            texto += `   ${nome} x${quantidade}\n`;
        }

        texto += `\n╰━━━━━━━━━━━━━━━━━━━━╯`;
        await sock.sendMessage(remoteJid, { text: texto });
    }
};
