// ============================================================
// SISTEMA DE JOGADOR - XP, Níveis, Classes
// ============================================================
const { lerJogadores, escreverJogadores } = require("./banco");

// ========== CLASSES DISPONÍVEIS ==========
const CLASSES = {
    guerreiro: {
        dinheiro: 1.0,
        xp: 1.0,
        hp: 120,
        mana: 60,
        defesa: 8,
        skills: [
            { id: "golpe_forte", nome: "⚔️ Golpe Forte", dano: 15, custo_mana: 10, cooldown: 3, nivel: 1 },
            { id: "corte_duplo", nome: "🩸 Corte Duplo", dano: 25, custo_mana: 20, cooldown: 5, nivel: 5 },
            { id: "furia_guerreira", nome: "🔥 Fúria Guerreira", dano: 40, custo_mana: 35, cooldown: 8, nivel: 10 },
            { id: "impacto_terra", nome: "🌍 Impacto da Terra", dano: 60, custo_mana: 50, cooldown: 12, nivel: 15 }
        ]
    },
    mago: {
        dinheiro: 0.8,
        xp: 1.8,
        hp: 80,
        mana: 150,
        defesa: 3,
        skills: [
            { id: "bola_fogo", nome: "🔥 Bola de Fogo", dano: 18, custo_mana: 15, cooldown: 3, nivel: 1 },
            { id: "raio_arcano", nome: "⚡ Raio Arcano", dano: 30, custo_mana: 25, cooldown: 5, nivel: 5 },
            { id: "explosao_mana", nome: "💥 Explosão de Mana", dano: 55, custo_mana: 45, cooldown: 9, nivel: 10 },
            { id: "meteoro_arcano", nome: "☄️ Meteoro Arcano", dano: 80, custo_mana: 80, cooldown: 15, nivel: 15 }
        ]
    },
    arqueiro: {
        dinheiro: 1.1,
        xp: 1.2,
        hp: 100,
        mana: 90,
        defesa: 5,
        skills: [
            { id: "tiro_preciso", nome: "🏹 Tiro Preciso", dano: 20, custo_mana: 10, cooldown: 3, nivel: 1 },
            { id: "chuva_flechas", nome: "🌧️ Chuva de Flechas", dano: 35, custo_mana: 25, cooldown: 6, nivel: 5 },
            { id: "flecha_perfurante", nome: "🎯 Flecha Perfurante", dano: 50, custo_mana: 40, cooldown: 9, nivel: 10 },
            { id: "disparo_fatal", nome: "💀 Disparo Fatal", dano: 75, custo_mana: 60, cooldown: 12, nivel: 15 }
        ]
    },
    assassino: {
        dinheiro: 1.5,
        xp: 0.9,
        hp: 85,
        mana: 100,
        defesa: 4,
        skills: [
            { id: "golpe_sombra", nome: "🌑 Golpe da Sombra", dano: 22, custo_mana: 15, cooldown: 3, nivel: 1 },
            { id: "ataque_furtivo", nome: "🗡️ Ataque Furtivo", dano: 40, custo_mana: 25, cooldown: 5, nivel: 5 },
            { id: "danca_mortal", nome: "💀 Dança Mortal", dano: 65, custo_mana: 45, cooldown: 9, nivel: 10 },
            { id: "execucao_silenciosa", nome: "🖤 Execução Silenciosa", dano: 90, custo_mana: 70, cooldown: 14, nivel: 15 }
        ]
    }
};

// ========== OBTER JOGADOR ==========
function getJogador(userId, nome) {
    const dados = lerJogadores();

    if (!dados[userId]) {
        dados[userId] = {
            nome: nome || "Jogador",
            xp: 0,
            nivel: 1,
            stamina: 100,
            maxStamina: 100,
            fatigue: 0,
            saldo: 100,
            banco: 0,
            restEnd: 0,
            cooldowns: {},
            classe: "Sem Classe",
            perguntasHoje: 0,
            ultimoResetPerguntas: Date.now(),
            segurancaAte: 0,
            ultimoXP: 0,
            vidaMax: 100,
            vida: 100,
            mana: 100,
            manaMax: 100,
            poder: 10,
            defesa: 5,
            critico: 5,
            esquiva: 3,
            inventario: {},
            arma: null,
            armadura: null,
            acessorio: null,
            trabalhosSeguidos: 0,
            ultimoTrabalho: 0
        };
        escreverJogadores(dados);
    }

    const jogador = dados[userId];
    
    // ===== PROTEÇÃO CONTRA DADOS FALTANDO =====
    jogador.nome ??= nome;
    jogador.xp ??= 0;
    jogador.nivel ??= 1;
    jogador.stamina ??= 100;
    jogador.maxStamina ??= 100;
    jogador.fatigue ??= 0;
    jogador.saldo ??= 100;
    jogador.banco ??= 0;
    jogador.classe ??= "Sem Classe";
    jogador.vidaMax ??= 100;
    jogador.vida ??= jogador.vidaMax;
    jogador.manaMax ??= 100;
    jogador.mana ??= jogador.manaMax;
    jogador.poder ??= 10;
    jogador.defesa ??= 5;
    jogador.critico ??= 5;
    jogador.esquiva ??= 3;
    jogador.inventario ??= {};
    jogador.cooldowns ??= {};
    
    // ===== SE INVENTÁRIO FOR ARRAY, CONVERTE PRA OBJETO =====
    if (Array.isArray(jogador.inventario)) {
        const novo = {};
        for (const item of jogador.inventario) {
            novo[item] = (novo[item] || 0) + 1;
        }
        jogador.inventario = novo;
    }

    // ===== REGENERAÇÃO POR DESCANSO =====
    if (jogador.restEnd && Date.now() >= jogador.restEnd) {
        jogador.stamina = jogador.maxStamina;
        jogador.fatigue = 0;
        jogador.restEnd = 0;
        jogador.vida = jogador.vidaMax;
        escreverJogadores(dados);
    }

    atualizarAtributos(jogador);
    return jogador;
}

// ========== ATUALIZAR ATRIBUTOS ==========
function atualizarAtributos(jogador) {
    if (!jogador.nivel || jogador.nivel < 1) jogador.nivel = 1;
    
    // ===== ATRIBUTOS BASE POR NÍVEL =====
    jogador.vidaMax = 100 + (jogador.nivel * 5);
    jogador.poder = 10 + (jogador.nivel * 2);
    jogador.defesa = 5 + Math.floor(jogador.nivel * 0.8);
    jogador.critico = 5 + Math.floor(jogador.nivel / 10);
    jogador.esquiva = 3 + Math.floor(jogador.nivel / 15);
    jogador.maxStamina = 100 + (jogador.nivel * 5);
    jogador.manaMax = 100 + (jogador.nivel * 3);

    // ===== BÔNUS DE CLASSE =====
    const classe = jogador.classe?.toLowerCase();
    if (CLASSES && CLASSES[classe]) {
        const classeData = CLASSES[classe];
        jogador.vidaMax += (classeData.hp || 0) - 100;
        jogador.manaMax += (classeData.mana || 0) - 100;
        jogador.defesa += (classeData.defesa || 0) - 5;
    }

    // ===== GARANTE QUE VIDA E MANA NÃO ULTRAPASSEM O MÁXIMO =====
    jogador.vida = Math.min(jogador.vida || jogador.vidaMax, jogador.vidaMax);
    jogador.mana = Math.min(jogador.mana || jogador.manaMax, jogador.manaMax);
    
    if (jogador.vida < 0) jogador.vida = 0;
    if (jogador.mana < 0) jogador.mana = 0;
    if (jogador.stamina < 0) jogador.stamina = 0;
}

// ========== ADICIONAR XP ==========
function adicionarXP(userId, nome, quantidade = 10) {
    const dados = lerJogadores();

    if (!dados[userId]) {
        dados[userId] = {
            nome,
            xp: 0,
            nivel: 1
        };
    }

    const jogador = dados[userId];

    jogador.xp += quantidade;

    let subiu = false;
    let niveisGanhos = 0;

    while (jogador.xp >= jogador.nivel * 100) {
        const xpNecessario = jogador.nivel * 100;

        jogador.xp -= xpNecessario;
        jogador.nivel++;
        niveisGanhos++;
        subiu = true;

        atualizarAtributos(jogador);
    }

    escreverJogadores(dados);

    return {
        subiu,
        niveisGanhos,
        nivel: jogador.nivel,
        xp: jogador.xp
    };
}

// ========== RANKING ==========
function getRankingXP() {
    const dados = lerJogadores();
    return Object.entries(dados)
        .map(([id, val]) => ({ id, ...val }))
        .sort((a, b) => (b.nivel - a.nivel) || (b.xp - a.xp));
}

// ========== ATUALIZAR SALDO ==========
function atualizarSaldo(userId, delta, tipo = 'saldo') {
    const dados = lerJogadores();
    if (!dados[userId]) return false;
    if (tipo === 'saldo') dados[userId].saldo += delta;
    else if (tipo === 'banco') dados[userId].banco += delta;
    if (dados[userId].saldo < 0) dados[userId].saldo = 0;
    if (dados[userId].banco < 0) dados[userId].banco = 0;
    escreverJogadores(dados);
    return true;
}

// ========== EXPORTAÇÕES ==========
module.exports = {
    CLASSES,
    getJogador,
    adicionarXP,
    getRankingXP,
    atualizarSaldo,
    atualizarAtributos
};
