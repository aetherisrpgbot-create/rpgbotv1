// !resposta - Responde uma pergunta do quiz
const { getJogador, adicionarXP, atualizarSaldo } = require("../../servicos/jogador");
const { lerJogadores, escreverJogadores } = require("../../servicos/banco");

module.exports = {
    nome: "resposta",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { getPerguntaAtiva, removerPergunta } = require("./pergunta");
        
        const pergunta = getPerguntaAtiva(remoteJid);
        if (!pergunta) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Não há pergunta ativa no momento.\nDigite !pergunta para uma nova."
            });
        }

        const respostaUsuario = args.join(" ").trim().toLowerCase();
        if (!respostaUsuario) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Digite sua resposta!\nExemplo: !resposta 42"
            });
        }

        const respostaCorreta = pergunta.resposta.toLowerCase();

        if (respostaUsuario === respostaCorreta) {
            // ===== RESPONDEU CERTO =====
            removerPergunta(remoteJid);

            // ===== ADICIONA RECOMPENSAS =====
            const jogador = getJogador(remetenteId, msg.pushName || "Jogador");
            
            // Incrementa contador de perguntas
            const dados = lerJogadores();
            if (dados[remetenteId]) {
                dados[remetenteId].perguntasHoje = (dados[remetenteId].perguntasHoje || 0) + 1;
                dados[remetenteId].ultimoResetPerguntas = dados[remetenteId].ultimoResetPerguntas || Date.now();
                escreverJogadores(dados);
            }

            // Adiciona XP e dinheiro
            const result = adicionarXP(remetenteId, jogador.nome, 15);
            atualizarSaldo(remetenteId, 100, 'saldo');

            // Pega o total atualizado
            const dadosAtualizados = lerJogadores();
            const perguntasHoje = dadosAtualizados[remetenteId]?.perguntasHoje || 0;

            await sock.sendMessage(remoteJid, {
                text: `✅ *RESPOSTA CORRETA!*\n\n` +
                      `🎉 Parabéns, você acertou!\n\n` +
                      `💰 +R$100\n` +
                      `⭐ +15 XP\n` +
                      (result.subiu ? `🎊 *UP!* Você subiu para o nível ${result.nivel}!\n` : "") +
                      `📊 Perguntas hoje: ${perguntasHoje}/20\n\n` +
                      `🔍 Resposta correta: *${pergunta.resposta}*`
            });

        } else {
            // ===== RESPONDEU ERRADO =====
            await sock.sendMessage(remoteJid, {
                text: `❌ *RESPOSTA ERRADA!*\n\n` +
                      `😅 Que pena, tente novamente!\n\n` +
                      `💡 Dica: ${pergunta.dica || "Leia atentamente a pergunta."}`
            });
        }
    }
};
