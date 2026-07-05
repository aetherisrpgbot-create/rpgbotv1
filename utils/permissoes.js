// ============================================================
// FUNÇÕES DE PERMISSÃO - VERSÃO DEFINITIVA (COM LID)
// ============================================================
const { getGroupMetadata } = require("./cache");
const cacheMetadata = new Map();
const CACHE_TIME = 60000; // 60 segundos

async function getGroupMetadataCached(sock, groupId) {

    const cached = cacheMetadata.get(groupId);

    if (
        cached &&
        (Date.now() - cached.timestamp) < CACHE_TIME
    ) {
        return cached.meta;
    }

    const meta = await sock.groupMetadata(groupId);

    cacheMetadata.set(groupId, {
        meta,
        timestamp: Date.now()
    });

    return meta;
}

// ========== PEGAR ID DO BOT ==========
function getBotId(sock) {
    try {

        if (!sock) {
            console.log("❌ Socket não encontrado");
            return null;
        }

        if (!sock.user) {
            console.log("❌ sock.user não encontrado");
            return null;
        }

        if (!sock.user.id) {
            console.log("❌ ID do bot não encontrado");
            return null;
        }

        return sock.user.id;

    } catch (err) {

        console.log("ERRO getBotId:", err);
        return null;

    }
}

// ========== VERIFICAR SE USUÁRIO É ADMIN ==========
async function isAdmin(sock, groupId, userId) {
    try {

        if (!groupId || !userId) return false;

        const meta = await getGroupMetadata(sock, groupId);

        const userNumero = userId
            .split("@")[0]
            .split(":")[0];

        const participante = meta.participants.find(p => {

            const pNumero = p.id
                .split("@")[0]
                .split(":")[0];

            return pNumero === userNumero;
        });

        return (
            participante &&
            (
                participante.admin === "admin" ||
                participante.admin === "superadmin"
            )
        );

    } catch (err) {

        console.log("ERRO isAdmin:", err);
        return false;

    }
}

// ========== VERIFICAR SE BOT É ADMIN ==========
async function isBotAdmin(sock, groupId) {
    try {

        if (!groupId) return false;

        const botId = getBotId(sock);
        if (!botId) return false;

        const meta = await getGroupMetadata(sock, groupId);

        const botNumero = botId
            .split("@")[0]
            .split(":")[0];

        const bot = meta.participants.find(p => {

            const pNumero = p.id
                .split("@")[0]
                .split(":")[0];

            return pNumero === botNumero;
        });

        if (!bot) return false;

        return (
            bot.admin === "admin" ||
            bot.admin === "superadmin"
        );

    } catch (err) {

        console.log("ERRO isBotAdmin:", err);
        return false;

    }
}

// ========== OBTER LISTA DE ADMINS ==========
async function getAdmins(sock, groupId) {
    try {

        const meta = await getGroupMetadata(sock, groupId);

        return meta.participants.filter(p =>
            p.admin === "admin" ||
            p.admin === "superadmin"
        );

    } catch (err) {

        console.log("ERRO getAdmins:", err);
        return [];

    }
}

module.exports = {
    getBotId,
    isAdmin,
    isBotAdmin,
    getAdmins
};
