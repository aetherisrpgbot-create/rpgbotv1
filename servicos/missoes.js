// ============================================================
// SISTEMA DE MISSÕES - COMPLETO
// ============================================================
const fs = require("fs");
const { lerJogadores, escreverJogadores } = require("./banco");
const { MISSOES_BASE } = require("../dados/missoes");

const ARQ_MISSOES = "./database/missoes.json";

function lerMissoes() {
    try {
        if (!fs.existsSync(ARQ_MISSOES)) return {};
        const data = fs.readFileSync(ARQ_MISSOES, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.log("⚠️ Erro ao ler missões:", e.message);
        return {};
    }
}

function escreverMissoes(dados) {
    fs.writeFileSync(ARQ_MISSOES, JSON.stringify(dados, null, 2));
}

function getMissoesPorNivel(nivel) {
    if (nivel >= 501) return MISSOES_BASE["501-9999"] || [];
    if (nivel >= 101) return MISSOES_BASE["101-500"] || [];
    if (nivel >= 51) return MISSOES_BASE["51-100"] || [];
    if (nivel >= 31) return MISSOES_BASE["31-50"] || [];
    if (nivel >= 16) return MISSOES_BASE["16-30"] || [];
    if (nivel >= 6) return MISSOES_BASE["6-15"] || [];
    return MISSOES_BASE["1-5"] || [];
}

function getMissoesAtivas(userId) {
    const dados = lerMissoes();
    if (!dados[userId]) return [];
    return dados[userId].ativas || [];
}

function gerarMissoes(userId, nivel) {
    const dados = lerMissoes();
    if (!dados[userId]) {
        dados[userId] = { ativas: [], concluidas: [], ultimoReset: null };
    }

    const hoje = new Date().toDateString();
    if (dados[userId].ultimoReset !== hoje) {
        dados[userId].ativas = [];
        dados[userId].concluidas = [];
        dados[userId].ultimoReset = hoje;
    }

    while (dados[userId].ativas.length < 3) {
        const pool = getMissoesPorNivel(nivel);
        const disponiveis = pool.filter(m => 
            !dados[userId].concluidas.some(c => c.id === m.id)
        );
        
        if (disponiveis.length === 0) break;
        
        const idx = Math.floor(Math.random() * disponiveis.length);
        const missao = disponiveis[idx];
        dados[userId].ativas.push({
            ...missao,
            progresso: 0,
            concluida: false
        });
    }

    escreverMissoes(dados);
    return dados[userId].ativas || [];
}

function progressoMissao(userId, tipo) {
    console.log(`📊 progressoMissao: ${userId} - ${tipo}`);
    const dados = lerMissoes();
    if (!dados[userId]) return [];

    const ativas = dados[userId].ativas || [];
    let concluidas = [];

    for (let i = 0; i < ativas.length; i++) {
        const missao = ativas[i];
        if (missao.concluida) continue;
        if (missao.tipo === tipo) {
            missao.progresso = (missao.progresso || 0) + 1;
            console.log(`📊 Missão: ${missao.nome} - ${missao.progresso}/${missao.quantidade}`);
            
            if (missao.progresso >= missao.quantidade) {
                missao.concluida = true;
                concluidas.push(missao);
                console.log(`🎯 Missão concluída: ${missao.nome}`);
                
                // ===== APLICA RECOMPENSA =====
                const jogador = lerJogadores()[userId];
                if (jogador) {
                    if (missao.recompensa.xp) {
                        const { adicionarXP } = require("./jogador");
                        const result = adicionarXP(userId, jogador.nome, missao.recompensa.xp);
                        console.log(`⭐ +${missao.recompensa.xp} XP`, result);
                    }
                    if (missao.recompensa.dinheiro) {
                        jogador.saldo = (jogador.saldo || 0) + missao.recompensa.dinheiro;
                        console.log(`💰 +R$${missao.recompensa.dinheiro}`);
                        escreverJogadores(lerJogadores());
                    }
                }
                
                if (!dados[userId].concluidas) dados[userId].concluidas = [];
                dados[userId].concluidas.push({ id: missao.id, nome: missao.nome });
            }
        }
    }

    dados[userId].ativas = ativas.filter(m => !m.concluida);

    const nivel = require("./jogador").getJogador(userId, "Jogador").nivel;
    while (dados[userId].ativas.length < 3) {
        const pool = getMissoesPorNivel(nivel);
        const disponiveis = pool.filter(m => 
            !dados[userId].concluidas.some(c => c.id === m.id)
        );
        if (disponiveis.length === 0) break;
        const idx = Math.floor(Math.random() * disponiveis.length);
        const missao = disponiveis[idx];
        dados[userId].ativas.push({
            ...missao,
            progresso: 0,
            concluida: false
        });
    }

    escreverMissoes(dados);
    console.log(`✅ Missões concluídas: ${concluidas.length}`);
    return concluidas;
}

function resetarMissoes(userId) {
    const dados = lerMissoes();
    if (!dados[userId]) {
        dados[userId] = { ativas: [], concluidas: [], ultimoReset: null };
    }
    dados[userId].ativas = [];
    dados[userId].concluidas = [];
    dados[userId].ultimoReset = null;
    escreverMissoes(dados);
    console.log(`🔄 Missões resetadas para ${userId}`);
    return true;
}

module.exports = {
    gerarMissoes,
    progressoMissao,
    getMissoesAtivas,
    resetarMissoes
};
