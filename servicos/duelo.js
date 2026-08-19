// ============================================================
// SISTEMA DE DUELO ENTRE JOGADORES - COMPLETO
// ============================================================
const { getJogador, adicionarXP, atualizarSaldo, atualizarAtributos } = require("./jogador");
const { lerJogadores, escreverJogadores } = require("./banco");
const ITENS = require("../dados/itens");

// ========== DUELOS ATIVOS ==========
const duelosAtivos = {};

// ========== FUNÇÃO PARA PEGAR ALVO ==========
function pegarAlvo(msg, remetenteId) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedSender = msg.message?.extendedTextMessage?.contextInfo?.participant;
    
    if (quoted && quotedSender && quotedSender !== remetenteId) {
        return quotedSender;
    }

    const mencionado = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (mencionado && mencionado !== remetenteId) {
        return mencionado;
    }

    return null;
}

// ========== FUNÇÃO PARA PEGAR ATRIBUTOS DO ITEM ==========
function getAtributosItem(itemId) {
    if (!itemId || !ITENS[itemId]) return { ataque: 0, defesa: 0, critico: 0, esquiva: 0 };
    const item = ITENS[itemId];
    return {
        ataque: item.ataque || 0,
        defesa: item.defesa || 0,
        critico: item.critico || 0,
        esquiva: item.esquiva || 0
    };
}

// ========== FUNÇÃO PARA CALCULAR ATRIBUTOS TOTAIS ==========
function calcularAtributosTotais(jogador) {
    let poder = jogador.poder || 10;
    let defesa = jogador.defesa || 5;
    let critico = jogador.critico || 5;
    let esquiva = jogador.esquiva || 3;
    let vidaMax = jogador.vidaMax || 100;
    let manaMax = jogador.manaMax || 100;

    const equipamentos = [jogador.arma, jogador.armadura, jogador.acessorio];
    
    for (const itemId of equipamentos) {
        if (!itemId) continue;
        const atributos = getAtributosItem(itemId);
        poder += atributos.ataque || 0;
        defesa += atributos.defesa || 0;
        critico += atributos.critico || 0;
        esquiva += atributos.esquiva || 0;
    }

    return { poder, defesa, critico, esquiva, vidaMax, manaMax };
}

// ========== INICIAR DUELO ==========
function iniciarDuelo(desafianteId, desafiadoId, remoteJid) {
    if (duelosAtivos[desafianteId] || duelosAtivos[desafiadoId]) {
        return { sucesso: false, erro: "Um dos jogadores já está em duelo!" };
    }

    const desafiante = getJogador(desafianteId);
    const desafiado = getJogador(desafiadoId);

    if (!desafiante || !desafiado) {
        return { sucesso: false, erro: "Jogador não encontrado!" };
    }

    atualizarAtributos(desafiante);
    atualizarAtributos(desafiado);

    const atributosDesafiante = calcularAtributosTotais(desafiante);
    const atributosDesafiado = calcularAtributosTotais(desafiado);

    duelosAtivos[desafianteId] = {
        desafianteId: desafianteId,
        desafiadoId: desafiadoId,
        remoteJid: remoteJid,
        status: "aguardando",
        turno: desafianteId,

        nomeDesafiante: desafiante.nome || "Desafiante",
        nomeDesafiado: desafiado.nome || "Desafiado",

        classeDesafiante: desafiante.classe || "Sem Classe",
        classeDesafiado: desafiado.classe || "Sem Classe",

        vidaDesafiante: atributosDesafiante.vidaMax,
        vidaMaxDesafiante: atributosDesafiante.vidaMax,
        manaDesafiante: atributosDesafiante.manaMax,
        manaMaxDesafiante: atributosDesafiante.manaMax,
        vidaDesafiado: atributosDesafiado.vidaMax,
        vidaMaxDesafiado: atributosDesafiado.vidaMax,
        manaDesafiado: atributosDesafiado.manaMax,
        manaMaxDesafiado: atributosDesafiado.manaMax,

        poderDesafiante: atributosDesafiante.poder,
        defesaDesafiante: atributosDesafiante.defesa,
        criticoDesafiante: atributosDesafiante.critico,
        esquivaDesafiante: atributosDesafiante.esquiva,
        poderDesafiado: atributosDesafiado.poder,
        defesaDesafiado: atributosDesafiado.defesa,
        criticoDesafiado: atributosDesafiado.critico,
        esquivaDesafiado: atributosDesafiado.esquiva,

        armaDesafiante: desafiante.arma || null,
        armaduraDesafiante: desafiante.armadura || null,
        acessorioDesafiante: desafiante.acessorio || null,
        armaDesafiado: desafiado.arma || null,
        armaduraDesafiado: desafiado.armadura || null,
        acessorioDesafiado: desafiado.acessorio || null
    };

    return { sucesso: true };
}

// ========== ACEITAR DUELO ==========
function aceitarDuelo(userId) {
    let duelo = null;
    let desafianteId = null;

    for (const [id, d] of Object.entries(duelosAtivos)) {
        if (d.desafiadoId === userId && d.status === "aguardando") {
            duelo = d;
            desafianteId = id;
            break;
        }
    }

    if (!duelo) {
        return { sucesso: false, erro: "Você não tem desafios pendentes!" };
    }

    duelo.status = "em_andamento";
    duelo.turno = duelo.desafianteId;

    return { sucesso: true, desafianteId: desafianteId, duelo: duelo };
}

// ========== RECUSAR DUELO ==========
function recusarDuelo(userId) {
    for (const [id, duelo] of Object.entries(duelosAtivos)) {
        if (duelo.desafiadoId === userId && duelo.status === "aguardando") {
            delete duelosAtivos[id];
            return { sucesso: true, desafianteId: id };
        }
    }
    return { sucesso: false, erro: "Você não tem desafios pendentes!" };
}

// ========== CALCULAR RECOMPENSAS ==========
function calcularRecompensas(vencedor, perdedor) {
    const dados = lerJogadores();
    
    const nivelVencedor = dados[vencedor]?.nivel || 1;
    const nivelPerdedor = dados[perdedor]?.nivel || 1;
    
    // Quanto maior o nível do perdedor, maior a recompensa
    const diferencaNivel = Math.max(0, nivelPerdedor - nivelVencedor);
    const multiplicador = 1 + (diferencaNivel * 0.15);
    const multiplicadorMax = Math.min(multiplicador, 8);
    
    // XP GANHO
    const xpBase = 50 + Math.floor(Math.random() * 80);
    const xpGanho = Math.floor(xpBase * multiplicadorMax);
    
    // DINHEIRO GANHO
    const dinheiroBase = 200 + Math.floor(Math.random() * 300);
    const dinheiroGanho = Math.floor(dinheiroBase * multiplicadorMax);
    
    // XP PERDIDO
    const xpPerdido = Math.max(20, Math.floor((dados[perdedor]?.xp || 100) * 0.08));
    
    // DINHEIRO PERDIDO
    const dinheiroPerdido = Math.max(50, Math.floor((dados[perdedor]?.saldo || 100) * 0.05));
    
    return {
        vencedor: { xp: xpGanho, dinheiro: dinheiroGanho },
        perdedor: { xp: xpPerdido, dinheiro: dinheiroPerdido },
        multiplicador: multiplicadorMax.toFixed(1)
    };
}

// ========== ATACAR NO DUELO ==========
function atacarDuelo(userId) {
    let duelo = null;
    let chave = null;

    for (const [id, d] of Object.entries(duelosAtivos)) {
        if (d.desafianteId === userId || d.desafiadoId === userId) {
            duelo = d;
            chave = id;
            break;
        }
    }

    if (!duelo) {
        return { sucesso: false, erro: "Você não está em um duelo!" };
    }

    if (duelo.status !== "em_andamento") {
        return { sucesso: false, erro: "O duelo não está em andamento!" };
    }

    if (duelo.turno !== userId) {
        return { sucesso: false, erro: "Aguarde seu turno!" };
    }

    const ehDesafiante = userId === duelo.desafianteId;
    const atacante = ehDesafiante ? duelo.desafianteId : duelo.desafiadoId;
    const defensor = ehDesafiante ? duelo.desafiadoId : duelo.desafianteId;
    
    const poderAtacante = ehDesafiante ? duelo.poderDesafiante : duelo.poderDesafiado;
    const criticoAtacante = ehDesafiante ? duelo.criticoDesafiante : duelo.criticoDesafiado;
    const defesaDefensor = ehDesafiante ? duelo.defesaDesafiado : duelo.defesaDesafiante;
    const esquivaDefensor = ehDesafiante ? duelo.esquivaDesafiado : duelo.esquivaDesafiante;
    const nomeAtacante = ehDesafiante ? duelo.nomeDesafiante : duelo.nomeDesafiado;
    const nomeDefensor = ehDesafiante ? duelo.nomeDesafiado : duelo.nomeDesafiante;

    let dano = poderAtacante + Math.floor(Math.random() * 8) - defesaDefensor;
    if (dano < 1) dano = 1;

    let critico = false;
    if (Math.random() * 100 < criticoAtacante) {
        dano *= 2;
        critico = true;
    }

    let esquivou = false;
    if (Math.random() * 100 < esquivaDefensor) {
        dano = 0;
        esquivou = true;
    }

    if (ehDesafiante) {
        duelo.vidaDesafiado -= dano;
        if (duelo.vidaDesafiado < 0) duelo.vidaDesafiado = 0;
    } else {
        duelo.vidaDesafiante -= dano;
        if (duelo.vidaDesafiante < 0) duelo.vidaDesafiante = 0;
    }

    let vencedor = null;
    let perdedor = null;

    if (duelo.vidaDesafiado <= 0) {
        vencedor = duelo.desafianteId;
        perdedor = duelo.desafiadoId;
        duelo.status = "finalizado";
    } else if (duelo.vidaDesafiante <= 0) {
        vencedor = duelo.desafiadoId;
        perdedor = duelo.desafianteId;
        duelo.status = "finalizado";
    }

    if (!vencedor) {
        duelo.turno = ehDesafiante ? duelo.desafiadoId : duelo.desafianteId;
    }

    const resultado = {
        sucesso: true,
        dano: dano,
        critico: critico,
        esquivou: esquivou,
        vencedor: vencedor,
        perdedor: perdedor,
        nomeAtacante: nomeAtacante,
        nomeDefensor: nomeDefensor,
        vidaAtacante: ehDesafiante ? duelo.vidaDesafiante : duelo.vidaDesafiado,
        vidaDefensor: ehDesafiante ? duelo.vidaDesafiado : duelo.vidaDesafiante,
        vidaMaxAtacante: ehDesafiante ? duelo.vidaMaxDesafiante : duelo.vidaMaxDesafiado,
        vidaMaxDefensor: ehDesafiante ? duelo.vidaMaxDesafiado : duelo.vidaMaxDesafiante,
        duelo: duelo,
        chave: chave
    };

    if (vencedor) {
        const recompensa = calcularRecompensas(vencedor, perdedor);
        
        adicionarXP(vencedor, "", recompensa.vencedor.xp);
        atualizarSaldo(vencedor, recompensa.vencedor.dinheiro, 'saldo');
        
        const dados = lerJogadores();
        if (dados[perdedor]) {
            dados[perdedor].xp = Math.max(0, (dados[perdedor].xp || 0) - recompensa.perdedor.xp);
            dados[perdedor].saldo = Math.max(0, (dados[perdedor].saldo || 0) - recompensa.perdedor.dinheiro);
            escreverJogadores(dados);
        }

        resultado.recompensa = recompensa;

        setTimeout(() => {
            delete duelosAtivos[chave];
        }, 10000);
    }

    return resultado;
}

// ========== GOLPE NO DUELO ==========
function golpeDuelo(userId) {
    let duelo = null;
    let chave = null;

    for (const [id, d] of Object.entries(duelosAtivos)) {
        if (d.desafianteId === userId || d.desafiadoId === userId) {
            duelo = d;
            chave = id;
            break;
        }
    }

    if (!duelo) {
        return { sucesso: false, erro: "Você não está em um duelo!" };
    }

    if (duelo.status !== "em_andamento") {
        return { sucesso: false, erro: "O duelo não está em andamento!" };
    }

    if (duelo.turno !== userId) {
        return { sucesso: false, erro: "Aguarde seu turno!" };
    }

    const ehDesafiante = userId === duelo.desafianteId;
    const atacante = ehDesafiante ? duelo.desafianteId : duelo.desafiadoId;
    const defensor = ehDesafiante ? duelo.desafiadoId : duelo.desafianteId;
    
    const poderAtacante = ehDesafiante ? duelo.poderDesafiante : duelo.poderDesafiado;
    const criticoAtacante = ehDesafiante ? duelo.criticoDesafiante : duelo.criticoDesafiado;
    const defesaDefensor = ehDesafiante ? duelo.defesaDesafiado : duelo.defesaDesafiante;
    const esquivaDefensor = ehDesafiante ? duelo.esquivaDesafiado : duelo.esquivaDesafiante;
    const nomeAtacante = ehDesafiante ? duelo.nomeDesafiante : duelo.nomeDesafiado;
    const nomeDefensor = ehDesafiante ? duelo.nomeDesafiado : duelo.nomeDesafiante;

    let dano = (poderAtacante * 2) + Math.floor(Math.random() * 10) - defesaDefensor;
    if (dano < 1) dano = 1;

    let critico = false;
    if (Math.random() * 100 < criticoAtacante + 10) {
        dano *= 2;
        critico = true;
    }

    let esquivou = false;
    if (Math.random() * 100 < esquivaDefensor) {
        dano = 0;
        esquivou = true;
    }

    if (ehDesafiante) {
        duelo.vidaDesafiado -= dano;
        if (duelo.vidaDesafiado < 0) duelo.vidaDesafiado = 0;
    } else {
        duelo.vidaDesafiante -= dano;
        if (duelo.vidaDesafiante < 0) duelo.vidaDesafiante = 0;
    }

    let vencedor = null;
    let perdedor = null;

    if (duelo.vidaDesafiado <= 0) {
        vencedor = duelo.desafianteId;
        perdedor = duelo.desafiadoId;
        duelo.status = "finalizado";
    } else if (duelo.vidaDesafiante <= 0) {
        vencedor = duelo.desafiadoId;
        perdedor = duelo.desafianteId;
        duelo.status = "finalizado";
    }

    if (!vencedor) {
        duelo.turno = ehDesafiante ? duelo.desafiadoId : duelo.desafianteId;
    }

    const resultado = {
        sucesso: true,
        dano: dano,
        critico: critico,
        esquivou: esquivou,
        vencedor: vencedor,
        perdedor: perdedor,
        nomeAtacante: nomeAtacante,
        nomeDefensor: nomeDefensor,
        vidaAtacante: ehDesafiante ? duelo.vidaDesafiante : duelo.vidaDesafiado,
        vidaDefensor: ehDesafiante ? duelo.vidaDesafiado : duelo.vidaDesafiante,
        vidaMaxAtacante: ehDesafiante ? duelo.vidaMaxDesafiante : duelo.vidaMaxDesafiado,
        vidaMaxDefensor: ehDesafiante ? duelo.vidaMaxDesafiado : duelo.vidaMaxDesafiante,
        duelo: duelo,
        chave: chave,
        tipo: "golpe"
    };

    if (vencedor) {
        const recompensa = calcularRecompensas(vencedor, perdedor);
        
        adicionarXP(vencedor, "", recompensa.vencedor.xp);
        atualizarSaldo(vencedor, recompensa.vencedor.dinheiro, 'saldo');
        
        const dados = lerJogadores();
        if (dados[perdedor]) {
            dados[perdedor].xp = Math.max(0, (dados[perdedor].xp || 0) - recompensa.perdedor.xp);
            dados[perdedor].saldo = Math.max(0, (dados[perdedor].saldo || 0) - recompensa.perdedor.dinheiro);
            escreverJogadores(dados);
        }

        resultado.recompensa = recompensa;

        setTimeout(() => {
            delete duelosAtivos[chave];
        }, 10000);
    }

    return resultado;
}

// ========== COMBO NO DUELO ==========
function comboDuelo(userId) {
    let duelo = null;
    let chave = null;

    for (const [id, d] of Object.entries(duelosAtivos)) {
        if (d.desafianteId === userId || d.desafiadoId === userId) {
            duelo = d;
            chave = id;
            break;
        }
    }

    if (!duelo) {
        return { sucesso: false, erro: "Você não está em um duelo!" };
    }

    if (duelo.status !== "em_andamento") {
        return { sucesso: false, erro: "O duelo não está em andamento!" };
    }

    if (duelo.turno !== userId) {
        return { sucesso: false, erro: "Aguarde seu turno!" };
    }

    const ehDesafiante = userId === duelo.desafianteId;
    const atacante = ehDesafiante ? duelo.desafianteId : duelo.desafiadoId;
    const defensor = ehDesafiante ? duelo.desafiadoId : duelo.desafianteId;
    
    const poderAtacante = ehDesafiante ? duelo.poderDesafiante : duelo.poderDesafiado;
    const criticoAtacante = ehDesafiante ? duelo.criticoDesafiante : duelo.criticoDesafiado;
    const defesaDefensor = ehDesafiante ? duelo.defesaDesafiado : duelo.defesaDesafiante;
    const esquivaDefensor = ehDesafiante ? duelo.esquivaDesafiado : duelo.esquivaDesafiante;
    const nomeAtacante = ehDesafiante ? duelo.nomeDesafiante : duelo.nomeDesafiado;
    const nomeDefensor = ehDesafiante ? duelo.nomeDesafiado : duelo.nomeDesafiante;

    let danoTotal = 0;
    let logs = [];
    let criticoCount = 0;

    for (let i = 0; i < 3; i++) {
        let dano = poderAtacante + Math.floor(Math.random() * 8) - defesaDefensor;
        if (dano < 1) dano = 1;

        let critico = false;
        if (Math.random() * 100 < criticoAtacante) {
            dano *= 2;
            critico = true;
            criticoCount++;
        }

        danoTotal += dano;
        logs.push(`⚔️ Golpe ${i + 1}: ${critico ? "💥 CRÍTICO " : ""}${dano}`);
    }

    if (ehDesafiante) {
        duelo.vidaDesafiado -= danoTotal;
        if (duelo.vidaDesafiado < 0) duelo.vidaDesafiado = 0;
    } else {
        duelo.vidaDesafiante -= danoTotal;
        if (duelo.vidaDesafiante < 0) duelo.vidaDesafiante = 0;
    }

    let vencedor = null;
    let perdedor = null;

    if (duelo.vidaDesafiado <= 0) {
        vencedor = duelo.desafianteId;
        perdedor = duelo.desafiadoId;
        duelo.status = "finalizado";
    } else if (duelo.vidaDesafiante <= 0) {
        vencedor = duelo.desafiadoId;
        perdedor = duelo.desafianteId;
        duelo.status = "finalizado";
    }

    if (!vencedor) {
        duelo.turno = ehDesafiante ? duelo.desafiadoId : duelo.desafianteId;
    }

    const resultado = {
        sucesso: true,
        danoTotal: danoTotal,
        logs: logs,
        criticoCount: criticoCount,
        vencedor: vencedor,
        perdedor: perdedor,
        nomeAtacante: nomeAtacante,
        nomeDefensor: nomeDefensor,
        vidaAtacante: ehDesafiante ? duelo.vidaDesafiante : duelo.vidaDesafiado,
        vidaDefensor: ehDesafiante ? duelo.vidaDesafiado : duelo.vidaDesafiante,
        vidaMaxAtacante: ehDesafiante ? duelo.vidaMaxDesafiante : duelo.vidaMaxDesafiado,
        vidaMaxDefensor: ehDesafiante ? duelo.vidaMaxDesafiado : duelo.vidaMaxDesafiante,
        duelo: duelo,
        chave: chave,
        tipo: "combo"
    };

    if (vencedor) {
        const recompensa = calcularRecompensas(vencedor, perdedor);
        
        adicionarXP(vencedor, "", recompensa.vencedor.xp);
        atualizarSaldo(vencedor, recompensa.vencedor.dinheiro, 'saldo');
        
        const dados = lerJogadores();
        if (dados[perdedor]) {
            dados[perdedor].xp = Math.max(0, (dados[perdedor].xp || 0) - recompensa.perdedor.xp);
            dados[perdedor].saldo = Math.max(0, (dados[perdedor].saldo || 0) - recompensa.perdedor.dinheiro);
            escreverJogadores(dados);
        }

        resultado.recompensa = recompensa;

        setTimeout(() => {
            delete duelosAtivos[chave];
        }, 10000);
    }

    return resultado;
}

// ========== USAR SKILL NO DUELO ==========
function skillDuelo(userId, skillId) {
    let duelo = null;
    let chave = null;

    for (const [id, d] of Object.entries(duelosAtivos)) {
        if (d.desafianteId === userId || d.desafiadoId === userId) {
            duelo = d;
            chave = id;
            break;
        }
    }

    if (!duelo) {
        return { sucesso: false, erro: "Você não está em um duelo!" };
    }

    if (duelo.status !== "em_andamento") {
        return { sucesso: false, erro: "O duelo não está em andamento!" };
    }

    if (duelo.turno !== userId) {
        return { sucesso: false, erro: "Aguarde seu turno!" };
    }

    const { CLASSES } = require("./jogador");
    const jogador = getJogador(userId);
    
    if (!jogador.classe || jogador.classe === "Sem Classe") {
        return { sucesso: false, erro: "Você precisa de uma classe para usar skills!" };
    }

    const classeNome = jogador.classe.toLowerCase();
    const classe = CLASSES[classeNome];
    if (!classe) {
        return { sucesso: false, erro: "Classe não encontrada!" };
    }

    const skill = classe.skills.find(s => s.id === skillId);
    if (!skill) {
        return { sucesso: false, erro: "Skill não encontrada!" };
    }

    if (jogador.nivel < skill.nivel) {
        return { sucesso: false, erro: `Nível necessário: ${skill.nivel}` };
    }

    const agora = Date.now();
    if (!jogador.cooldowns) jogador.cooldowns = {};
    if (jogador.cooldowns[skill.id] && jogador.cooldowns[skill.id] > agora) {
        const restante = Math.ceil((jogador.cooldowns[skill.id] - agora) / 1000);
        return { sucesso: false, erro: `Skill em cooldown! ${restante}s` };
    }

    const ehDesafiante = userId === duelo.desafianteId;
    const manaAtual = ehDesafiante ? duelo.manaDesafiante : duelo.manaDesafiado;
    if (manaAtual < skill.custo_mana) {
        return { sucesso: false, erro: `Mana insuficiente! ${skill.custo_mana} necessário` };
    }

    const atacante = ehDesafiante ? duelo.desafianteId : duelo.desafiadoId;
    const defensor = ehDesafiante ? duelo.desafiadoId : duelo.desafianteId;
    
    const poderAtacante = ehDesafiante ? duelo.poderDesafiante : duelo.poderDesafiado;
    const criticoAtacante = ehDesafiante ? duelo.criticoDesafiante : duelo.criticoDesafiado;
    const defesaDefensor = ehDesafiante ? duelo.defesaDesafiado : duelo.defesaDesafiante;
    const esquivaDefensor = ehDesafiante ? duelo.esquivaDesafiado : duelo.esquivaDesafiante;
    const nomeAtacante = ehDesafiante ? duelo.nomeDesafiante : duelo.nomeDesafiado;
    const nomeDefensor = ehDesafiante ? duelo.nomeDesafiado : duelo.nomeDesafiante;

    if (ehDesafiante) {
        duelo.manaDesafiante -= skill.custo_mana;
    } else {
        duelo.manaDesafiado -= skill.custo_mana;
    }

    jogador.cooldowns[skill.id] = agora + (skill.cooldown * 1000);

    let dano = skill.dano + Math.floor(poderAtacante / 2) - defesaDefensor;
    if (dano < 1) dano = 1;

    let critico = false;
    if (Math.random() * 100 < criticoAtacante) {
        dano *= 2;
        critico = true;
    }

    let esquivou = false;
    if (Math.random() * 100 < esquivaDefensor) {
        dano = 0;
        esquivou = true;
    }

    if (ehDesafiante) {
        duelo.vidaDesafiado -= dano;
        if (duelo.vidaDesafiado < 0) duelo.vidaDesafiado = 0;
    } else {
        duelo.vidaDesafiante -= dano;
        if (duelo.vidaDesafiante < 0) duelo.vidaDesafiante = 0;
    }

    let vencedor = null;
    let perdedor = null;

    if (duelo.vidaDesafiado <= 0) {
        vencedor = duelo.desafianteId;
        perdedor = duelo.desafiadoId;
        duelo.status = "finalizado";
    } else if (duelo.vidaDesafiante <= 0) {
        vencedor = duelo.desafiadoId;
        perdedor = duelo.desafianteId;
        duelo.status = "finalizado";
    }

    if (!vencedor) {
        duelo.turno = ehDesafiante ? duelo.desafiadoId : duelo.desafianteId;
    }

    const resultado = {
        sucesso: true,
        dano: dano,
        critico: critico,
        esquivou: esquivou,
        vencedor: vencedor,
        perdedor: perdedor,
        nomeAtacante: nomeAtacante,
        nomeDefensor: nomeDefensor,
        nomeSkill: skill.nome,
        manaRestante: ehDesafiante ? duelo.manaDesafiante : duelo.manaDesafiado,
        vidaAtacante: ehDesafiante ? duelo.vidaDesafiante : duelo.vidaDesafiado,
        vidaDefensor: ehDesafiante ? duelo.vidaDesafiado : duelo.vidaDesafiante,
        vidaMaxAtacante: ehDesafiante ? duelo.vidaMaxDesafiante : duelo.vidaMaxDesafiado,
        vidaMaxDefensor: ehDesafiante ? duelo.vidaMaxDesafiado : duelo.vidaMaxDesafiante,
        duelo: duelo,
        chave: chave,
        tipo: "skill"
    };

    if (vencedor) {
        const recompensa = calcularRecompensas(vencedor, perdedor);
        
        adicionarXP(vencedor, "", recompensa.vencedor.xp);
        atualizarSaldo(vencedor, recompensa.vencedor.dinheiro, 'saldo');
        
        const dados = lerJogadores();
        if (dados[perdedor]) {
            dados[perdedor].xp = Math.max(0, (dados[perdedor].xp || 0) - recompensa.perdedor.xp);
            dados[perdedor].saldo = Math.max(0, (dados[perdedor].saldo || 0) - recompensa.perdedor.dinheiro);
            escreverJogadores(dados);
        }

        resultado.recompensa = recompensa;

        setTimeout(() => {
            delete duelosAtivos[chave];
        }, 10000);
    }

    return resultado;
}

// ========== FUGIR DO DUELO ==========
function fugirDuelo(userId) {
    for (const [chave, duelo] of Object.entries(duelosAtivos)) {
        if (duelo.desafianteId === userId || duelo.desafiadoId === userId) {
            if (duelo.status !== "em_andamento") {
                return { sucesso: false, erro: "O duelo não está em andamento!" };
            }

            const fugitivo = userId;
            const oponente = duelo.desafianteId === userId ? duelo.desafiadoId : duelo.desafianteId;

            const dados = lerJogadores();
            
            // Penalidade por fugir (baseada no nível)
            const nivelFugitivo = dados[fugitivo]?.nivel || 1;
            const xpPerdido = Math.max(20, 15 + Math.floor(nivelFugitivo * 1.5));
            const dinheiroPerdido = Math.max(50, 30 + Math.floor(nivelFugitivo * 2));

            if (dados[fugitivo]) {
                dados[fugitivo].xp = Math.max(0, (dados[fugitivo].xp || 0) - xpPerdido);
                dados[fugitivo].saldo = Math.max(0, (dados[fugitivo].saldo || 0) - dinheiroPerdido);
                escreverJogadores(dados);
            }

            delete duelosAtivos[chave];

            return {
                sucesso: true,
                fugitivo: fugitivo,
                oponente: oponente,
                penalidade: { xp: xpPerdido, dinheiro: dinheiroPerdido }
            };
        }
    }
    return { sucesso: false, erro: "Você não está em um duelo!" };
}

// ========== VERIFICAR SE ESTÁ EM DUELO ==========
function emDuelo(userId) {
    for (const [chave, duelo] of Object.entries(duelosAtivos)) {
        if (duelo.desafianteId === userId || duelo.desafiadoId === userId) {
            return { emDuelo: true, duelo: duelo, chave: chave };
        }
    }
    return { emDuelo: false };
}

// ========== OBTER DUELO ==========
function getDuelo(userId) {
    for (const [chave, duelo] of Object.entries(duelosAtivos)) {
        if (duelo.desafianteId === userId || duelo.desafiadoId === userId) {
            return { duelo: duelo, chave: chave };
        }
    }
    return null;
}

// ========== FUNÇÃO PRA MOSTRAR EQUIPAMENTO ==========
function mostrarEquip(itemId) {
    if (!itemId) return "❌ Vazio";
    const item = ITENS[itemId];
    if (!item) return `📦 ${itemId}`;
    return item.nome || `📦 ${itemId}`;
}

// ========== EXPORTAÇÕES ==========
module.exports = {
    duelosAtivos,
    pegarAlvo,
    iniciarDuelo,
    aceitarDuelo,
    recusarDuelo,
    atacarDuelo,
    golpeDuelo,
    comboDuelo,
    skillDuelo,
    fugirDuelo,
    emDuelo,
    getDuelo,
    mostrarEquip
};
