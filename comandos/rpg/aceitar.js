// !aceitar - ACEITA UM DESAFIO DE DUELO
const { aceitarDuelo, emDuelo } = require("../../servicos/duelo");

module.exports = {
    nome: "aceitar",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup) => {
        if (!isGroup) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Este comando só funciona em grupos!"
            });
        }

        const emDueloAtual = emDuelo(remetenteId);
        if (emDueloAtual.emDuelo && emDueloAtual.duelo.status === "em_andamento") {
            return sock.sendMessage(remoteJid, {
                text: "❌ Você já está em um duelo!"
            });
        }

        const resultado = aceitarDuelo(remetenteId);
        if (!resultado.sucesso) {
            return sock.sendMessage(remoteJid, {
                text: `❌ ${resultado.erro}`
            });
        }

        const duelo = resultado.duelo;
        const desafiante = duelo.desafianteId;
        const desafiado = duelo.desafiadoId;

        await sock.sendMessage(remoteJid, {
            text: `⚔️ *DUELO INICIADO!*\n\n` +
                  `👤 @${desafiante.split('@')[0]} VS @${desafiado.split('@')[0]}\n\n` +
                  `📊 *Status:*\n` +
                  `❤️ @${desafiante.split('@')[0]}: ${duelo.vidaDesafiante}/${duelo.vidaMaxDesafiante}\n` +
                  `❤️ @${desafiado.split('@')[0]}: ${duelo.vidaDesafiado}/${duelo.vidaMaxDesafiado}\n\n` +
                  `🎯 *Turno:* @${duelo.turno.split('@')[0]}\n\n` +
                  `⚔️ Digite *!atacar* para atacar!\n` +
                  `🏃 Digite *!fugir* para desistir!`,
            mentions: [desafiante, desafiado, duelo.turno]
        });
    }
};
