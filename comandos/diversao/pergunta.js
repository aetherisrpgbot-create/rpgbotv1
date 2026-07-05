// !pergunta - SISTEMA DE SORTEIO ALEATÓRIO
const perguntas = require("../../dados/perguntas");
let perguntasDisponiveis = [];
let perguntasAtivas = {};

// 🔥 EMBARALHA AS PERGUNTAS
function embaralhar() {
    perguntasDisponiveis = [...perguntas];
    for (let i = perguntasDisponiveis.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [perguntasDisponiveis[i], perguntasDisponiveis[j]] = 
        [perguntasDisponiveis[j], perguntasDisponiveis[i]];
    }
    console.log(`📚 Perguntas embaralhadas! Total: ${perguntasDisponiveis.length}`);
}

// 🔥 PEGA UMA PERGUNTA ALEATÓRIA
function pegarPerguntaAleatoria() {
    // Se não tem perguntas disponíveis, embaralha tudo de novo
    if (perguntasDisponiveis.length === 0) {
        embaralhar();
    }
    
    // 🔥 ESCOLHE UM ÍNDICE ALEATÓRIO
    const index = Math.floor(Math.random() * perguntasDisponiveis.length);
    const pergunta = perguntasDisponiveis.splice(index, 1)[0];
    
    console.log(`🎯 Pergunta sorteada: ${pergunta.pergunta}`);
    console.log(`📚 Restam: ${perguntasDisponiveis.length} perguntas`);
    
    return pergunta;
}

module.exports = {
    nome: "pergunta",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        // Se não tem perguntas disponíveis, embaralha
        if (perguntasDisponiveis.length === 0) {
            embaralhar();
        }
        
        // 🔥 PEGA UMA PERGUNTA ALEATÓRIA
        const pergunta = pegarPerguntaAleatoria();
        perguntasAtivas[remoteJid] = pergunta;

        // ===== DICAS ALEATÓRIAS =====
        const dicas = [
            "💡 Pense bem antes de responder!",
            "💡 Use !resposta <sua resposta>",
            "💡 Não precisa de pressa, pense com calma!",
            "💡 Quem responde certo ganha R$100 e 15 XP!",
            "💡 Você pode responder até 20 perguntas por dia!",
            "💡 Se errar, tente novamente!",
            "💡 Leia a pergunta com atenção!"
        ];

        const dica = dicas[Math.floor(Math.random() * dicas.length)];

        // ===== MENSAGEM =====
        const msgFinal = `
╔═══════════════════════════════════╗
║  🧠 *QUIZ DO CONHECIMENTO* 🧠    ║
╚═══════════════════════════════════╝

❓ *${pergunta.pergunta}*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 *Como responder:*

!resposta sua_resposta

${dica}

💰 Prêmio: R$100 + 15 XP
📚 Limite diário: 20 perguntas
📊 Restam: ${perguntasDisponiveis.length} perguntas no banco
`;

        await sock.sendMessage(remoteJid, { text: msgFinal });
    },
    // 🔥 EXPORTA AS FUNÇÕES PARA USAR NO resposta.js
    getPerguntaAtiva: (remoteJid) => perguntasAtivas[remoteJid],
    removerPergunta: (remoteJid) => delete perguntasAtivas[remoteJid],
    pegarPerguntaAleatoria,
    embaralhar
};
