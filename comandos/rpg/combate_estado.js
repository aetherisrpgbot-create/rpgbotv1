// ============================================================
// ESTADO GLOBAL DO COMBATE - COM DIFICULDADE
// ============================================================
const combatesAtivos = {};

// ========== TODOS OS INIMIGOS ==========
const TIPOS_INIMIGOS = [
    // =============================================
    // 🟢 FÁCEIS (Multiplicador 0.3 - 0.5)
    // =============================================
    {
        nome: "Goblin",
        emoji: "👺",
        imagem: "goblin",
        multiplicadorVida: 0.3,
        multiplicadorPoder: 0.4,
        multiplicadorDefesa: 0.3,
        dificuldade: "fácil",
        descricao: "Um goblin fraco e covarde!"
    },
    {
        nome: "Rato Gigante",
        emoji: "🐀",
        imagem: "rato_gigante",
        multiplicadorVida: 0.2,
        multiplicadorPoder: 0.3,
        multiplicadorDefesa: 0.2,
        dificuldade: "fácil",
        descricao: "Um rato enorme, mas ainda fraco!"
    },
    {
        nome: "Morcego",
        emoji: "🦇",
        imagem: "morcego",
        multiplicadorVida: 0.25,
        multiplicadorPoder: 0.35,
        multiplicadorDefesa: 0.2,
        dificuldade: "fácil",
        descricao: "Um morcego irritante, mas frágil!"
    },
    {
        nome: "Slime",
        emoji: "🟢",
        imagem: "slime",
        multiplicadorVida: 0.4,
        multiplicadorPoder: 0.2,
        multiplicadorDefesa: 0.1,
        dificuldade: "fácil",
        descricao: "Uma massa gelatinosa sem cérebro!"
    },
    {
        nome: "Esqueleto Pequeno",
        emoji: "🦴",
        imagem: "esqueleto_pequeno",
        multiplicadorVida: 0.3,
        multiplicadorPoder: 0.3,
        multiplicadorDefesa: 0.2,
        dificuldade: "fácil",
        descricao: "Um esqueleto frágil e quebradiço!"
    },
    {
        nome: "Cobra",
        emoji: "🐍",
        imagem: "cobra",
        multiplicadorVida: 0.35,
        multiplicadorPoder: 0.5,
        multiplicadorDefesa: 0.2,
        dificuldade: "fácil",
        descricao: "Uma cobra venenosa, mas frágil!"
    },
    {
        nome: "Duende",
        emoji: "🧝",
        imagem: "duende",
        multiplicadorVida: 0.4,
        multiplicadorPoder: 0.4,
        multiplicadorDefesa: 0.3,
        dificuldade: "fácil",
        descricao: "Um duende travesso e fraco!"
    },

// =============================================
// 🟡 NORMAIS
// =============================================
{
    nome: "Lobo Selvagem",
    emoji: "🐺",
    imagem: "lobo_selvagem",
    multiplicadorVida: 1.0,
    multiplicadorPoder: 1.0,
    multiplicadorDefesa: 0.8,
    dificuldade: "normal",
    descricao: "Um lobo faminto e perigoso!"
},
{
    nome: "Bandido",
    emoji: "🗡️",
    imagem: "bandido",
    multiplicadorVida: 1.1,
    multiplicadorPoder: 1.0,
    multiplicadorDefesa: 0.9,
    dificuldade: "normal",
    descricao: "Um bandido experiente em emboscadas!"
},
{
    nome: "Esqueleto Guerreiro",
    emoji: "💀",
    imagem: "esqueleto_guerreiro",
    multiplicadorVida: 0.9,
    multiplicadorPoder: 1.1,
    multiplicadorDefesa: 0.7,
    dificuldade: "normal",
    descricao: "Um esqueleto reanimado com armadura!"
},
{
    nome: "Orc",
    emoji: "👹",
    imagem: "orc",
    multiplicadorVida: 1.2,
    multiplicadorPoder: 1.1,
    multiplicadorDefesa: 1.0,
    dificuldade: "normal",
    descricao: "Um orc bruto e violento!"
},
{
    nome: "Harpia",
    emoji: "🦅",
    imagem: "harpia",
    multiplicadorVida: 0.8,
    multiplicadorPoder: 1.2,
    multiplicadorDefesa: 0.6,
    dificuldade: "normal",
    descricao: "Uma criatura alada que ataca das alturas!"
},
{
    nome: "Troll",
    emoji: "🧌",
    imagem: "troll",
    multiplicadorVida: 1.3,
    multiplicadorPoder: 0.9,
    multiplicadorDefesa: 1.1,
    dificuldade: "normal",
    descricao: "Um troll grande e resistente!"
},
{
    nome: "Gárgula",
    emoji: "🗿",
    imagem: "gargula",
    multiplicadorVida: 1.1,
    multiplicadorPoder: 1.0,
    multiplicadorDefesa: 1.3,
    dificuldade: "normal",
    descricao: "Uma estátua viva de pedra!"
},
{
    nome: "Centauro",
    emoji: "🐴",
    imagem: "centauro",
    multiplicadorVida: 1.2,
    multiplicadorPoder: 1.1,
    multiplicadorDefesa: 0.8,
    dificuldade: "normal",
    descricao: "Metade homem, metade cavalo!"
},


// =============================================
// 🔴 DIFÍCEIS
// =============================================
{
    nome: "Ciclope",
    emoji: "👁️",
    imagem: "ciclope",
    multiplicadorVida: 2.0,
    multiplicadorPoder: 1.5,
    multiplicadorDefesa: 1.3,
    dificuldade: "dificil",
    descricao: "Um ciclope gigante com força brutal!"
},
{
    nome: "Dragão Jovem",
    emoji: "🐉",
    imagem: "dragao_jovem",
    multiplicadorVida: 2.5,
    multiplicadorPoder: 1.8,
    multiplicadorDefesa: 1.5,
    dificuldade: "dificil",
    descricao: "Um dragão jovem, mas já muito poderoso!"
},
{
    nome: "Golem de Pedra",
    emoji: "🗿",
    imagem: "golem_pedra",
    multiplicadorVida: 3.0,
    multiplicadorPoder: 1.2,
    multiplicadorDefesa: 2.0,
    dificuldade: "dificil",
    descricao: "Uma criatura de pedra quase invulnerável!"
},
{
    nome: "Demônio",
    emoji: "😈",
    imagem: "demonio",
    multiplicadorVida: 2.2,
    multiplicadorPoder: 2.0,
    multiplicadorDefesa: 1.2,
    dificuldade: "dificil",
    descricao: "Um demônio das profundezas infernais!"
},
{
    nome: "Gigante de Gelo",
    emoji: "🧊",
    imagem: "gigante_gelo",
    multiplicadorVida: 2.8,
    multiplicadorPoder: 1.6,
    multiplicadorDefesa: 1.8,
    dificuldade: "dificil",
    descricao: "Um gigante congelante das montanhas!"
},
{
    nome: "Basilisco",
    emoji: "🐍",
    imagem: "basilisco",
    multiplicadorVida: 2.3,
    multiplicadorPoder: 2.2,
    multiplicadorDefesa: 1.0,
    dificuldade: "dificil",
    descricao: "Uma serpente que petrifica com o olhar!"
},
{
    nome: "Quimera",
    emoji: "🦁",
    imagem: "quimera",
    multiplicadorVida: 2.7,
    multiplicadorPoder: 2.0,
    multiplicadorDefesa: 1.3,
    dificuldade: "dificil",
    descricao: "Uma fera com cabeça de leão, corpo de cabra e cauda de serpente!"
},
{
    nome: "Fênix Jovem",
    emoji: "🔥",
    imagem: "fenix_jovem",
    multiplicadorVida: 2.0,
    multiplicadorPoder: 2.5,
    multiplicadorDefesa: 0.8,
    dificuldade: "dificil",
    descricao: "Uma ave de fogo que renasce das cinzas!"
},	

    // =============================================
    // 💀 CHEFES (Multiplicador 3.5 - 5.0)
    // =============================================
    {
        nome: "Rei Demônio",
        emoji: "👑",
        imagem: "rei_demonio",
        multiplicadorVida: 4.0,
        multiplicadorPoder: 2.5,
        multiplicadorDefesa: 2.0,
        dificuldade: "chefe",
        descricao: "O SENHOR DAS TREVAS! Enfrente-o com coragem!"
    },
    {
        nome: "Dragão Ancestral",
        emoji: "🐲",
        imagem: "dragao_ancestral",
        multiplicadorVida: 5.0,
        multiplicadorPoder: 2.0,
        multiplicadorDefesa: 2.5,
        dificuldade: "chefe",
        descricao: "UM DRAGÃO MILENAR! A maior ameaça do reino!"
    },
    {
        nome: "Lich",
        emoji: "🧙",
        imagem: "lich",
        multiplicadorVida: 3.5,
        multiplicadorPoder: 3.0,
        multiplicadorDefesa: 1.5,
        dificuldade: "chefe",
        descricao: "Um mago imortal que desafia a própria morte!"
    },
    {
        nome: "Titã",
        emoji: "🏛️",
        imagem: "tita",
        multiplicadorVida: 4.5,
        multiplicadorPoder: 2.2,
        multiplicadorDefesa: 2.8,
        dificuldade: "chefe",
        descricao: "Um titã antigo, filho dos deuses!"
    },
    {
        nome: "Leviatã",
        emoji: "🐋",
        imagem: "leviata",
        multiplicadorVida: 5.0,
        multiplicadorPoder: 2.5,
        multiplicadorDefesa: 2.0,
        dificuldade: "chefe",
        descricao: "A BESTA DO ABISMO! Devoradora de mundos!"
    },
    {
        nome: "Fênix Ancestral",
        emoji: "🌟",
        imagem: "fenix_ancestral",
        multiplicadorVida: 3.8,
        multiplicadorPoder: 3.5,
        multiplicadorDefesa: 1.2,
        dificuldade: "chefe",
        descricao: "A Fênix original, imortal e eterna!"
    },
    {
        nome: "Cérbero",
        emoji: "🐕",
        imagem: "cerbero",
        multiplicadorVida: 4.2,
        multiplicadorPoder: 2.8,
        multiplicadorDefesa: 2.2,
        dificuldade: "chefe",
        descricao: "O cão de três cabeças que guarda os portões do inferno!"
    }
];

// ========== INICIAR COMBATE COM DIFICULDADE ==========
function iniciarCombate(userId, nivel, multiplicadorGlobal = 1.0) {
    // Filtra inimigos pela dificuldade
    let inimigosDisponiveis = [...TIPOS_INIMIGOS];
    
    if (multiplicadorGlobal <= 0.6) {
        inimigosDisponiveis = inimigosDisponiveis.filter(i => i.dificuldade === "fácil");
    } else if (multiplicadorGlobal >= 3.0) {
        inimigosDisponiveis = inimigosDisponiveis.filter(i => i.dificuldade === "chefe");
    } else if (multiplicadorGlobal >= 1.8) {
        inimigosDisponiveis = inimigosDisponiveis.filter(i => 
            i.dificuldade === "difícil" || i.dificuldade === "chefe"
        );
    }
    
    // Escolhe um inimigo aleatório
    const tipo = inimigosDisponiveis[Math.floor(Math.random() * inimigosDisponiveis.length)];
    
    // Aplica multiplicador global
    const multiFinal = tipo.multiplicadorVida * multiplicadorGlobal;
    
    // Variação de nível
    const variacaoNivel = Math.floor(Math.random() * 5) - 2;
    const nivelInimigo = Math.max(1, nivel + variacaoNivel);
    
    // Calcula atributos
    const vidaBase = 100 + (nivelInimigo * 10);
    const poderBase = 10 + (nivelInimigo * 2);
    const defesaBase = 5 + Math.floor(nivelInimigo * 0.8);
    
    const vida = Math.floor(vidaBase * multiFinal);
    const poder = Math.floor(poderBase * tipo.multiplicadorPoder * multiplicadorGlobal);
    const defesa = Math.floor(defesaBase * tipo.multiplicadorDefesa * multiplicadorGlobal);
    
    // Bônus de recompensa
    let bonusRecompensa = 1;
    let bonusXP = 1;
    if (tipo.dificuldade === "chefe") {
        bonusRecompensa = 3;
        bonusXP = 3;
    } else if (tipo.dificuldade === "difícil") {
        bonusRecompensa = 2;
        bonusXP = 2;
    }
    
    const inimigo = {
        nome: `${tipo.emoji} ${tipo.nome}`,
        nivel: nivelInimigo,
        vidaMax: vida,
        vida: vida,
        poder: poder,
        defesa: defesa,
        dificuldade: tipo.dificuldade,
        descricao: tipo.descricao,
        emoji: tipo.emoji,
        imagem: tipo.imagem,
        bonusRecompensa: bonusRecompensa,
        bonusXP: bonusXP
    };
    
    combatesAtivos[userId] = inimigo;
    return inimigo;
}

function getCombate(userId) {
    return combatesAtivos[userId] || null;
}

function finalizarCombate(userId) {
    delete combatesAtivos[userId];
}

module.exports = {
    combatesAtivos,
    iniciarCombate,
    getCombate,
    finalizarCombate,
    TIPOS_INIMIGOS
};
