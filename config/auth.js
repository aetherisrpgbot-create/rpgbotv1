// ============================================================
// SISTEMA DE AUTORIZAÇÃO - ROBUSTO E LIMPO
// ============================================================

// ===== CONFIGURAÇÕES =====
const CONFIG = {
    // 🔥 GRUPOS AUTORIZADOS
    gruposAutorizados: [
        "120363427739738043@g.us",      // Grupo Teste
        "120363351564577845@g.us",      // Grupo Principal
        "120363427627809950@g.us",      // Grupo do Cliente
        "120363427278601708@g.us"       // Novo Grupo
    ],
    
    // 👑 ADMINS GLOBAIS (têm acesso a tudo)
    // Pode ser @s.whatsapp.net ou @lid
    adminsGlobais: [
        "7211669573681@lid", // Widnes (Dono)
        // Adicione mais ADMs aqui
    ],
    
    // ⚙️ MODO MANUTENÇÃO (bloqueia todos, exceto ADMs)
    modoManutencao: false,
    
    // 📝 LOGS
    logsAtivos: false
};

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

/**
 * Extrai o número do ID (funciona com @s.whatsapp.net e @lid)
 */
function extrairNumero(id) {
    if (!id) return "";
    // Remove tudo depois do @
    const numero = id.split('@')[0];
    // Remove :0 :1 :2 etc (caso tenha)
    return numero.split(':')[0];
}

/**
 * Normaliza o ID para comparação (só o número)
 */
function normalizarId(id) {
    if (!id) return "";
    return extrairNumero(id);
}

// ============================================================
// FUNÇÕES PRINCIPAIS
// ============================================================

/**
 * Verifica se um usuário é ADMIN GLOBAL
 * Aceita @s.whatsapp.net e @lid
 */
function isGlobalAdmin(userId) {
    if (!userId) return false;
    
    const userNumero = normalizarId(userId);
    
    return CONFIG.adminsGlobais.some(admin => {
        const adminNumero = normalizarId(admin);
        return adminNumero === userNumero;
    });
}

/**
 * Verifica se um grupo é AUTORIZADO
 */
function isGrupoAutorizado(grupoId) {
    if (!grupoId) return false;
    return CONFIG.gruposAutorizados.some(grupo => {
        const grupoNumero = grupo.split('@')[0];
        const grupoIdNumero = grupoId.split('@')[0];
        return grupoNumero === grupoIdNumero;
    });
}

/**
 * FUNÇÃO PRINCIPAL - Verifica se o usuário tem permissão
 */
function isAutorizado(remetenteId, remoteJid) {
    // ===== MODO MANUTENÇÃO =====
    if (CONFIG.modoManutencao) {
        if (isGlobalAdmin(remetenteId)) {
            return true;
        }
        return false;
    }

    // ===== PV (PRIVADO) =====
    if (!remoteJid?.endsWith('@g.us')) {
        // Libera para ADMs globais no PV
        if (isGlobalAdmin(remetenteId)) {
            return true;
        }
        return false;
    }

    // ===== GRUPO =====
    // Libera ADMs globais em qualquer grupo
    if (isGlobalAdmin(remetenteId)) {
        return true;
    }

    // Verifica se o grupo é autorizado
    return isGrupoAutorizado(remoteJid);
}

/**
 * Adicionar grupo à lista de autorizados
 */
function adicionarGrupo(grupoId) {
    if (!grupoId) return false;
    if (isGrupoAutorizado(grupoId)) return false;
    
    CONFIG.gruposAutorizados.push(grupoId);
    return true;
}

/**
 * Remover grupo da lista de autorizados
 */
function removerGrupo(grupoId) {
    if (!grupoId) return false;
    const index = CONFIG.gruposAutorizados.indexOf(grupoId);
    if (index === -1) return false;
    
    CONFIG.gruposAutorizados.splice(index, 1);
    return true;
}

/**
 * Adicionar ADMIN GLOBAL (aceita número ou ID completo)
 */
function adicionarAdmin(adminId) {
    if (!adminId) return false;
    
    // ===== VERIFICA SE JÁ EXISTE =====
    if (CONFIG.adminsGlobais.some(a => normalizarId(a) === normalizarId(adminId))) {
        return false;
    }
    
    // ===== FORMATA O ID =====
    let adminFormatado = adminId;
    // Se for só número, adiciona @s.whatsapp.net
    if (!adminId.includes('@')) {
        adminFormatado = `${adminId}@s.whatsapp.net`;
    }
    
    CONFIG.adminsGlobais.push(adminFormatado);
    return true;
}

/**
 * Remover ADMIN GLOBAL
 */
function removerAdmin(adminId) {
    if (!adminId) return false;
    
    const adminNumero = normalizarId(adminId);
    const index = CONFIG.adminsGlobais.findIndex(a => normalizarId(a) === adminNumero);
    
    if (index === -1) return false;
    
    CONFIG.adminsGlobais.splice(index, 1);
    return true;
}

/**
 * Ativar/Desativar modo manutenção
 */
function setModoManutencao(ativo) {
    CONFIG.modoManutencao = ativo;
    return CONFIG.modoManutencao;
}

/**
 * Ativar/Desativar logs
 */
function setLogs(ativo) {
    CONFIG.logsAtivos = ativo;
    return CONFIG.logsAtivos;
}

/**
 * Ver status do sistema
 */
function getStatus() {
    return {
        modoManutencao: CONFIG.modoManutencao,
        totalGrupos: CONFIG.gruposAutorizados.length,
        totalAdmins: CONFIG.adminsGlobais.length,
        grupos: CONFIG.gruposAutorizados,
        admins: CONFIG.adminsGlobais
    };
}

// ============================================================
// EXPORTAÇÕES
// ============================================================
module.exports = {
    // Configuração
    CONFIG,
    
    // Funções principais
    isAutorizado,
    isGlobalAdmin,
    isGrupoAutorizado,
    
    // Gerenciamento
    adicionarGrupo,
    removerGrupo,
    adicionarAdmin,
    removerAdmin,
    setModoManutencao,
    setLogs,
    getStatus
};
