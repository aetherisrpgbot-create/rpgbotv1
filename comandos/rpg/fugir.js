// !fugir
module.exports = {
    nome: "fugir",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { getJogador } = require("../../servicos/jogador");
        const { lerJogadores, escreverJogadores } = require("../../servicos/banco");
        const { getAtributosCombate } = require("../../utils/helpers");
        const { combatesAtivos, finalizarCombate } = require("./combate_estado");

        const combate = combatesAtivos[remetenteId];
        if (!combate) {
            return sock.sendMessage(remoteJid, { text: "❌ Você não está em combate." });
        }

        const dados = lerJogadores();
        const jogador = getJogador(remetenteId, msg.pushName || "Usuário");
        const stats = getAtributosCombate(jogador);

        if (jogador.stamina < 5) {
            return sock.sendMessage(remoteJid, { text: "⚡ Você está muito cansado para fugir." });
        }

        jogador.stamina -= 5;
        const chance = 70 + stats.esquiva;
        const sucesso = Math.random() * 100 < chance;

        if (sucesso) {
            finalizarCombate(remetenteId);
            dados[remetenteId] = jogador;
            escreverJogadores(dados);
            return sock.sendMessage(remoteJid, {
                text: `🏃‍♂️ Você conseguiu fugir da batalha!\n\n⚡ -5 stamina`
            });
        }

        // Fuga falhou - toma dano
        let dano = combate.poder + Math.floor(Math.random() * 6) - stats.defesa;
        if (dano < 1) dano = 1;
        jogador.vida -= dano;

        if (jogador.vida <= 0) {
            finalizarCombate(remetenteId);
            jogador.vida = jogador.vidaMax;
            dados[remetenteId] = jogador;
            escreverJogadores(dados);
            return sock.sendMessage(remoteJid, {
                text: `💀 Você tentou fugir, mas falhou...\n\nE foi derrotado por ${combate.nome}.\n\n❤️ Vida restaurada.`
            });
        }

        dados[remetenteId] = jogador;
        escreverJogadores(dados);

        await sock.sendMessage(remoteJid, {
            text: `❌ Fuga falhou!\n\n👹 ${combate.nome} te acertou ao tentar escapar.\n\n❤️ Vida atual: ${jogador.vida}/${jogador.vidaMax}`
        });
    }
};
