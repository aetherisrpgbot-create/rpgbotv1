// ============================================================
// SISTEMA DE DUNGEON - VERSÃO ROBUSTA E COMPLETA
// ============================================================
const fs = require("fs");
const path = require("path");
const { getJogador, adicionarXP, atualizarSaldo } = require("./jogador");
const { lerJogadores, escreverJogadores } = require("./banco");
const { gerarResposta } = require("./ia");

// ===== CONSTANTES =====
const TEMPO_EXPIRACAO = 1800000; // 30 minutos
const TEMPO_LIMPEZA = 300000; // 5 minutos

// ===== ESTADO GLOBAL =====
const dungeonsAtivas = new Map();
const dungeonCache = new Map();

// ============================================================
// 📜 LORES DAS DUNGEONS
// ============================================================
const LORES = {
    catacumbas_de_vhalor: `
🏚️ *AS CATACUMBAS DE VHALOR*

Nos arredores da antiga cidade de Vhalor, escondida sob uma capela em ruínas, existe uma escadaria de pedra que desce até um labirinto esquecido pelo tempo. Os registros da Ordem afirmam que aquele lugar já foi um santuário onde cavaleiros guardavam um dos primeiros Fragmentos do Coração do Mundo.

Quando a Grande Ruptura aconteceu, uma energia sombria invadiu as catacumbas. Os guardiões morreram... mas nunca encontraram descanso.

Hoje, suas armaduras vazias ainda caminham pelos corredores, arqueiros espectrais vigiam as passagens silenciosas, e criaturas alimentadas pela escuridão espreitam cada esquina. Dizem que as paredes sussurram os nomes daqueles que jamais conseguiram escapar.

No centro da masmorra repousa um enorme portão de pedra, marcado por uma espada quebrada. Atrás dele aguarda Sir Aldren, o Guardião Esquecido — o último comandante de Vhalor. Corrompido pela energia do Fragmento, ele jurou que ninguém pisaria naquele salão enquanto ainda pudesse erguer sua espada.

*Objetivo:* atravesse os corredores de Vhalor, derrote as criaturas corrompidas e enfrente Sir Aldren.

*"Toda lenda começa enfrentando seus primeiros medos."*`,
    
    aetheris: `
🌍 *A CRÔNICA DE AETHERIS*

Muito antes do primeiro reino ser erguido, existia apenas um continente conhecido como Aetheris.
Seu equilíbrio era mantido pelo Coração do Mundo, uma fonte de poder criada pelos deuses.
Ele controlava o fluxo da vida, da magia, das estações, dos mares e do destino de todas as criaturas.

Mas uma entidade conhecida como O Devorador surgiu do vazio.
Sua ambição era consumir toda a energia do Coração e remodelar Aetheris.
A guerra durou décadas. Reinos inteiros desapareceram.
O Devorador foi derrotado, mas o Coração se partiu em centenas de fragmentos.

Começou a Era do Caos.

Séculos depois, a Ordem do RPGBOT foi fundada.
Seu objetivo: reunir aventureiros, treiná-los e recuperar os fragmentos perdidos.
Você é um desses aventureiros. Sua jornada começa agora.`
};

// ============================================================
// 🛠️ FUNÇÕES AUXILIARES
// ============================================================

function log(tipo, mensagem, dados = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🏰 ${tipo}: ${mensagem}`);
    if (dados) console.log(`   📊`, dados);
}

function validarDungeon(dungeon) {
    if (!dungeon) return false;
    if (!dungeon.salas || dungeon.salas.length === 0) return false;
    if (dungeon.salaAtual < 0 || dungeon.salaAtual >= dungeon.salas.length) return false;
    return true;
}

function isDungeonExpirada(dungeon) {
    if (!dungeon) return true;
    if (!dungeon.iniciadoEm) return true;
    return Date.now() - dungeon.iniciadoEm > TEMPO_EXPIRACAO;
}

// ============================================================
// 📂 CARREGAMENTO DE DADOS
// ============================================================

function carregarDungeons() {
    try {
        if (dungeonCache.has("dungeons")) {
            const cache = dungeonCache.get("dungeons");
            if (Date.now() - cache.timestamp < 60000) {
                return cache.data;
            }
        }

        const dataPath = path.join(__dirname, "../dados/dungeons.json");
        if (!fs.existsSync(dataPath)) {
            log("ERRO", "Arquivo dungeons.json não encontrado");
            return {};
        }

        const data = fs.readFileSync(dataPath, "utf8");
        const parsed = JSON.parse(data);
        
        dungeonCache.set("dungeons", {
            data: parsed,
            timestamp: Date.now()
        });
        
        return parsed;
    } catch (e) {
        log("ERRO", "Falha ao carregar dungeons:", e.message);
        return {};
    }
}

function carregarInimigos() {
    try {
        const dataPath = path.join(__dirname, "../dados/inimigos_dungeon.json");
        if (!fs.existsSync(dataPath)) return {};
        const data = fs.readFileSync(dataPath, "utf8");
        return JSON.parse(data);
    } catch (e) {
        log("ERRO", "Falha ao carregar inimigos:", e.message);
        return {};
    }
}

function getInimigoData(id) {
    const inimigos = carregarInimigos();
    return inimigos[id] || null;
}

// ============================================================
// 🗣️ DIÁLOGOS COM IA
// ============================================================

async function gerarDialogoNPC(npc, jogadorNome, acao, contexto) {
    if (!npc) return null;
    
    const prompt = `
Você é ${npc.nome}, um personagem da dungeon "${contexto.nome}".

CONTEXTO DA DUNGEON:
${contexto.lore || "Uma masmorra antiga."}

PERSONALIDADE DO NPC:
${npc.personalidade || "Sábio e misterioso."}

JOGADOR: ${jogadorNome}
AÇÃO DO JOGADOR: ${acao || "chegou na sua sala"}

Responda como se fosse ${npc.nome}, de forma natural e imersiva.
- Máximo de 3 frases
- Use linguagem medieval
- Responda em português
- Seja dramático e carismático
- Use a lore de Aetheris como referência
`;

    try {
        const resposta = await gerarResposta("oraculo", prompt, jogadorNome);
        return resposta || npc.fala_padrao || "...";
    } catch (err) {
        log("ERRO", "Erro ao gerar diálogo do NPC:", err.message);
        return npc.fala_padrao || "O espírito está em silêncio...";
    }
}

// ============================================================
// 🚪 GERENCIAMENTO DA DUNGEON
// ============================================================

function iniciarDungeon(userId, dungeonId) {
    try {
        // ===== VALIDAÇÕES =====
        if (!userId || !dungeonId) {
            return { sucesso: false, erro: "Dados inválidos" };
        }

        // ===== VERIFICA SE JÁ ESTÁ EM UMA DUNGEON =====
        if (dungeonsAtivas.has(userId)) {
            const atual = dungeonsAtivas.get(userId);
            if (!atual.finalizada && !isDungeonExpirada(atual)) {
                return { 
                    sucesso: false, 
                    erro: `Você já está em uma dungeon: ${atual.nome}`,
                    dungeon: atual
                };
            }
            if (isDungeonExpirada(atual)) {
                dungeonsAtivas.delete(userId);
                log("LIMPEZA", `Dungeon expirada removida para ${userId}`);
            }
        }

        // ===== CARREGA A DUNGEON =====
        const dungeons = carregarDungeons();
        const dungeonData = dungeons[dungeonId];
        
        if (!dungeonData) {
            return { sucesso: false, erro: "Dungeon não encontrada!" };
        }

        // ===== VERIFICA NÍVEL =====
        const jogador = getJogador(userId);
        const nivelMinimo = dungeonData.nivel_minimo || 1;
        
        if (jogador.nivel < nivelMinimo) {
            return { 
                sucesso: false, 
                erro: `Nível mínimo: ${nivelMinimo} (seu nível: ${jogador.nivel})` 
            };
        }

        // ===== CRIA O ESTADO DA DUNGEON =====
        const dungeon = {
            id: dungeonId,
            nome: dungeonData.nome || "Dungeon",
            subtitulo: dungeonData.subtitulo || "",
            lore: dungeonData.lore || LORES[dungeonId] || LORES.aetheris,
            nivel_minimo: nivelMinimo,
            salaAtual: 0,
            salas: dungeonData.salas.map((sala, index) => ({
                ...sala,
                id: sala.id || `sala_${index + 1}`,
                concluida: false,
                inimigosVivos: sala.inimigos ? sala.inimigos.map(ini => {
                    const dados = getInimigoData(ini.id);
                    return {
                        id: ini.id,
                        nome: dados?.nome || ini.nome || "Inimigo",
                        nivel: ini.nivel || dados?.nivel || 1,
                        vidaAtual: dados?.vida || 50,
                        vidaMax: dados?.vida || 50,
                        poder: dados?.poder || 10,
                        defesa: dados?.defesa || 5,
                        xp: dados?.xp || 20,
                        dinheiro: dados?.dinheiro || 15,
                        descricao: dados?.descricao || "",
                        dificuldade: dados?.dificuldade || "normal"
                    };
                }) : []
            })),
            recompensa: dungeonData.recompensa || { xp: 0, dinheiro: 0, itemId: null },
            recompensaEntregue: false,
            finalizada: false,
            iniciadoEm: Date.now(),
            ultimoAcesso: Date.now(),
            totalSalas: dungeonData.salas.length
        };

        // ===== VALIDA SE TEM SALAS =====
        if (dungeon.salas.length === 0) {
            return { sucesso: false, erro: "Dungeon sem salas!" };
        }

        dungeonsAtivas.set(userId, dungeon);
        log("INICIAR", `${userId} iniciou a dungeon "${dungeon.nome}"`);
        
        return { 
            sucesso: true, 
            dungeon: dungeon,
            salaAtual: dungeon.salas[0]
        };

    } catch (err) {
        log("ERRO", "Falha ao iniciar dungeon:", err.message);
        return { sucesso: false, erro: "Erro interno ao iniciar dungeon" };
    }
}

function getDungeon(userId) {
    try {
        if (!userId) return null;
        if (!dungeonsAtivas.has(userId)) return null;
        
        const dungeon = dungeonsAtivas.get(userId);
        
        // ===== VERIFICA SE EXPIR0U =====
        if (isDungeonExpirada(dungeon)) {
            dungeonsAtivas.delete(userId);
            log("EXPIRAR", `Dungeon expirada para ${userId}`);
            return null;
        }
        
        // ===== ATUALIZA ÚLTIMO ACESSO =====
        dungeon.ultimoAcesso = Date.now();
        
        return dungeon;
    } catch (err) {
        log("ERRO", "Falha ao obter dungeon:", err.message);
        return null;
    }
}

function finalizarDungeon(userId, motivo = "finalizada") {
    try {
        if (!userId) return { sucesso: false, erro: "Usuário inválido" };
        if (!dungeonsAtivas.has(userId)) {
            return { sucesso: false, erro: "Você não está em uma dungeon" };
        }
        
        const dungeon = dungeonsAtivas.get(userId);
        dungeon.finalizada = true;
        dungeon.motivoFinalizacao = motivo;
        
        dungeonsAtivas.delete(userId);
        log("FINALIZAR", `${userId} finalizou a dungeon "${dungeon.nome}" (${motivo})`);
        
        return { 
            sucesso: true, 
            dungeon: dungeon,
            motivo: motivo
        };
    } catch (err) {
        log("ERRO", "Falha ao finalizar dungeon:", err.message);
        return { sucesso: false, erro: err.message };
    }
}

function resetarDungeon(userId) {
    try {
        if (!dungeonsAtivas.has(userId)) {
            return { sucesso: false, erro: "Você não está em uma dungeon" };
        }
        dungeonsAtivas.delete(userId);
        log("RESETAR", `Dungeon resetada para ${userId}`);
        return { sucesso: true };
    } catch (err) {
        log("ERRO", "Falha ao resetar dungeon:", err.message);
        return { sucesso: false, erro: err.message };
    }
}

function emDungeon(userId) {
    if (!userId) return false;
    const dungeon = getDungeon(userId);
    return !!dungeon && !dungeon.finalizada;
}

// ============================================================
// 📌 SALAS E PROGRESSO
// ============================================================

function getSalaAtual(userId) {
    try {
        const dungeon = getDungeon(userId);
        if (!dungeon) return null;
        if (!validarDungeon(dungeon)) return null;
        return dungeon.salas[dungeon.salaAtual] || null;
    } catch (err) {
        log("ERRO", "Falha ao obter sala atual:", err.message);
        return null;
    }
}

function getPuzzleAtual(userId) {
    const sala = getSalaAtual(userId);
    if (!sala) return null;
    return sala.puzzle || null;
}

function getInimigosVivos(userId) {
    try {
        const sala = getSalaAtual(userId);
        if (!sala) return [];
        return sala.inimigosVivos || [];
    } catch (err) {
        log("ERRO", "Falha ao obter inimigos vivos:", err.message);
        return [];
    }
}

function getInimigoPorId(userId, inimigoId) {
    const inimigos = getInimigosVivos(userId);
    return inimigos.find(i => i.id === inimigoId) || null;
}

function removerInimigo(userId, index) {
    try {
        const sala = getSalaAtual(userId);
        if (!sala) {
            return { sucesso: false, erro: "Sala não encontrada" };
        }
        
        if (index < 0 || index >= sala.inimigosVivos.length) {
            return { sucesso: false, erro: "Inimigo não encontrado" };
        }
        
        const inimigo = sala.inimigosVivos.splice(index, 1)[0];
        log("REMOVER", `Inimigo "${inimigo.nome}" removido da sala`);
        
        return { 
            sucesso: true, 
            inimigo: inimigo,
            restantes: sala.inimigosVivos.length 
        };
    } catch (err) {
        log("ERRO", "Falha ao remover inimigo:", err.message);
        return { sucesso: false, erro: err.message };
    }
}

// ============================================================
// 🔄 PROGRESSO DA DUNGEON
// ============================================================

function concluirSala(userId) {
    try {
        const sala = getSalaAtual(userId);
        if (!sala) {
            return { sucesso: false, erro: "Sala não encontrada" };
        }
        
        if (sala.inimigosVivos && sala.inimigosVivos.length > 0) {
            return { 
                sucesso: false, 
                erro: `Ainda há ${sala.inimigosVivos.length} inimigo(s) vivo(s)`,
                inimigosRestantes: sala.inimigosVivos.length
            };
        }
        
        // ===== SE JÁ FOI CONCLUÍDA, NÃO FAZ NADA =====
        if (sala.concluida) {
            return { sucesso: true, jaConcluida: true };
        }
        
        sala.concluida = true;
        log("CONCLUIR", `Sala "${sala.nome}" concluída`);
        
        return { sucesso: true };
    } catch (err) {
        log("ERRO", "Falha ao concluir sala:", err.message);
        return { sucesso: false, erro: err.message };
    }
}

function avancarSala(userId) {
    try {
        const dungeon = getDungeon(userId);
        if (!dungeon) {
            return { sucesso: false, erro: "Dungeon não encontrada" };
        }
        
        if (dungeon.finalizada) {
            return { sucesso: false, erro: "Dungeon já finalizada" };
        }
        
        // ===== VERIFICA SE A SALA ATUAL FOI CONCLUÍDA =====
        const salaAtual = getSalaAtual(userId);
        if (salaAtual && !salaAtual.concluida) {
            return { 
                sucesso: false, 
                erro: "Conclua a sala atual antes de avançar",
                salaAtual: salaAtual
            };
        }
        
        // ===== AVANÇA =====
        dungeon.salaAtual++;
        
        if (dungeon.salaAtual >= dungeon.salas.length) {
            dungeon.finalizada = true;
            log("CONCLUIR_DUNGEON", `${userId} completou todas as salas da dungeon "${dungeon.nome}"`);
            return { sucesso: true, finalizada: true };
        }
        
        const novaSala = getSalaAtual(userId);
        log("AVANCAR", `${userId} avançou para sala ${dungeon.salaAtual + 1}: "${novaSala?.nome}"`);
        
        return { 
            sucesso: true, 
            finalizada: false,
            sala: novaSala,
            salaIndex: dungeon.salaAtual
        };
    } catch (err) {
        log("ERRO", "Falha ao avançar sala:", err.message);
        return { sucesso: false, erro: err.message };
    }
}

function getProgresso(userId) {
    try {
        const dungeon = getDungeon(userId);
        if (!dungeon) return null;
        
        return {
            totalSalas: dungeon.totalSalas || dungeon.salas.length,
            salaAtual: dungeon.salaAtual + 1,
            progresso: Math.round(((dungeon.salaAtual) / (dungeon.totalSalas || dungeon.salas.length)) * 100),
            finalizada: dungeon.finalizada
        };
    } catch (err) {
        log("ERRO", "Falha ao obter progresso:", err.message);
        return null;
    }
}

// ============================================================
// 🏆 RECOMPENSAS
// ============================================================
// ===== ENTREGAR RECOMPENSA =====
function entregarRecompensa(userId) {
    try {
        const dungeon = getDungeon(userId);
        if (!dungeon || !dungeon.finalizada) {
            return { sucesso: false, erro: "Dungeon não finalizada", xp: 0, dinheiro: 0, itemNome: null };
        }

        if (dungeon.recompensaEntregue) {
            return { sucesso: false, erro: "Recompensa já entregue", xp: 0, dinheiro: 0, itemNome: null };
        }

        const jogador = getJogador(userId);
        const dados = lerJogadores();

        const xp = dungeon.recompensa?.xp || 0;
        const dinheiro = dungeon.recompensa?.dinheiro || 0;
        const itemId = dungeon.recompensa?.itemId || null;
        let itemNome = null;

        // ===== XP =====
        if (xp > 0) {
            adicionarXP(userId, jogador.nome, xp);
            console.log(`📊 XP adicionado: ${xp}`);
        }

        // ===== DINHEIRO =====
        if (dinheiro > 0) {
            atualizarSaldo(userId, dinheiro, 'saldo');
            console.log(`💰 Dinheiro adicionado: ${dinheiro}`);
        }

        // ============================================================
        // 🗡️ ITEM - ADICIONA AO INVENTÁRIO
        // ============================================================
        if (itemId) {
            try {
                // ===== BUSCA O ITEM NO ARQUIVO =====
                const ITENS = require("../dados/itens");
                const itemData = ITENS[itemId];
                itemNome = itemData?.nome || itemId;

                // ===== ADICIONA AO INVENTÁRIO =====
                if (!jogador.inventario) {
                    jogador.inventario = {};
                }
                
                jogador.inventario[itemId] = (jogador.inventario[itemId] || 0) + 1;
                
                // ===== SALVA O JOGADOR =====
                dados[userId] = jogador;
                escreverJogadores(dados);
                
                console.log(`🗡️ Item adicionado: ${itemNome} (${itemId})`);
                console.log(`📦 Inventário:`, jogador.inventario);

            } catch (err) {
                console.log(`❌ Erro ao adicionar item:`, err.message);
                itemNome = itemId;
            }
        }

        dungeon.recompensaEntregue = true;
        console.log(`🎁 RECOMPENSA ENTREGUE: XP=${xp}, Dinheiro=${dinheiro}, Item=${itemNome}`);

        return {
            sucesso: true,
            xp: xp,
            dinheiro: dinheiro,
            itemId: itemId,
            itemNome: itemNome
        };

    } catch (err) {
        console.log("❌ Erro ao entregar recompensa:", err.message);
        return { sucesso: false, erro: err.message, xp: 0, dinheiro: 0, itemNome: null };
    }
}


// ============================================================
// 📖 LORE
// ============================================================

function getLoreDungeon(dungeonId) {
    return LORES[dungeonId] || LORES.aetheris;
}

// ============================================================
// 🧹 LIMPEZA AUTOMÁTICA
// ============================================================

function limparDungeonsExpiradas() {
    const agora = Date.now();
    let removidas = 0;
    
    for (const [userId, dungeon] of dungeonsAtivas.entries()) {
        if (isDungeonExpirada(dungeon)) {
            dungeonsAtivas.delete(userId);
            removidas++;
            log("LIMPEZA", `Dungeon expirada removida para ${userId}: "${dungeon.nome}"`);
        }
    }
    
    if (removidas > 0) {
        log("LIMPEZA", `Total de ${removidas} dungeon(s) expiradas removidas`);
    }
}

// ===== LIMPEZA AUTOMÁTICA A CADA 5 MINUTOS =====
setInterval(limparDungeonsExpiradas, TEMPO_LIMPEZA);

// ============================================================
// 📊 EXPORTAÇÕES
// ============================================================
module.exports = {
    // Estado
    dungeonsAtivas,
    
    // Gerenciamento
    iniciarDungeon,
    getDungeon,
    finalizarDungeon,
    resetarDungeon,
    emDungeon,
    
    // Salas
    getSalaAtual,
    getPuzzleAtual,
    getInimigosVivos,
    getInimigoPorId,
    removerInimigo,
    concluirSala,
    avancarSala,
    getProgresso,
    
    // Recompensa
    entregarRecompensa,
    
    // Lore
    getLoreDungeon,
    LORES,
    
    // Diálogo
    gerarDialogoNPC,
    
    // Utilitários
    validarDungeon,
    isDungeonExpirada,
    limparDungeonsExpiradas,
    carregarDungeons
};
