// ============================================================
// SISTEMA DE COMBATE
// ============================================================
const { getJogador, adicionarXP, atualizarSaldo } = require("./jogador");

const combatesAtivos = {};

// ========== INICIAR COMBATE ==========
function iniciarCombate(userId, nome, nivel) {
    const nomes = ["Goblin", "Lobo Selvagem", "Bandido", "Esqueleto", "Orc"];
    const nivelInimigo = Math.max(1, nivel + Math.floor(Math.random() * 3) - 1);
    
    combatesAtivos[userId] = {
        nome: nomes[Math.floor(Math.random() * nomes.length)],
        nivel: nivelInimigo,
        vidaMax: 100 + (nivelInimigo * 5),
        vida: 100 + (nivelInimigo * 5),
        poder: 10 + (nivelInimigo * 2),
        defesa: 5 + Math.floor(nivelInimigo * 0.8)
    };
    return combatesAtivos[userId];
}

// ========== FINALIZAR COMBATE ==========
function finalizarCombate(userId, vitoria, nivel) {
    if (vitoria) {
        const dinheiro = 50 + (nivel * 20);
        const xp = 10 + (nivel * 5);
        atualizarSaldo(userId, dinheiro, 'saldo');
        const result = adicionarXP(userId, "Jogador", xp);
        delete combatesAtivos[userId];
        return { dinheiro, xp, subiu: result.subiu, nivel: result.nivel };
    }
    delete combatesAtivos[userId];
    return null;
}

// ========== OBTER COMBATE ==========
function getCombate(userId) {
    return combatesAtivos[userId] || null;
}

// ========== VERIFICAR EM COMBATE ==========
function emCombate(userId) {
    return !!combatesAtivos[userId];
}

module.exports = {
    combatesAtivos,
    iniciarCombate,
    finalizarCombate,
    getCombate,
    emCombate
};
