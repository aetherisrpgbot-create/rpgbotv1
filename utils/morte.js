// ============================================================
// SISTEMA DE PENALIDADE POR MORTE - VERSÃO MAIS PESADA
// ============================================================

function aplicarPenalidadeMorte(jogador) {
    // ===== PERDA DE DINHEIRO (25% do saldo) =====
    const perdaDinheiro = Math.floor(jogador.saldo * 0.25);
    jogador.saldo = Math.max(0, jogador.saldo - perdaDinheiro);

    // ===== PERDA DE XP (15% do XP atual) =====
    const perdaXP = Math.floor(jogador.xp * 0.15);
    jogador.xp = Math.max(0, jogador.xp - perdaXP);

    // ===== PERDA DE STAMINA (50% da max) =====
    const perdaStamina = Math.floor(jogador.maxStamina * 0.5);
    jogador.stamina = Math.max(0, jogador.stamina - perdaStamina);

    // ===== AUMENTA FATIGUE (30%) =====
    jogador.fatigue = Math.min(100, jogador.fatigue + 30);

    // ===== PERDA DE NÍVEL (se tiver XP suficiente) =====
    let perdeuNivel = false;
    if (jogador.nivel > 1 && jogador.xp < 0) {
        jogador.nivel--;
        jogador.xp = jogador.nivel * 100; // Seta XP próximo do próximo nível
        perdeuNivel = true;
    }

    // ===== VIDA RESTAURADA =====
    jogador.vida = jogador.vidaMax;

    // ===== COOLDOWN DE 10 MINUTOS =====
    jogador.morteCooldown = Date.now() + (10 * 60 * 1000);

    return {
        perdaDinheiro: perdaDinheiro,
        perdaXP: perdaXP,
        perdaStamina: perdaStamina,
        fatigueGanha: 30,
        perdeuNivel: perdeuNivel,
        nivelAtual: jogador.nivel
    };
}

function verificarCooldownMorte(jogador) {
    if (jogador.morteCooldown && Date.now() < jogador.morteCooldown) {
        const restante = Math.ceil((jogador.morteCooldown - Date.now()) / 1000);
        const minutos = Math.floor(restante / 60);
        const segundos = restante % 60;
        return {
            emCooldown: true,
            tempoRestante: restante,
            mensagem: `💀 *Você morreu recentemente!*\n\nAguarde ${minutos}m${segundos}s para treinar novamente.`
        };
    }
    return { emCooldown: false };
}

module.exports = {
    aplicarPenalidadeMorte,
    verificarCooldownMorte
};
