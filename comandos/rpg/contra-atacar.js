// !contra-atacar - CONTRA-ATACA APÓS DEFENDER (PvE + PvP)
const { getJogador } = require("../../servicos/jogador");
const { getAtributosCombate } = require("../../utils/helpers");
const { getCombate, finalizarCombate } = require("./combate_estado");
const { executarContraAtaque, executarContraAtaqueDuelo } = require("../../servicos/combate");
const { emDuelo } = require("../../servicos/duelo");
const { lerJogadores, escreverJogadores } = require("../../servicos/banco");

module.exports = {
    nome: "contra-atacar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const jogador = getJogador(remetenteId, msg.pushName || "Aventureiro");
        const stats = getAtributosCombate(jogador);
        const custoStamina = 8;

        if (jogador.stamina < custoStamina) {
            return sock.sendMessage(remoteJid, {
                text: `⚡ Stamina insuficiente! Necessário: ${custoStamina} | Atual: ${jogador.stamina}`
            });
        }
        jogador.stamina -= custoStamina;

        // ===== PRIORIDADE 1: DUELO (PvP) =====
        const estaEmDuelo = emDuelo(remetenteId);
        if (estaEmDuelo.emDuelo) {
            const duelo = estaEmDuelo.duelo;
            if (!duelo.defendendo) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Você precisa usar !defender primeiro para contra-atacar no duelo!"
                });
            }

            const resultado = executarContraAtaqueDuelo(duelo, remetenteId);

            if (resultado.erro) {
                return sock.sendMessage(remoteJid, { text: `❌ ${resultado.erro}` });
            }

            const dados = lerJogadores();
            dados[remetenteId] = jogador;
            escreverJogadores(dados);

            const ehDesafiante = remetenteId === duelo.desafianteId;
            const nomeAtacante = ehDesafiante ? duelo.nomeDesafiante : duelo.nomeDesafiado;
            const nomeDefensor = ehDesafiante ? duelo.nomeDesafiado : duelo.nomeDesafiante;

            let resposta = `⚔️ *CONTRA-ATAQUE!* (Duelo)

💥 ${nomeAtacante} revidou com sua defesa!
⚔️ Dano causado em ${nomeDefensor}: *${resultado.dano}*

🛡️ Defesa usada como poder de ataque.
⚡ -${custoStamina} Stamina

📊 ${duelo.nomeDesafiante}: ${duelo.vidaDesafiante}/${duelo.vidaMaxDesafiante}❤️
📊 ${duelo.nomeDesafiado}: ${duelo.vidaDesafiado}/${duelo.vidaMaxDesafiado}❤️`;

            if (duelo.vidaDesafiante <= 0 || duelo.vidaDesafiado <= 0) {
                finalizarCombate(remetenteId);
                resposta += `\n\n🏆 *${duelo.nomeDesafiante === remetenteId ? duelo.nomeDesafiante : duelo.nomeDesafiado} VENCEU!*`;
            }

            return sock.sendMessage(remoteJid, { text: resposta });
        }

        // ===== PRIORIDADE 2: COMBATE NORMAL (PvE) =====
        const combate = getCombate(remetenteId);
        if (!combate) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Você não está em combate! Use !treino para começar."
            });
        }

        if (!combate.defendendo) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Você precisa usar !defender primeiro para contra-atacar!"
            });
        }

        const resultado = executarContraAtaque(combate);

        if (resultado.erro) {
            return sock.sendMessage(remoteJid, { text: `❌ ${resultado.erro}` });
        }

        const dados = lerJogadores();
        dados[remetenteId] = jogador;
        escreverJogadores(dados);

        let respostaPve = `⚔️ *CONTRA-ATAQUE!*

💥 Você revidou com sua defesa!
⚔️ Dano causado: *${resultado.dano}*

🛡️ Defesa usada como poder de ataque.
⚡ -${custoStamina} Stamina

📊 ${combate.nome}: ${combate.vida}/${combate.vidaMax}❤️`;

        if (combate.vida <= 0) {
            combate.vida = 0;
            finalizarCombate(remetenteId);
            respostaPve += `\n\n🏆 *VITÓRIA!* Você derrotou ${combate.nome}!`;
        }

        await sock.sendMessage(remoteJid, { text: respostaPve });
    }
};
