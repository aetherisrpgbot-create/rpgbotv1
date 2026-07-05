// !resposta - Responde a pergunta ativa
const { getJogador, adicionarXP, atualizarSaldo } = require("../../servicos/jogador");
const { lerJogadores, escreverJogadores } = require("../../servicos/banco");
const { normalizarTexto } = require("../../utils/helpers");
const perguntaCommand = require("./pergunta");
const { progressoMissao } = require("../../servicos/missoes");

module.exports = {
    nome: "resposta",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const perguntaAtiva = perguntaCommand.getPerguntaAtiva(remoteJid);

        if (!perguntaAtiva) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Não há pergunta ativa.\n\nUse !pergunta para começar!"
            });
        }

        const jogador = getJogador(remetenteId, msg.pushName || "Usuário");
        const dados = lerJogadores();

        // ===== LIMITE DIÁRIO =====
        jogador.perguntasHoje ??= 0;
        jogador.ultimoResetPerguntas ??= Date.now();

        const hoje = new Date().toDateString();
        const ultimoDia = new Date(jogador.ultimoResetPerguntas).toDateString();

        if (hoje !== ultimoDia) {
            jogador.perguntasHoje = 0;
            jogador.ultimoResetPerguntas = Date.now();
        }

        if (jogador.perguntasHoje >= 20) {
            return sock.sendMessage(remoteJid, {
                text: `🚫 *LIMITE ATINGIDO!*\n\n📚 Você já respondeu 20 perguntas hoje.\n⏳ Volte amanhã para mais desafios!`
            });
        }

        // ===== VERIFICA A RESPOSTA =====
        const respostaUsuario = normalizarTexto(args.join(" "));
        const respostaCorreta = normalizarTexto(perguntaAtiva.resposta);

        if (!respostaUsuario) {
            return sock.sendMessage(remoteJid, {
                text: `❌ Digite sua resposta!\n\nExemplo: !resposta brasilia`
            });
        }

        // ===== ACERTOU! =====
        if (respostaUsuario === respostaCorreta) {
            atualizarSaldo(remetenteId, 100, 'saldo');
            const result = adicionarXP(remetenteId, jogador.nome, 15);

            jogador.perguntasHoje++;
            dados[remetenteId] = jogador;
            escreverJogadores(dados);

            perguntaCommand.removerPergunta(remoteJid);

            // ===== PROGRESSO DE MISSÃO (PERGUNTAS) =====
            const missoesConcluidas = progressoMissao(remetenteId, "perguntas");
            let msgMissao = "";
            if (missoesConcluidas.length > 0) {
                msgMissao = "\n🎯 *MISSÕES ATUALIZADAS!*\n";
                for (const m of missoesConcluidas) {
                    msgMissao += `✅ *${m.nome}* concluída!\n`;
                }
            }

            const reacoes = ["🎉", "⭐", "🔥", "💪", "🏆", "👏", "🎊", "✨", "🌟", "🎯"];
            const reacao = reacoes[Math.floor(Math.random() * reacoes.length)];

            await sock.sendMessage(remoteJid, {
                text: `${reacao} *RESPOSTA CORRETA!* ${reacao}\n\n` +
                      `✅ Parabéns, *${jogador.nome}*! Você acertou!\n\n` +
                      `💰 +R$100\n` +
                      `⭐ +15 XP\n` +
                      `📚 ${jogador.perguntasHoje}/20 hoje\n\n` +
                      (result.subiu ? `🎉 *VOCÊ SUBIU PARA O NÍVEL ${result.nivel}!*` : "") +
                      `${msgMissao}\n\n` +
                      `🧠 Use !pergunta para continuar!`
            });

            return;
        }

        // ===== ERROU =====
        jogador.errosHoje = (jogador.errosHoje || 0) + 1;
        dados[remetenteId] = jogador;
        escreverJogadores(dados);

        // 🔥 DICA INTELIGENTE
        const palavra = respostaCorreta;
        let dica = "";

        if (palavra.length <= 3) {
            dica = palavra[0] + " _".repeat(palavra.length - 1);
        } else if (palavra.length <= 6) {
            dica = palavra[0] + " _".repeat(palavra.length - 2) + palavra[palavra.length - 1];
        } else {
            dica = palavra.slice(0, 2) + " _".repeat(palavra.length - 3) + palavra[palavra.length - 1];
        }

        let dicaTamanho = "";
        if (palavra.length <= 3) dicaTamanho = "curta";
        else if (palavra.length <= 6) dicaTamanho = "média";
        else if (palavra.length <= 9) dicaTamanho = "longa";
        else dicaTamanho = "bem longa";

        await sock.sendMessage(remoteJid, {
            text: `❌ *RESPOSTA INCORRETA!*\n\n` +
                  `💡 *Dica:* A resposta é uma palavra *${dicaTamanho}*\n` +
                  `🔍 *Formato:* ${dica}\n\n` +
                  `📝 Tente novamente:\n` +
                  `!resposta <sua resposta>\n\n` +
                  `💪 Você consegue!`
        });
    }
};
