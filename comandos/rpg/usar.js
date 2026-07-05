// !usar (consumíveis)
const ITENS = require("../../dados/itens");
const { getJogador } = require("../../servicos/jogador");
const { lerJogadores, escreverJogadores } = require("../../servicos/banco");

module.exports = {
    nome: "usar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const itemId = args[0];
        const jogador = getJogador(remetenteId, msg.pushName || "Usuário");

        if (!itemId) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Use: !usar <id_do_item>"
            });
        }

        if (!jogador.inventario[itemId] || jogador.inventario[itemId] <= 0) {
            return sock.sendMessage(remoteJid, { text: "❌ Você não possui esse item." });
        }

        const item = ITENS[itemId];
        if (!item || item.tipo !== "consumivel") {
            return sock.sendMessage(remoteJid, { text: "❌ Esse item não é consumível." });
        }

        let resultado = `🧪 *${item.nome}* usado!\n\n`;

        // Aplica efeitos
        if (item.cura) {
            const antes = jogador.vida;
            jogador.vida = Math.min(jogador.vidaMax, jogador.vida + item.cura);
            resultado += `❤️ Vida: +${jogador.vida - antes}\n`;
        }
        if (item.mana) {
            const antes = jogador.mana;
            jogador.mana = Math.min(jogador.manaMax, jogador.mana + item.mana);
            resultado += `🔵 Mana: +${jogador.mana - antes}\n`;
        }
        if (item.stamina) {
            const antes = jogador.stamina;
            jogador.stamina = Math.min(jogador.maxStamina, jogador.stamina + item.stamina);
            resultado += `⚡ Stamina: +${jogador.stamina - antes}\n`;
        }

        // Consome
        jogador.inventario[itemId]--;
        if (jogador.inventario[itemId] <= 0) {
            delete jogador.inventario[itemId];
        }

        const dados = lerJogadores();
        dados[remetenteId] = jogador;
        escreverJogadores(dados);

        await sock.sendMessage(remoteJid, { text: resultado });
    }
};
