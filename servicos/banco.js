// ============================================================
// BANCO DE DADOS - Ler/Escrever JSON
// ============================================================
const fs = require("fs");

function lerJSON(arquivo) {
    try {
        if (!fs.existsSync(arquivo)) return {};
        const data = fs.readFileSync(arquivo, 'utf8');
        if (!data.trim()) return {};
        return JSON.parse(data);
    } catch (e) {
        console.log("⚠️ JSON corrompido:", arquivo);
        return {};
    }
}

function escreverJSON(arquivo, dados) {
    fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2));
}

// ========== ARQUIVOS ESPECÍFICOS ==========
const ARQ_JOGADOR = "./ARQ_JOGADOR.json";
const ARQ_MUTADOS = "./database/mutados.json";
const ARQ_ADV = "./database/advertencias.json";

function lerJogadores() {
    return lerJSON(ARQ_JOGADOR);
}

function escreverJogadores(dados) {
    escreverJSON(ARQ_JOGADOR, dados);
}

function lerMutados() {
    return lerJSON(ARQ_MUTADOS);
}

function escreverMutados(dados) {
    escreverJSON(ARQ_MUTADOS, dados);
}

function lerAdvertencias() {
    return lerJSON(ARQ_ADV);
}

function escreverAdvertencias(dados) {
    escreverJSON(ARQ_ADV, dados);
}

module.exports = {
    lerJSON,
    escreverJSON,
    lerJogadores,
    escreverJogadores,
    lerMutados,
    escreverMutados,
    lerAdvertencias,
    escreverAdvertencias,
    ARQ_JOGADOR
};
