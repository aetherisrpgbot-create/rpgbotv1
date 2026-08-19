// !analisar - MOSTRA FRAQUEZAS DO INIMIGO (PvE + PvP)
const { getCombate } = require("./combate_estado");
const { analisarInimigo } = require("../../servicos/combate");
const { emDuelo } = require("../../servicos/duelo");

module.exports = {
    nome: "analisar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        // ===== PRIORIDADE 1: DUELO (PvP) =====
        const estaEmDuelo = emDuelo(remetenteId);
        if (estaEmDuelo.emDuelo) {
            const duelo = estaEmDuelo.duelo;
            const ehDesafiante = remetenteId === duelo.desafianteId;
            const oponente = ehDesafiante ? duelo.desafiadoId : duelo.desafianteId;
            const nomeOponente = ehDesafiante ? duelo.nomeDesafiado : duelo.nomeDesafiante;
            const vidaOponente = ehDesafiante ? duelo.vidaDesafiado : duelo.vidaDesafiante;
            const vidaMaxOponente = ehDesafiante ? duelo.vidaMaxDesafiado : duelo.vidaMaxDesafiante;
            const poderOponente = ehDesafiante ? duelo.poderDesafiado : duelo.poderDesafiante;
            const defesaOponente = ehDesafiante ? duelo.defesaDesafiado : duelo.defesaDesafiante;

            return sock.sendMessage(remoteJid, {
                text: `🔍 *ANÁLISE DO OPONENTE*

👤 ${nomeOponente}
❤️ Vida: ${vidaOponente}/${vidaMaxOponente}
⚔️ Poder: ${poderOponente}
🛡️ Defesa: ${defesaOponente}

📌 Use suas habilidades com sabedoria!`
            });
        }

        // ===== PRIORIDADE 2: COMBATE NORMAL (PvE) =====
        const combate = getCombate(remetenteId);
        if (!combate) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Você não está em combate! Use !treino para começar."
            });
        }

        const info = analisarInimigo(combate);

        await sock.sendMessage(remoteJid, {
            text: `🔍 *ANÁLISE DO INIMIGO*

👹 ${info.nome}
⭐ Nível: ${info.nivel}
❤️ Vida: ${info.vida}/${info.vidaMax}
⚔️ Poder: ${info.poder}
🛡️ Defesa: ${info.defesa}
💀 Fraqueza: *${info.fraqueza.toUpperCase()}*

📌 Ataques com ${info.fraqueza} causam +20% de dano!`
        });
    }
};
