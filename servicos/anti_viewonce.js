// ============================================================
// SERVIÇO - ANTI-VIEWONCE (APAGA FOTOS NORMAIS)
// ============================================================
const { lerJSON } = require("./banco");
const { isAdmin } = require("../utils/permissoes");

const ARQUIVO_CONFIG = "./database/anti_viewonce.json";

function isAntiViewOnceAtivo(grupoId) {
    try {
        const config = lerJSON(ARQUIVO_CONFIG);
        return config[grupoId] || false;
    } catch {
        return false;
    }
}

async function apagarFotoNormal(sock, msg, remoteJid, remetenteId) {
    // ===== VERIFICA SE A FUNÇÃO ESTÁ ATIVA NO GRUPO =====
    if (!isAntiViewOnceAtivo(remoteJid)) return false;

    // ===== VERIFICA SE É UMA IMAGEM NORMAL =====
    const imageMsg = msg.message?.imageMessage;
    if (!imageMsg) return false;

    // ===== VERIFICA SE NÃO É VIEWONCE =====
    const isViewOnce = imageMsg?.viewOnce || false;
    if (isViewOnce) return false;

    // ===== 🔥 IGNORA SE FOR ADMIN (COM DEBUG) =====
    console.log(`🔍 Verificando se ${remetenteId} é ADM em ${remoteJid}...`);
    const ehAdmin = await isAdmin(sock, remoteJid, remetenteId);
    console.log(`📊 Resultado isAdmin: ${ehAdmin}`);

    if (ehAdmin) {
        console.log(`👑 ADM enviou foto normal em ${remoteJid} - IGNORADO`);
        return false;
    }

    // ===== APAGA A FOTO =====
    try {
        await sock.sendMessage(remoteJid, {
            delete: msg.key
        });
        console.log(`🗑️ FOTO NORMAL APAGADA em ${remoteJid}`);
        return true;
    } catch (err) {
        console.log("❌ ERRO AO APAGAR FOTO:", err.message);
        return false;
    }
}

module.exports = {
    isAntiViewOnceAtivo,
    apagarFotoNormal
};
