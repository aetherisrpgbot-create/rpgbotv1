// ============================================================
// SISTEMA DE ANTI-SPAM (COOLDOWN)
// ============================================================

// 🔥 CONFIGURAÇÃO
const TEMPO_COOLDOWN = 5000; // 5 segundos entre comandos
const TEMPO_COOLDOWN_GLOBAL = 1000; // 1 segundo entre comandos (evita flood)

// ===== ARMAZENAMENTO DE COOLDOWNS =====
const cooldowns = new Map();
const cooldownsGlobais = new Map();

// ===== FUNÇÃO PARA VERIFICAR COOLDOWN =====
function verificarCooldown(userId, comando) {
    const agora = Date.now();
    const chave = `${userId}_${comando}`;
    
    // Verifica cooldown do comando específico
    if (cooldowns.has(chave)) {
        const ultimoUso = cooldowns.get(chave);
        if (agora - ultimoUso < TEMPO_COOLDOWN) {
            const tempoRestante = Math.ceil((TEMPO_COOLDOWN - (agora - ultimoUso)) / 1000);
            return {
                permitido: false,
                tempoRestante: tempoRestante,
                mensagem: `⏳ *Calma jovem!*\n\nAguarde *${tempoRestante} segundos* para usar este comando novamente.`
            };
        }
    }
    
    // Verifica cooldown global (anti-flood)
    if (cooldownsGlobais.has(userId)) {
        const ultimoUso = cooldownsGlobais.get(userId);
        if (agora - ultimoUso < TEMPO_COOLDOWN_GLOBAL) {
            return {
                permitido: false,
                tempoRestante: 1,
                mensagem: `🐢 *Devagar!*\n\nNão fique spammando comandos.`
            };
        }
    }
    
    // Atualiza os cooldowns
    cooldowns.set(chave, agora);
    cooldownsGlobais.set(userId, agora);
    
    return { permitido: true };
}

// ===== FUNÇÃO PARA LIMPAR COOLDOWNS ANTIGOS =====
function limparCooldowns() {
    const agora = Date.now();
    
    // Limpa cooldowns de comandos específicos
    for (const [chave, tempo] of cooldowns) {
        if (agora - tempo > TEMPO_COOLDOWN * 2) {
            cooldowns.delete(chave);
        }
    }
    
    // Limpa cooldowns globais
    for (const [userId, tempo] of cooldownsGlobais) {
        if (agora - tempo > TEMPO_COOLDOWN_GLOBAL * 2) {
            cooldownsGlobais.delete(userId);
        }
    }
}

// ===== LIMPAR COOLDOWNS A CADA 1 MINUTO =====
setInterval(limparCooldowns, 60000);

module.exports = {
    verificarCooldown,
    limparCooldowns,
    TEMPO_COOLDOWN,
    TEMPO_COOLDOWN_GLOBAL
};
