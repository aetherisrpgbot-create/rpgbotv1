// !defender - ATIVA DEFESA POR 3 SEGUNDOS
const { getJogador } = require("../../servicos/jogador");
const { getAtributosCombate } = require("../../utils/helpers");
const { getCombate } = require("./combate_estado");
const { ativarDefesa, isDefesaAtiva, calcularReducaoDefesa } = require("../../servicos/combate");
const { lerJogadores, escreverJogadores } = require("../../servicos/banco");

module.exports = {
    nome: "defender",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const combate = getCombate(remetenteId);
        if (!combate) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Você não está em combate! Use !treino para começar."
            });
        }

        const jogador = getJogador(remetenteId, msg.pushName || "Aventureiro");
        const stats = getAtributosCombate(jogador);

        // ===== VERIFICA SE JÁ ESTÁ DEFENDENDO =====
        if (isDefesaAtiva(combate)) {
            const tempoRestante = Math.ceil((combate.defesaTermina - Date.now()) / 1000);
            return sock.sendMessage(remoteJid, {
                text: `🛡️ *DEFESA JÁ ATIVA!*

⏳ Tempo restante: *${tempoRestante}s*

📉 Redução atual: ${Math.floor(calcularReducaoDefesa(stats.defesa) * 100)}%`
            });
        }

        // ===== GASTA STAMINA =====
        const custoStamina = 10;
        if (jogador.stamina < custoStamina) {
            return sock.sendMessage(remoteJid, {
                text: `⚡ Stamina insuficiente! Necessário: ${custoStamina} | Atual: ${jogador.stamina}`
            });
        }
        jogador.stamina -= custoStamina;

        // ===== ATIVA DEFESA =====
        const resultado = ativarDefesa(combate, stats.defesa, remetenteId);

        if (resultado.erro) {
            return sock.sendMessage(remoteJid, { text: `❌ ${resultado.erro}` });
        }

        // ===== SALVA JOGADOR =====
        const dados = lerJogadores();
        dados[remetenteId] = jogador;
        escreverJogadores(dados);

        await sock.sendMessage(remoteJid, {
            text: `🛡️ *DEFESA ATIVADA!*

👤 Você ativou o modo defesa!
🛡️ Defesa: ${stats.defesa}
📉 Redução de dano: *${resultado.porcentagem}%*
⏳ Duração: *${resultado.duracao}s*

⚔️ Todos os ataques recebidos serão reduzidos!
⚡ -${custoStamina} Stamina`
        });
    }
};
