// ============================================================
// SISTEMA DE AUTORIZAÇÃO - SÓ GRUPOS
// ============================================================

// 🔥 GRUPOS AUTORIZADOS (só esses grupos funcionam)
const GRUPOS_AUTORIZADOS = [
    "120363351564577845@g.us",      // SEU GRUPO
    "120363427627809950@g.us",      // GRUPO DO CLIENTE
    "120363427278601708@g.us",      // NOVO GRUPO
];

// ===== FUNÇÃO PARA VERIFICAR GRUPO =====
function grupoAutorizado(grupoId) {
    if (!grupoId) return false;
    console.log(`🔍 Verificando grupo: ${grupoId}`);
    
    for (const autorizado of GRUPOS_AUTORIZADOS) {
        if (grupoId === autorizado) {
            console.log(`✅ Grupo autorizado: ${grupoId}`);
            return true;
        }
    }
    console.log(`❌ Grupo NÃO autorizado: ${grupoId}`);
    return false;
}

// ===== FUNÇÃO PRINCIPAL =====
function isAutorizado(remetenteId, remoteJid) {
    console.log(`🔍 Verificando: remoteJid=${remoteJid}`);
    
    // 🔥 SE FOR PV (privado), BLOQUEIA
    if (!remoteJid?.endsWith('@g.us')) {
        console.log(`🚫 É PV (privado), bloqueado!`);
        return false;
    }

    // 🔥 SE FOR GRUPO, VERIFICA SE É AUTORIZADO
    if (!grupoAutorizado(remoteJid)) {
        console.log(`🚫 Grupo não autorizado`);
        return false;
    }

    console.log(`✅ Grupo autorizado!`);
    return true;
}

module.exports = {
    GRUPOS_AUTORIZADOS,
    grupoAutorizado,
    isAutorizado
};
