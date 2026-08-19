// !pergunta - Inicia um quiz
const perguntas = require("../../dados/perguntas");
const { getJogador, adicionarXP, atualizarSaldo } = require("../../servicos/jogador");
const { lerJogadores, escreverJogadores } = require("../../servicos/banco");

let perguntasDisponiveis = [];
let perguntasAtivas = {};

function embaralhar() {
    perguntasDisponiveis = [...perguntas];
    for (let i = perguntasDisponiveis.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [perguntasDisponiveis[i], perguntasDisponiveis[j]] =
        [perguntasDisponiveis[j], perguntasDisponiveis[i]];
    }
    console.log(`📚 Perguntas embaralhadas! Total: ${perguntasDisponiveis.length}`);
}

function pegarPerguntaAleatoria() {
    if (perguntasDisponiveis.length === 0) {
        embaralhar();
    }
    const index = Math.floor(Math.random() * perguntasDisponiveis.length);
    const pergunta = perguntasDisponiveis.splice(index, 1)[0];
    console.log(`🎯 Pergunta sorteada: ${pergunta.pergunta}`);
    return pergunta;
}

// ===== FUNÇÃO PARA RESETAR PERGUNTAS DIÁRIAS =====
function resetarPerguntasDiarias(userId) {
    const dados = lerJogadores();
    if (!dados[userId]) return;
    
    const hoje = new Date().toDateString();
    const ultimoReset = dados[userId].ultimoResetPerguntas 
        ? new Date(dados[userId].ultimoResetPerguntas).toDateString() 
        : null;
    
    if (ultimoReset !== hoje) {
        dados[userId].perguntasHoje = 0;
        dados[userId].ultimoResetPerguntas = Date.now();
        escreverJogadores(dados);
        console.log(`🔄 Reset diário de perguntas para ${userId}`);
    }
}

module.exports = {
    nome: "pergunta",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        if (perguntasDisponiveis.length === 0) {
            embaralhar();
        }

        // ===== VERIFICA LIMITE DIÁRIO =====
        const jogador = getJogador(remetenteId, msg.pushName || "Jogador");
        resetarPerguntasDiarias(remetenteId);
        
        // Recarrega o jogador após o reset
        const dados = lerJogadores();
        const perguntasHoje = dados[remetenteId]?.perguntasHoje || 0;
        
        if (perguntasHoje >= 20) {
            return sock.sendMessage(remoteJid, {
                text: `🚫 *LIMITE DIÁRIO ATINGIDO!*\n\n` +
                      `📊 Você já respondeu ${perguntasHoje} perguntas hoje.\n` +
                      `🔄 Volte amanhã para mais!\n\n` +
                      `⏰ Reset: meia-noite`
            });
        }

        const pergunta = pegarPerguntaAleatoria();
        perguntasAtivas[remoteJid] = pergunta;

        const restantes = 20 - perguntasHoje - 1;
        const dicas = [
            "💡 Pense bem antes de responder!",
            "💡 Use !resposta <sua resposta>",
            "💡 Quem responde certo ganha R$100 e 15 XP!",
            `💡 Você pode responder mais ${restantes} perguntas hoje!`,
            "💡 Se errar, tente novamente!"
        ];
        const dica = dicas[Math.floor(Math.random() * dicas.length)];

        await sock.sendMessage(remoteJid, {
            text: `
🧠 *QUIZ DO CONHECIMENTO* 🧠

❓ *${pergunta.pergunta}*

━━━━━━━━━━━━━━━━━━━━━━━
📝 *Como responder:*

!resposta sua_resposta

${dica}

💰 Prêmio: R$100 + 15 XP
📊 Hoje: ${perguntasHoje}/20 perguntas
📚 Restam: ${perguntasDisponiveis.length} perguntas no banco
`
        });
    },
    getPerguntaAtiva: (remoteJid) => perguntasAtivas[remoteJid],
    removerPergunta: (remoteJid) => delete perguntasAtivas[remoteJid],
    pegarPerguntaAleatoria,
    embaralhar,
    resetarPerguntasDiarias
};
