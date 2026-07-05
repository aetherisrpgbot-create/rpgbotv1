// ============================================================
// BANCO DE MISSÕES - VERSÃO COMPLETA
// ============================================================

const MISSOES_BASE = {
    // ===== NÍVEL 1-5 =====
    "1-5": [
        { id: "matar_1", nome: "🧪 Iniciante em Combate", descricao: "Derrote 1 inimigo", tipo: "matar", quantidade: 1, recompensa: { xp: 50, dinheiro: 100 } },
        { id: "matar_3", nome: "🐺 Aprendiz de Guerreiro", descricao: "Derrote 3 inimigos", tipo: "matar", quantidade: 3, recompensa: { xp: 100, dinheiro: 200 } },
        { id: "treinar_2", nome: "💪 Treinador Iniciante", descricao: "Treine 2 vezes", tipo: "treinar", quantidade: 2, recompensa: { xp: 80, dinheiro: 150 } },
        { id: "perguntas_3", nome: "🧠 Curioso", descricao: "Responda 3 perguntas", tipo: "perguntas", quantidade: 3, recompensa: { xp: 60, dinheiro: 100 } },
    ],
    
    // ===== NÍVEL 6-15 =====
    "6-15": [
        { id: "matar_10", nome: "⚔️ Guerreiro Experiente", descricao: "Derrote 10 inimigos", tipo: "matar", quantidade: 10, recompensa: { xp: 300, dinheiro: 500 } },
        { id: "matar_5_dificil", nome: "🔥 Matador de Monstros", descricao: "Derrote 5 inimigos difíceis", tipo: "matar", quantidade: 5, recompensa: { xp: 400, dinheiro: 600 } },
        { id: "treinar_5", nome: "🏋️ Treinador Dedicado", descricao: "Treine 5 vezes", tipo: "treinar", quantidade: 5, recompensa: { xp: 200, dinheiro: 300 } },
        { id: "perguntas_10", nome: "📚 Mestre do Quiz", descricao: "Responda 10 perguntas", tipo: "perguntas", quantidade: 10, recompensa: { xp: 250, dinheiro: 350 } },
        { id: "skills_5", nome: "✨ Aprendiz de Habilidades", descricao: "Use 5 skills", tipo: "skills", quantidade: 5, recompensa: { xp: 200, dinheiro: 250 } },
        { id: "trabalhar_10", nome: "💼 Trabalhador Dedicado", descricao: "Trabalhe 10 vezes", tipo: "trabalhar", quantidade: 10, recompensa: { xp: 150, dinheiro: 400 } },
    ],

    // ===== NÍVEL 16-30 =====
    "16-30": [
        { id: "matar_20", nome: "🗡️ Matador de Elite", descricao: "Derrote 20 inimigos", tipo: "matar", quantidade: 20, recompensa: { xp: 600, dinheiro: 1000 } },
        { id: "matar_chefe", nome: "👑 Matador de Chefes", descricao: "Derrote 1 chefe", tipo: "matar", quantidade: 1, recompensa: { xp: 800, dinheiro: 1200 } },
        { id: "treinar_15", nome: "🔥 Mestre do Treino", descricao: "Treine 15 vezes", tipo: "treinar", quantidade: 15, recompensa: { xp: 500, dinheiro: 800 } },
        { id: "perguntas_20", nome: "🧙 Sábio do Conhecimento", descricao: "Responda 20 perguntas", tipo: "perguntas", quantidade: 20, recompensa: { xp: 500, dinheiro: 800 } },
        { id: "skills_15", nome: "🌟 Mestre das Habilidades", descricao: "Use 15 skills", tipo: "skills", quantidade: 15, recompensa: { xp: 400, dinheiro: 500 } },
        { id: "trabalhar_20", nome: "💎 Trabalhador Veterano", descricao: "Trabalhe 20 vezes", tipo: "trabalhar", quantidade: 20, recompensa: { xp: 350, dinheiro: 700 } },
    ],

    // ===== NÍVEL 31-50 =====
    "31-50": [
        { id: "matar_50", nome: "⚔️ Guerreiro Elite", descricao: "Derrote 50 inimigos", tipo: "matar", quantidade: 50, recompensa: { xp: 1500, dinheiro: 2500 } },
        { id: "matar_chefe_3", nome: "👑 Exterminador de Chefes", descricao: "Derrote 3 chefes", tipo: "matar", quantidade: 3, recompensa: { xp: 2000, dinheiro: 3000 } },
        { id: "treinar_30", nome: "🏆 Treinador Elite", descricao: "Treine 30 vezes", tipo: "treinar", quantidade: 30, recompensa: { xp: 1000, dinheiro: 1500 } },
        { id: "perguntas_30", nome: "📜 Sábio Elite", descricao: "Responda 30 perguntas", tipo: "perguntas", quantidade: 30, recompensa: { xp: 800, dinheiro: 1500 } },
        { id: "skills_25", nome: "💫 Mestre Elite", descricao: "Use 25 skills", tipo: "skills", quantidade: 25, recompensa: { xp: 1000, dinheiro: 1500 } },
        { id: "trabalhar_30", nome: "💰 Trabalhador Elite", descricao: "Trabalhe 30 vezes", tipo: "trabalhar", quantidade: 30, recompensa: { xp: 600, dinheiro: 1500 } },
    ],

    // ===== NÍVEL 51-100 =====
    "51-100": [
        { id: "matar_100", nome: "🐉 Matador de Dragões", descricao: "Derrote 100 inimigos", tipo: "matar", quantidade: 100, recompensa: { xp: 3000, dinheiro: 5000 } },
        { id: "matar_chefe_5", nome: "💀 Aniquilador de Chefes", descricao: "Derrote 5 chefes", tipo: "matar", quantidade: 5, recompensa: { xp: 4000, dinheiro: 6000 } },
        { id: "treinar_50", nome: "🌟 Treinador Lendário", descricao: "Treine 50 vezes", tipo: "treinar", quantidade: 50, recompensa: { xp: 2000, dinheiro: 3000 } },
        { id: "perguntas_50", nome: "📖 Sábio Lendário", descricao: "Responda 50 perguntas", tipo: "perguntas", quantidade: 50, recompensa: { xp: 1500, dinheiro: 3000 } },
        { id: "skills_40", nome: "⚡ Mestre Lendário", descricao: "Use 40 skills", tipo: "skills", quantidade: 40, recompensa: { xp: 2000, dinheiro: 3000 } },
        { id: "trabalhar_50", nome: "💵 Trabalhador Lendário", descricao: "Trabalhe 50 vezes", tipo: "trabalhar", quantidade: 50, recompensa: { xp: 1000, dinheiro: 3000 } },
    ],

    // ===== NÍVEL 101-500 =====
    "101-500": [
        { id: "matar_200", nome: "⚔️ Guerreiro Épico", descricao: "Derrote 200 inimigos", tipo: "matar", quantidade: 200, recompensa: { xp: 5000, dinheiro: 8000 } },
        { id: "matar_chefe_10", nome: "👑 Matador de Chefes Épico", descricao: "Derrote 10 chefes", tipo: "matar", quantidade: 10, recompensa: { xp: 8000, dinheiro: 12000 } },
        { id: "treinar_100", nome: "🔥 Treinador Épico", descricao: "Treine 100 vezes", tipo: "treinar", quantidade: 100, recompensa: { xp: 3000, dinheiro: 5000 } },
        { id: "perguntas_100", nome: "📚 Sábio Épico", descricao: "Responda 100 perguntas", tipo: "perguntas", quantidade: 100, recompensa: { xp: 3000, dinheiro: 5000 } },
        { id: "skills_80", nome: "💫 Mestre Épico", descricao: "Use 80 skills", tipo: "skills", quantidade: 80, recompensa: { xp: 3000, dinheiro: 5000 } },
        { id: "trabalhar_100", nome: "💰 Trabalhador Épico", descricao: "Trabalhe 100 vezes", tipo: "trabalhar", quantidade: 100, recompensa: { xp: 2000, dinheiro: 5000 } },
    ],

    // ===== NÍVEL 501-9999 =====
    "501-9999": [
        { id: "matar_500", nome: "🐉 Destruidor de Mundos", descricao: "Derrote 500 inimigos", tipo: "matar", quantidade: 500, recompensa: { xp: 15000, dinheiro: 25000 } },
        { id: "matar_chefe_20", nome: "💀 Senhor dos Chefes", descricao: "Derrote 20 chefes", tipo: "matar", quantidade: 20, recompensa: { xp: 20000, dinheiro: 30000 } },
        { id: "treinar_200", nome: "🌟 Treinador Supremo", descricao: "Treine 200 vezes", tipo: "treinar", quantidade: 200, recompensa: { xp: 8000, dinheiro: 12000 } },
        { id: "perguntas_200", nome: "📖 Sábio Supremo", descricao: "Responda 200 perguntas", tipo: "perguntas", quantidade: 200, recompensa: { xp: 8000, dinheiro: 15000 } },
        { id: "skills_150", nome: "⚡ Mestre Supremo", descricao: "Use 150 skills", tipo: "skills", quantidade: 150, recompensa: { xp: 8000, dinheiro: 12000 } },
        { id: "trabalhar_200", nome: "💎 Trabalhador Supremo", descricao: "Trabalhe 200 vezes", tipo: "trabalhar", quantidade: 200, recompensa: { xp: 6000, dinheiro: 15000 } },
    ]
};

module.exports = { MISSOES_BASE };
