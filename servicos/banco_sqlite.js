// ============================================================
// BANCO DE DADOS SQLITE - COM SQL.JS (FUNCIONAL)
// ============================================================
const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../database/rpgbot.db");
let database = null;
let SQL = null;

// ===== INICIALIZAR BANCO =====
async function conectarDB() {
    if (database) return database;

    SQL = await initSqlJs();
    
    let data = null;
    if (fs.existsSync(DB_PATH)) {
        data = fs.readFileSync(DB_PATH);
    }
    
    database = new SQL.Database(data);
    await criarTabelas();
    console.log("✅ Banco de dados SQLite (sql.js) conectado!");
    return database;
}

// ===== CRIAR TABELAS =====
async function criarTabelas() {
    const db = await conectarDB();
    
    db.run(`
        CREATE TABLE IF NOT EXISTS jogadores (
            id TEXT PRIMARY KEY,
            nome TEXT NOT NULL,
            xp INTEGER DEFAULT 0,
            nivel INTEGER DEFAULT 1,
            stamina INTEGER DEFAULT 100,
            maxStamina INTEGER DEFAULT 100,
            fatigue INTEGER DEFAULT 0,
            saldo INTEGER DEFAULT 100,
            banco INTEGER DEFAULT 0,
            classe TEXT DEFAULT 'Sem Classe',
            vida INTEGER DEFAULT 100,
            vidaMax INTEGER DEFAULT 100,
            mana INTEGER DEFAULT 100,
            manaMax INTEGER DEFAULT 100,
            poder INTEGER DEFAULT 10,
            defesa INTEGER DEFAULT 5,
            critico INTEGER DEFAULT 5,
            esquiva INTEGER DEFAULT 3,
            arma TEXT,
            armadura TEXT,
            acessorio TEXT,
            inventario TEXT DEFAULT '{}',
            cooldowns TEXT DEFAULT '{}',
            restEnd INTEGER DEFAULT 0,
            trabalhosSeguidos INTEGER DEFAULT 0,
            ultimoTrabalho INTEGER DEFAULT 0,
            ultimoTrabalhoReal INTEGER DEFAULT 0,
            perguntasHoje INTEGER DEFAULT 0,
            ultimoResetPerguntas INTEGER DEFAULT 0
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS dungeons (
            id TEXT PRIMARY KEY,
            nome TEXT NOT NULL,
            progresso INTEGER DEFAULT 0,
            salaAtual INTEGER DEFAULT 0,
            estado TEXT DEFAULT '{}',
            iniciadoEm INTEGER DEFAULT 0,
            ultimoAcesso INTEGER DEFAULT 0,
            finalizada INTEGER DEFAULT 0
        )
    `);

    console.log("✅ Tabelas criadas/verificadas");
}

// ============================================================
// 📊 FUNÇÕES CRUD (TODAS COM VERIFICAÇÃO DO DB)
// ============================================================

function getDb() {
    if (!database) {
        throw new Error("Banco de dados não conectado. Use conectarDB() primeiro.");
    }
    return database;
}

function getJogador(userId) {
    try {
        const db = getDb();
        const result = db.exec("SELECT * FROM jogadores WHERE id = ?", [userId]);
        const row = result[0]?.values?.[0];
        if (row) {
            const columns = result[0].columns;
            const obj = {};
            columns.forEach((col, i) => { obj[col] = row[i]; });
            if (obj.inventario) obj.inventario = JSON.parse(obj.inventario);
            if (obj.cooldowns) obj.cooldowns = JSON.parse(obj.cooldowns);
            return obj;
        }
        return null;
    } catch (err) {
        console.log("❌ Erro ao buscar jogador:", err.message);
        return null;
    }
}

function saveJogador(userId, dados) {
    try {
        const db = getDb();
        db.run(`
            INSERT OR REPLACE INTO jogadores (
                id, nome, xp, nivel, stamina, maxStamina, fatigue,
                saldo, banco, classe, vida, vidaMax, mana, manaMax,
                poder, defesa, critico, esquiva, arma, armadura, acessorio,
                inventario, cooldowns, restEnd, trabalhosSeguidos,
                ultimoTrabalho, ultimoTrabalhoReal, perguntasHoje,
                ultimoResetPerguntas
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            userId,
            dados.nome || "Jogador",
            dados.xp || 0,
            dados.nivel || 1,
            dados.stamina || 100,
            dados.maxStamina || 100,
            dados.fatigue || 0,
            dados.saldo || 100,
            dados.banco || 0,
            dados.classe || "Sem Classe",
            dados.vida || 100,
            dados.vidaMax || 100,
            dados.mana || 100,
            dados.manaMax || 100,
            dados.poder || 10,
            dados.defesa || 5,
            dados.critico || 5,
            dados.esquiva || 3,
            dados.arma || null,
            dados.armadura || null,
            dados.acessorio || null,
            JSON.stringify(dados.inventario || {}),
            JSON.stringify(dados.cooldowns || {}),
            dados.restEnd || 0,
            dados.trabalhosSeguidos || 0,
            dados.ultimoTrabalho || 0,
            dados.ultimoTrabalhoReal || 0,
            dados.perguntasHoje || 0,
            dados.ultimoResetPerguntas || 0
        ]);
        return { id: userId, ...dados };
    } catch (err) {
        console.log("❌ Erro ao salvar jogador:", err.message);
        return null;
    }
}

function getAllJogadores() {
    try {
        const db = getDb();
        const result = db.exec("SELECT * FROM jogadores");
        if (!result[0]) return [];
        const columns = result[0].columns;
        return result[0].values.map(row => {
            const obj = {};
            columns.forEach((col, i) => { obj[col] = row[i]; });
            obj.inventario = JSON.parse(obj.inventario || "{}");
            obj.cooldowns = JSON.parse(obj.cooldowns || "{}");
            return obj;
        });
    } catch (err) {
        console.log("❌ Erro ao listar jogadores:", err.message);
        return [];
    }
}

function deleteJogador(userId) {
    try {
        const db = getDb();
        db.run("DELETE FROM jogadores WHERE id = ?", [userId]);
        return true;
    } catch (err) {
        console.log("❌ Erro ao deletar jogador:", err.message);
        return false;
    }
}

function getRankingXP(limite = 10) {
    try {
        const db = getDb();
        const result = db.exec(
            "SELECT id, nome, nivel, xp FROM jogadores ORDER BY nivel DESC, xp DESC LIMIT ?",
            [limite]
        );
        if (!result[0]) return [];
        const columns = result[0].columns;
        return result[0].values.map(row => {
            const obj = {};
            columns.forEach((col, i) => { obj[col] = row[i]; });
            return obj;
        });
    } catch (err) {
        console.log("❌ Erro ao buscar ranking:", err.message);
        return [];
    }
}

function saveDungeon(userId, dados) {
    try {
        const db = getDb();
        db.run(`
            INSERT OR REPLACE INTO dungeons (
                id, nome, progresso, salaAtual, estado, iniciadoEm,
                ultimoAcesso, finalizada
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            userId,
            dados.nome || "Dungeon",
            dados.progresso || 0,
            dados.salaAtual || 0,
            JSON.stringify(dados.estado || {}),
            dados.iniciadoEm || Date.now(),
            dados.ultimoAcesso || Date.now(),
            dados.finalizada ? 1 : 0
        ]);
        return { id: userId, ...dados };
    } catch (err) {
        console.log("❌ Erro ao salvar dungeon:", err.message);
        return null;
    }
}

function getDungeon(userId) {
    try {
        const db = getDb();
        const result = db.exec(
            "SELECT * FROM dungeons WHERE id = ? AND finalizada = 0",
            [userId]
        );
        const row = result[0]?.values?.[0];
        if (row) {
            const columns = result[0].columns;
            const obj = {};
            columns.forEach((col, i) => { obj[col] = row[i]; });
            obj.estado = JSON.parse(obj.estado || "{}");
            return obj;
        }
        return null;
    } catch (err) {
        console.log("❌ Erro ao buscar dungeon:", err.message);
        return null;
    }
}

function closeDB() {
    try {
        if (database) {
            const data = database.export();
            fs.writeFileSync(DB_PATH, data);
            console.log("✅ Banco de dados salvo e fechado");
        }
    } catch (err) {
        console.log("❌ Erro ao fechar banco:", err.message);
    }
}

// ============================================================
// 📤 EXPORTAÇÕES
// ============================================================

module.exports = {
    conectarDB,
    getJogador,
    saveJogador,
    getAllJogadores,
    deleteJogador,
    getRankingXP,
    saveDungeon,
    getDungeon,
    closeDB
};
