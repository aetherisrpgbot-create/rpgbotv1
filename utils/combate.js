// ============================================================
// FUNÇÕES DE VERIFICAÇÃO DE COMBATE
// ============================================================
const { combatesAtivos } = require("../comandos/rpg/combate_estado");

// ===== VERIFICA SE O JOGADOR ESTÁ EM COMBATE =====
function estaEmCombate(userId) {
    return !!combatesAtivos[userId];
}

// ===== VERIFICA E BLOQUEIA AÇÕES DURANTE COMBATE =====
function verificarCombate(userId) {
    if (estaEmCombate(userId)) {
        return {
            bloqueado: true,
            mensagem: "⚔️ *Você está em combate!*\n\nNão pode fazer isso durante uma batalha.\nFinalize o combate primeiro!"
        };
    }
    return { bloqueado: false };
}

module.exports = {
    estaEmCombate,
    verificarCombate
};
