// !acordar - Acorda antes do descanso terminar
module.exports = {
    nome: "acordar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { getJogador } = require("../../servicos/jogador");
        const { lerJogadores, escreverJogadores } = require("../../servicos/banco");
        
        const jogador = getJogador(remetenteId, msg.pushName || 'Usuário');
        const agora = Date.now();

        // Verifica se está descansando
        if (!jogador.restEnd || jogador.restEnd <= agora) {
            return sock.sendMessage(remoteJid, {
                text: `🧐 *${jogador.nome} já está acordado!*\n\n` +
                      `⚡ Stamina: ${jogador.stamina}/${jogador.maxStamina}\n` +
                      `😵 Cansaço: ${jogador.fatigue}%\n\n` +
                      `💤 Use !descansar para dormir.`
            });
        }

        // Calcula quanto tempo falta
        const tempoRestante = jogador.restEnd - agora;
        const minutos = Math.floor(tempoRestante / 60000);
        const segundos = Math.floor((tempoRestante % 60000) / 1000);
        const tempoMsg = minutos > 0 ? `${minutos}m${segundos}s` : `${segundos}s`;

        // Acorda o jogador (cancela o descanso)
        jogador.restEnd = 0;

        const dados = lerJogadores();
        dados[remetenteId] = jogador;
        escreverJogadores(dados);

        await sock.sendMessage(remoteJid, {
            text: `🌅 *${jogador.nome} acordou antes do tempo!* 🌅\n\n` +
                  `⏳ Faltava: ${tempoMsg}\n` +
                  `⚡ Stamina: ${jogador.stamina}/${jogador.maxStamina}\n` +
                  `😵 Cansaço: ${jogador.fatigue}%\n\n` +
                  `💪 Está pronto para continuar sua jornada!`
        });
    }
};
