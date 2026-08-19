// !rendicao - SE RENDE (MENOS PENALIDADE QUE FUGIR) - PvE + PvP
const { getJogador } = require("../../servicos/jogador");
const { getCombate, finalizarCombate } = require("./combate_estado");
const { renderSe, renderSeDuelo } = require("../../servicos/combate");
const { emDuelo } = require("../../servicos/duelo");
const { lerJogadores, escreverJogadores } = require("../../servicos/banco");

module.exports = {
    nome: "rendicao",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const jogador = getJogador(remetenteId, msg.pushName || "Aventureiro");

        // ===== PRIORIDADE 1: DUELO (PvP) =====
        const estaEmDuelo = emDuelo(remetenteId);
        if (estaEmDuelo.emDuelo) {
            const duelo = estaEmDuelo.duelo;
            const resultado = renderSeDuelo(duelo, remetenteId);

            const dados = lerJogadores();
            dados[remetenteId] = jogador;
            escreverJogadores(dados);

            finalizarCombate(remetenteId);

            return sock.sendMessage(remoteJid, {
                text: `🏳️ *RENDIÇÃO!* (Duelo)

Você se rendeu no duelo!

📊 *PENALIDADE:*
⭐ -${resultado.xpPerdido} XP

💡 Você poderia ter perdido mais se tivesse fugido.
👏 @${resultado.vencedor.split('@')[0]} vence por W.O.!`
            });
        }

        // ===== PRIORIDADE 2: COMBATE NORMAL (PvE) =====
        const combate = getCombate(remetenteId);
        if (!combate) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Você não está em combate! Use !treino para começar."
            });
        }

        const resultado = renderSe(combate, remetenteId);

        jogador.xp = Math.max(0, jogador.xp - resultado.xpPerdido);

        const dados = lerJogadores();
        dados[remetenteId] = jogador;
        escreverJogadores(dados);

        finalizarCombate(remetenteId);

        await sock.sendMessage(remoteJid, {
            text: `🏳️ *RENDIÇÃO!*

Você se rendeu para ${combate.nome}.

📊 *PENALIDADE:*
⭐ -${resultado.xpPerdido} XP

💡 Você poderia ter perdido mais se tivesse fugido.
📌 Use !descansar para se recuperar.`
        });
    }
};
