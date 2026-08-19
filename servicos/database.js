// ============================================================
// BANCO DE DADOS - RPGBOT 1.1
// ============================================================
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../database");

// ===== GARANTE QUE A PASTA EXISTE =====
if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(DB_PATH, { recursive: true });
}

// ===== FUNÇÃO GENÉRICA PARA LER JSON =====
function lerDB(arquivo) {
    try {
        const caminho = path.join(DB_PATH, arquivo);
        if (!fs.existsSync(caminho)) {
            fs.writeFileSync(caminho, JSON.stringify({}, null, 2));
            return {};
        }
        const data = fs.readFileSync(caminho, "utf8");
        return JSON.parse(data);
    } catch (e) {
        console.log(`⚠️ Erro ao ler ${arquivo}:`, e.message);
        return {};
    }
}

// ===== FUNÇÃO GENÉRICA PARA SALVAR JSON =====
function salvarDB(arquivo, dados) {
    try {
        const caminho = path.join(DB_PATH, arquivo);
        fs.writeFileSync(caminho, JSON.stringify(dados, null, 2));
        return true;
    } catch (e) {
        console.log(`⚠️ Erro ao salvar ${arquivo}:`, e.message);
        return false;
    }
}

// ============================================================
// 📊 LOGS DE COMANDOS
// ============================================================

function logComando(userId, comando, args, remoteJid) {
    const logs = lerDB("logs_comandos.json");
    const hoje = new Date().toISOString().split("T")[0];
    
    if (!logs[userId]) {
        logs[userId] = {
            nome: "Desconhecido",
            historico: []
        };
    }
    
    logs[userId].historico.push({
        data: new Date().toISOString(),
        comando: comando,
        args: args,
        grupo: remoteJid || "PV"
    });
    
    // Mantém só os últimos 100 comandos por usuário
    if (logs[userId].historico.length > 100) {
        logs[userId].historico = logs[userId].historico.slice(-100);
    }
    
    salvarDB("logs_comandos.json", logs);
}

// ============================================================
// 🗣️ HISTÓRICO DE CONVERSAS COM IA
// ============================================================

function salvarConversaIA(userId, personagem, pergunta, resposta) {
    const conversas = lerDB("conversas_ia.json");
    const hoje = new Date().toISOString().split("T")[0];
    
    if (!conversas[userId]) {
        conversas[userId] = {
            nome: "Desconhecido",
            conversas: []
        };
    }
    
    conversas[userId].conversas.push({
        data: new Date().toISOString(),
        personagem: personagem,
        pergunta: pergunta,
        resposta: resposta
    });
    
    // Mantém só as últimas 50 conversas por usuário
    if (conversas[userId].conversas.length > 50) {
        conversas[userId].conversas = conversas[userId].conversas.slice(-50);
    }
    
    salvarDB("conversas_ia.json", conversas);
}

// ============================================================
// 📈 ESTATÍSTICAS DO BOT
// ============================================================

function atualizarEstatisticas(comando, userId) {
    const stats = lerDB("estatisticas.json");
    const hoje = new Date().toISOString().split("T")[0];
    
    if (!stats.total) stats.total = 0;
    if (!stats.porComando) stats.porComando = {};
    if (!stats.porDia) stats.porDia = {};
    if (!stats.usuarios) stats.usuarios = {};
    if (!stats.hoje) stats.hoje = hoje;
    
    // Reseta contador diário se for um novo dia
    if (stats.hoje !== hoje) {
        stats.hoje = hoje;
        stats.porDia[hoje] = 0;
    }
    
    // Conta comandos
    stats.total++;
    stats.porDia[hoje] = (stats.porDia[hoje] || 0) + 1;
    stats.porComando[comando] = (stats.porComando[comando] || 0) + 1;
    stats.usuarios[userId] = (stats.usuarios[userId] || 0) + 1;
    
    salvarDB("estatisticas.json", stats);
}

// ============================================================
// 👤 PERFIL AVANÇADO DO JOGADOR
// ============================================================

function atualizarPerfilAvancado(userId, dados) {
    const perfis = lerDB("perfis_avancados.json");
    
    if (!perfis[userId]) {
        perfis[userId] = {
            primeiroAcesso: new Date().toISOString(),
            totalComandos: 0,
            totalConversasIA: 0,
            ultimoAcesso: null,
            comandosFavoritos: {},
            conquistas: []
        };
    }
    
    perfis[userId].ultimoAcesso = new Date().toISOString();
    perfis[userId].totalComandos = (perfis[userId].totalComandos || 0) + 1;
    
    // Atualiza dados fornecidos
    if (dados) {
        Object.assign(perfis[userId], dados);
    }
    
    salvarDB("perfis_avancados.json", perfis);
}

// ============================================================
// 🏆 CONQUISTAS
// ============================================================

const CONQUISTAS = {
    "primeiro_passo": {
        nome: "👣 Primeiro Passo",
        descricao: "Use seu primeiro comando"
    },
    "guerreiro_nato": {
        nome: "⚔️ Guerreiro Nato",
        descricao: "Use !treino 10 vezes"
    },
    "explorador": {
        nome: "🗺️ Explorador",
        descricao: "Complete uma dungeon"
    },
    "milionario": {
        nome: "💰 Milionário",
        descricao: "Acumule R$ 1.000.000"
    },
    "lenda_viva": {
        nome: "👑 Lenda Viva",
        descricao: "Chegue ao nível 100"
    },
    "sabio": {
        nome: "🧙 Sábio",
        descricao: "Converse com todos os personagens IA"
    },
    "colecionador": {
        nome: "🎯 Colecionador",
        descricao: "Tenha 10 itens diferentes"
    },
    "sobrevivente": {
        nome: "🔥 Sobrevivente",
        descricao: "Sobreviva a uma batalha com 1 de vida"
    },
    "assassino_lendario": {
        nome: "🗡️ Assassino Lendário",
        descricao: "Derrote 100 inimigos"
    },
    "aventureiro_experiente": {
        nome: "🎒 Aventureiro Experiente",
        descricao: "Use 50 comandos diferentes"
    }
};

function desbloquearConquista(userId, conquistaId) {
    const perfis = lerDB("perfis_avancados.json");
    
    if (!perfis[userId]) {
        perfis[userId] = { conquistas: [] };
    }
    
    if (!perfis[userId].conquistas) {
        perfis[userId].conquistas = [];
    }
    
    if (!perfis[userId].conquistas.includes(conquistaId)) {
        perfis[userId].conquistas.push(conquistaId);
        salvarDB("perfis_avancados.json", perfis);
        return true;
    }
    
    return false;
}

// ============================================================
// 🔍 CONSULTAS
// ============================================================

function getLogsUsuario(userId) {
    const logs = lerDB("logs_comandos.json");
    return logs[userId] || null;
}

function getConversasIA(userId) {
    const conversas = lerDB("conversas_ia.json");
    return conversas[userId] || null;
}

function getEstatisticas() {
    return lerDB("estatisticas.json");
}

function getPerfilAvancado(userId) {
    const perfis = lerDB("perfis_avancados.json");
    return perfis[userId] || null;
}

function getTopUsuarios(limite = 10) {
    const stats = lerDB("estatisticas.json");
    const usuarios = stats.usuarios || {};
    
    return Object.entries(usuarios)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limite)
        .map(([id, count]) => ({ id, comandos: count }));
}

function getComandosMaisUsados(limite = 10) {
    const stats = lerDB("estatisticas.json");
    const comandos = stats.porComando || {};
    
    return Object.entries(comandos)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limite)
        .map(([comando, count]) => ({ comando, usos: count }));
}

// ============================================================
// EXPORTAÇÕES
// ============================================================

module.exports = {
    // Básico
    lerDB,
    salvarDB,
    
    // Logs
    logComando,
    getLogsUsuario,
    
    // IA
    salvarConversaIA,
    getConversasIA,
    
    // Estatísticas
    atualizarEstatisticas,
    getEstatisticas,
    getTopUsuarios,
    getComandosMaisUsados,
    
    // Perfil avançado
    atualizarPerfilAvancado,
    getPerfilAvancado,
    
    // Conquistas
    desbloquearConquista,
    CONQUISTAS
};
