// ============================================================
// SISTEMA DE COMBATE - SERVIÇO COMPLETO
// ============================================================
const { getJogador, adicionarXP, atualizarSaldo } = require("./jogador");

// ========== GERAR FRAQUEZA ==========
function gerarFraqueza() {
    const fraquezas = ["fogo", "gelo", "veneno", "luz", "trevas", "sangue", "magia", "fisico"];
    return fraquezas[Math.floor(Math.random() * fraquezas.length)];
}

// ========== CALCULAR REDUÇÃO DE DANO POR DEFESA ==========
function calcularReducaoDefesa(defesa) {
    if (defesa <= 10) return 0.2;
    if (defesa <= 20) return 0.35;
    if (defesa <= 30) return 0.5;
    if (defesa <= 50) return 0.65;
    return 0.8;
}

// ========== CALCULAR DANO DO CONTRA-ATAQUE ==========
function calcularContraAtaque(defesa) {
    return Math.floor(defesa * 0.8) + 5;
}

// ========== ATIVAR DEFESA COM DURAÇÃO ==========
function ativarDefesa(combate, defesa, userId) {
    if (!combate) return null;
    
    if (combate.defendendo && combate.defesaTermina > Date.now()) {
        return { erro: "🛡️ Você já está defendendo!" };
    }
    
    const reducao = calcularReducaoDefesa(defesa);
    const duracaoMs = 10000;
    
    combate.defendendo = true;
    combate.defesaOriginal = defesa;
    combate.defesaTermina = Date.now() + duracaoMs;
    
    return { 
        reducao, 
        porcentagem: Math.floor(reducao * 100),
        duracao: duracaoMs / 1000
    };
}

// ========== VERIFICAR SE DEFESA ESTÁ ATIVA ==========
function isDefesaAtiva(combate) {
    if (!combate || !combate.defendendo) return false;
    if (Date.now() > combate.defesaTermina) {
        combate.defendendo = false;
        return false;
    }
    return true;
}

// ========== APLICAR REDUÇÃO DE DANO ==========
function aplicarReducaoDefesa(combate, dano) {
    if (!isDefesaAtiva(combate)) return dano;
    
    const reducao = calcularReducaoDefesa(combate.defesaOriginal);
    const danoReduzido = Math.floor(dano * (1 - reducao));
    
    console.log(`🛡️ DEFESA ATIVA! Dano: ${dano} → ${danoReduzido} (${Math.floor(reducao * 100)}%)`);
    
    return danoReduzido;
}

// ========== ATIVAR DEFESA NO DUELO ==========
function ativarDefesaDuelo(duelo, defesa, userId) {
    if (!duelo) return { erro: "Duelo não encontrado!" };
    if (duelo.status !== "em_andamento") return { erro: "O duelo não está em andamento!" };
    if (duelo.turno !== userId) return { erro: "Aguarde seu turno!" };
    
    if (duelo.defendendo && duelo.defesaTermina > Date.now()) {
        return { erro: "🛡️ Você já está defendendo!" };
    }

    const ehDesafiante = userId === duelo.desafianteId;
    const defesaOriginal = ehDesafiante ? duelo.defesaDesafiante : duelo.defesaDesafiado;
    const reducao = calcularReducaoDefesa(defesaOriginal);
    const duracaoMs = 3000;
    
    duelo.defendendo = true;
    duelo.defesaOriginal = defesaOriginal;
    duelo.defensorId = userId;
    duelo.defesaTermina = Date.now() + duracaoMs;
    
    return { 
        reducao, 
        porcentagem: Math.floor(reducao * 100),
        duracao: duracaoMs / 1000
    };
}

// ========== VERIFICAR DEFESA NO DUELO ==========
function isDefesaAtivaDuelo(duelo) {
    if (!duelo || !duelo.defendendo) return false;
    if (Date.now() > duelo.defesaTermina) {
        duelo.defendendo = false;
        duelo.defensorId = null;
        return false;
    }
    return true;
}

// ========== APLICAR REDUÇÃO NO DUELO ==========
function aplicarReducaoDefesaDuelo(duelo, dano) {
    if (!isDefesaAtivaDuelo(duelo)) return dano;
    
    const reducao = calcularReducaoDefesa(duelo.defesaOriginal);
    const danoReduzido = Math.floor(dano * (1 - reducao));
    
    console.log(`🛡️ DEFESA ATIVA NO DUELO! Dano: ${dano} → ${danoReduzido} (${Math.floor(reducao * 100)}%)`);
    
    return danoReduzido;
}

// ========== EXECUTAR CONTRA-ATAQUE ==========
function executarContraAtaque(combate) {
    if (!combate) return null;
    if (!combate.defendendo) return { erro: "Você precisa defender primeiro!" };
    
    const dano = calcularContraAtaque(combate.defesaOriginal);
    combate.vida -= dano;
    combate.defendendo = false;
    combate.defesaTermina = 0;
    
    return { dano, vidaRestante: combate.vida };
}

// ========== EXECUTAR CONTRA-ATAQUE NO DUELO ==========
function executarContraAtaqueDuelo(duelo, userId) {
    if (!duelo) return { erro: "Duelo não encontrado!" };
    if (!duelo.defendendo) return { erro: "Você precisa defender primeiro!" };
    if (duelo.defensorId !== userId) return { erro: "Você não está defendendo!" };
    if (duelo.turno !== userId) return { erro: "Aguarde seu turno!" };

    const ehDesafiante = userId === duelo.desafianteId;
    const defesa = duelo.defesaOriginal;
    const dano = calcularContraAtaque(defesa);

    if (ehDesafiante) {
        duelo.vidaDesafiado -= dano;
        if (duelo.vidaDesafiado < 0) duelo.vidaDesafiado = 0;
    } else {
        duelo.vidaDesafiante -= dano;
        if (duelo.vidaDesafiante < 0) duelo.vidaDesafiante = 0;
    }

    duelo.defendendo = false;
    duelo.defensorId = null;
    duelo.defesaTermina = 0;

    if (duelo.vidaDesafiado <= 0 || duelo.vidaDesafiante <= 0) {
        duelo.status = "finalizado";
    }

    return { dano, vidaRestante: ehDesafiante ? duelo.vidaDesafiado : duelo.vidaDesafiante };
}

// ========== ANALISAR INIMIGO ==========
function analisarInimigo(combate) {
    if (!combate) return null;
    return {
        nome: combate.nome,
        nivel: combate.nivel,
        vida: combate.vida,
        vidaMax: combate.vidaMax,
        poder: combate.poder,
        defesa: combate.defesa,
        fraqueza: combate.fraqueza || gerarFraqueza()
    };
}

// ========== RENDER-SE ==========
function renderSe(combate, userId) {
    if (!combate) return null;
    const jogador = getJogador(userId);
    const xpPerdido = Math.floor(jogador.xp * 0.05);
    return { xpPerdido };
}

// ========== RENDER-SE NO DUELO ==========
function renderSeDuelo(duelo, userId) {
    if (!duelo) return { erro: "Duelo não encontrado!" };
    if (duelo.status !== "em_andamento") return { erro: "O duelo não está em andamento!" };

    const jogador = getJogador(userId);
    const xpPerdido = Math.floor(jogador.xp * 0.05);
    const vencedor = duelo.desafianteId === userId ? duelo.desafiadoId : duelo.desafianteId;

    duelo.status = "finalizado";

    return { xpPerdido, vencedor };
}

// ========== EXPORTAÇÕES ==========
module.exports = {
    gerarFraqueza,
    calcularReducaoDefesa,
    calcularContraAtaque,
    ativarDefesa,
    isDefesaAtiva,
    aplicarReducaoDefesa,
    ativarDefesaDuelo,
    isDefesaAtivaDuelo,
    aplicarReducaoDefesaDuelo,
    executarContraAtaque,
    executarContraAtaqueDuelo,
    analisarInimigo,
    renderSe,
    renderSeDuelo
};
