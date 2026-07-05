// ============================================================
// ITENS DO RPG - VERSÃO COMPLETA
// ============================================================
const ITENS = {

// =====================================================
// ⚔️ GUERREIRO
// =====================================================

guerreiro_espada_madeira: {
    id: "guerreiro_espada_madeira",
    nome: "🪵 Espada de Madeira",
    tipo: "arma",
    classe: "guerreiro",
    ataque: 2,
    valor: 50
},

guerreiro_espada_ferro: {
    id: "guerreiro_espada_ferro",
    nome: "⚔️ Espada de Ferro",
    tipo: "arma",
    classe: "guerreiro",
    ataque: 5,
    valor: 120
},

guerreiro_espada_longa: {
    id: "guerreiro_espada_longa",
    nome: "🗡️ Espada Longa",
    tipo: "arma",
    classe: "guerreiro",
    ataque: 9,
    valor: 350
},

guerreiro_machado_guerra: {
    id: "guerreiro_machado_guerra",
    nome: "🪓 Machado de Guerra",
    tipo: "arma",
    classe: "guerreiro",
    ataque: 14,
    valor: 600
},

guerreiro_armadura_couro: {
    id: "guerreiro_armadura_couro",
    nome: "🛡️ Armadura de Couro",
    tipo: "armadura",
    classe: "guerreiro",
    defesa: 5,
    valor: 150
},

guerreiro_armadura_ferro: {
    id: "guerreiro_armadura_ferro",
    nome: "🛡️ Armadura de Ferro",
    tipo: "armadura",
    classe: "guerreiro",
    defesa: 10,
    valor: 400
},

guerreiro_armadura_rei: {
    id: "guerreiro_armadura_rei",
    nome: "👑 Armadura Real",
    tipo: "armadura",
    classe: "guerreiro",
    defesa: 18,
    valor: 1200
},

guerreiro_escudo: {
    id: "guerreiro_escudo",
    nome: "🛡️ Escudo de Defesa",
    tipo: "armadura",
    classe: "guerreiro",
    defesa: 8,
    valor: 300
},

guerreiro_anel_forca: {
    id: "guerreiro_anel_forca",
    nome: "💍 Anel da Força",
    tipo: "acessorio",
    classe: "guerreiro",
    ataque: 3,
    valor: 250
},

guerreiro_colar_ferro: {
    id: "guerreiro_colar_ferro",
    nome: "📿 Colar de Ferro",
    tipo: "acessorio",
    classe: "guerreiro",
    defesa: 3,
    valor: 200
},

guerreiro_bracelete: {
    id: "guerreiro_bracelete",
    nome: "🔗 Bracelete de Combate",
    tipo: "acessorio",
    classe: "guerreiro",
    ataque: 2,
    defesa: 2,
    valor: 180
},

// =====================================================
// 🧙 MAGO
// =====================================================

mago_cajado_madeira: {
    id: "mago_cajado_madeira",
    nome: "🪄 Cajado de Madeira",
    tipo: "arma",
    classe: "mago",
    ataque: 3,
    valor: 80
},

mago_cajado_aprendiz: {
    id: "mago_cajado_aprendiz",
    nome: "✨ Cajado do Aprendiz",
    tipo: "arma",
    classe: "mago",
    ataque: 6,
    valor: 150
},

mago_cajado_arcano: {
    id: "mago_cajado_arcano",
    nome: "🔮 Cajado Arcano",
    tipo: "arma",
    classe: "mago",
    ataque: 12,
    critico: 5,
    valor: 500
},

mago_cajado_caos: {
    id: "mago_cajado_caos",
    nome: "🌌 Cajado do Caos",
    tipo: "arma",
    classe: "mago",
    ataque: 20,
    critico: 10,
    valor: 1500
},

mago_manto_iniciante: {
    id: "mago_manto_iniciante",
    nome: "🧥 Manto Iniciante",
    tipo: "armadura",
    classe: "mago",
    defesa: 3,
    valor: 120
},

mago_manto_arcano: {
    id: "mago_manto_arcano",
    nome: "🌙 Manto Arcano",
    tipo: "armadura",
    classe: "mago",
    defesa: 7,
    valor: 400
},

mago_manto_sombras: {
    id: "mago_manto_sombras",
    nome: "🌑 Manto das Sombras",
    tipo: "armadura",
    classe: "mago",
    defesa: 12,
    valor: 900
},

mago_manto_imperial: {
    id: "mago_manto_imperial",
    nome: "👑 Manto Imperial",
    tipo: "armadura",
    classe: "mago",
    defesa: 18,
    valor: 1500
},

mago_anel_mana: {
    id: "mago_anel_mana",
    nome: "🔵 Anel de Mana",
    tipo: "acessorio",
    classe: "mago",
    critico: 3,
    valor: 300
},

mago_talisma: {
    id: "mago_talisma",
    nome: "📿 Talisma Arcano",
    tipo: "acessorio",
    classe: "mago",
    ataque: 2,
    critico: 2,
    valor: 250
},

mago_livro_sagrado: {
    id: "mago_livro_sagrado",
    nome: "📖 Livro Sagrado",
    tipo: "acessorio",
    classe: "mago",
    ataque: 3,
    valor: 400
},

// =====================================================
// 🗡️ ASSASSINO
// =====================================================

assassino_adaga: {
    id: "assassino_adaga",
    nome: "🗡️ Adaga",
    tipo: "arma",
    classe: "assassino",
    ataque: 4,
    valor: 100
},

assassino_adaga_sombria: {
    id: "assassino_adaga_sombria",
    nome: "🌑 Adaga Sombria",
    tipo: "arma",
    classe: "assassino",
    ataque: 10,
    critico: 6,
    valor: 500
},

assassino_lamina_fantasma: {
    id: "assassino_lamina_fantasma",
    nome: "👻 Lâmina Fantasma",
    tipo: "arma",
    classe: "assassino",
    ataque: 15,
    critico: 8,
    valor: 900
},

assassino_veneno: {
    id: "assassino_veneno",
    nome: "☠️ Lâmina Envenenada",
    tipo: "arma",
    classe: "assassino",
    ataque: 18,
    valor: 1200
},

assassino_capa: {
    id: "assassino_capa",
    nome: "🖤 Capa Sombria",
    tipo: "armadura",
    classe: "assassino",
    defesa: 4,
    esquiva: 5,
    valor: 300
},

assassino_armadura_leve: {
    id: "assassino_armadura_leve",
    nome: "🕶️ Armadura Leve",
    tipo: "armadura",
    classe: "assassino",
    defesa: 7,
    esquiva: 6,
    valor: 500
},

assassino_sombra: {
    id: "assassino_sombra",
    nome: "🌘 Armadura da Sombra",
    tipo: "armadura",
    classe: "assassino",
    defesa: 12,
    esquiva: 10,
    valor: 1000
},

assassino_anel_agilidade: {
    id: "assassino_anel_agilidade",
    nome: "💍 Anel da Agilidade",
    tipo: "acessorio",
    classe: "assassino",
    esquiva: 4,
    valor: 300
},

assassino_colar_silencio: {
    id: "assassino_colar_silencio",
    nome: "📿 Colar do Silêncio",
    tipo: "acessorio",
    classe: "assassino",
    critico: 3,
    valor: 280
},

assassino_luva: {
    id: "assassino_luva",
    nome: "🧤 Luvas de Sombra",
    tipo: "acessorio",
    classe: "assassino",
    ataque: 2,
    esquiva: 2,
    valor: 250
},

// =====================================================
// 🏹 ARQUEIRO
// =====================================================

arqueiro_arco_curto: {
    id: "arqueiro_arco_curto",
    nome: "🏹 Arco Curto",
    tipo: "arma",
    classe: "arqueiro",
    ataque: 4,
    valor: 90
},

arqueiro_arco_longo: {
    id: "arqueiro_arco_longo",
    nome: "🎯 Arco Longo",
    tipo: "arma",
    classe: "arqueiro",
    ataque: 10,
    critico: 4,
    valor: 500
},

arqueiro_arco_elfico: {
    id: "arqueiro_arco_elfico",
    nome: "🧝 Arco Élfico",
    tipo: "arma",
    classe: "arqueiro",
    ataque: 15,
    critico: 7,
    valor: 900
},

arqueiro_arco_aurora: {
    id: "arqueiro_arco_aurora",
    nome: "🌅 Arco da Aurora",
    tipo: "arma",
    classe: "arqueiro",
    ataque: 20,
    critico: 10,
    valor: 1500
},

arqueiro_veste: {
    id: "arqueiro_veste",
    nome: "🥋 Veste do Caçador",
    tipo: "armadura",
    classe: "arqueiro",
    defesa: 4,
    esquiva: 3,
    valor: 180
},

arqueiro_armadura_couro: {
    id: "arqueiro_armadura_couro",
    nome: "🧥 Armadura de Couro",
    tipo: "armadura",
    classe: "arqueiro",
    defesa: 7,
    esquiva: 4,
    valor: 400
},

arqueiro_manto_forestal: {
    id: "arqueiro_manto_forestal",
    nome: "🌲 Manto Florestal",
    tipo: "armadura",
    classe: "arqueiro",
    defesa: 10,
    esquiva: 7,
    valor: 800
},

arqueiro_armadura_sagrada: {
    id: "arqueiro_armadura_sagrada",
    nome: "✨ Armadura Sagrada",
    tipo: "armadura",
    classe: "arqueiro",
    defesa: 15,
    esquiva: 10,
    valor: 1400
},

arqueiro_anel_olho: {
    id: "arqueiro_anel_olho",
    nome: "👁️ Anel do Olho Preciso",
    tipo: "acessorio",
    classe: "arqueiro",
    critico: 4,
    valor: 300
},

arqueiro_colar_vento: {
    id: "arqueiro_colar_vento",
    nome: "🌬️ Colar do Vento",
    tipo: "acessorio",
    classe: "arqueiro",
    esquiva: 4,
    valor: 280
},

arqueiro_bota: {
    id: "arqueiro_bota",
    nome: "👢 Botas Leves",
    tipo: "acessorio",
    classe: "arqueiro",
    esquiva: 2,
    valor: 200
},

// =====================================================
// 🧪 CONSUMÍVEIS / GERAIS
// =====================================================

pocao_vida: {
    id: "pocao_vida",
    nome: "🧪 Poção de Vida",
    tipo: "consumivel",
    cura: 50,
    valor: 80
},

pocao_grande: {
    id: "pocao_grande",
    nome: "💉 Grande Poção de Vida",
    tipo: "consumivel",
    cura: 150,
    valor: 250
},

pocao_mana: {
    id: "pocao_mana",
    nome: "🔵 Poção de Mana",
    tipo: "consumivel",
    mana: 80,
    valor: 120
},

elixir_forca: {
    id: "elixir_forca",
    nome: "💪 Elixir de Força",
    tipo: "consumivel",
    buff_ataque: 10,
    valor: 200
},

elixir_sorte: {
    id: "elixir_sorte",
    nome: "🍀 Elixir da Sorte",
    tipo: "consumivel",
    critico: 5,
    valor: 300
},

pocao_stamina: {
    id: "pocao_stamina",
    nome: "⚡ Poção de Stamina",
    tipo: "consumivel",
    stamina: 80,
    valor: 100
},

antidoto: {
    id: "antidoto",
    nome: "🧴 Antídoto",
    tipo: "consumivel",
    cura_status: true,
    valor: 150
}

};

module.exports = ITENS;
