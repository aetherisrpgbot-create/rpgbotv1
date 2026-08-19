// !antiviewonce - ATIVA/DESATIVA A PROTEÇÃO (APAGA FOTOS NORMAIS)
const { lerJSON, escreverJSON } = require("../../servicos/banco");
const { isAdmin } = require("../../utils/permissoes");

const ARQUIVO_CONFIG = "./database/anti_viewonce.json";

function getConfig() {
    return lerJSON(ARQUIVO_CONFIG);
}

function setConfig(grupoId, ativo) {
    const config = getConfig();
    config[grupoId] = ativo;
    escreverJSON(ARQUIVO_CONFIG, config);
}

module.exports = {
    nome: "antiviewonce",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup) => {
        if (!isGroup) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Este comando só funciona em grupos!"
            });
        }

        const ehAdmin = await isAdmin(sock, remoteJid, remetenteId);
        if (!ehAdmin) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Apenas administradores podem ativar/desativar essa função!"
            });
        }

        const sub = args[0]?.toLowerCase();

        // ===== VER STATUS =====
        if (!sub || sub === "status") {
            const config = getConfig();
            const ativo = config[remoteJid] || false;
            
            return sock.sendMessage(remoteJid, {
                text: `📷 *ANTI-VIEWONCE*\n\n` +
                      `Status: ${ativo ? '✅ ATIVADO' : '❌ DESATIVADO'}\n\n` +
                      `📌 ${ativo ? 'Fotos normais serão APAGADAS!' : 'Fotos normais não serão apagadas.'}\n\n` +
                      `📌 Use !antiviewonce on para ativar\n` +
                      `📌 Use !antiviewonce off para desativar`
            });
        }

        // ===== ATIVAR =====
        if (sub === "on" || sub === "ativar") {
            setConfig(remoteJid, true);
            
            return sock.sendMessage(remoteJid, {
                text: `✅ *ANTI-VIEWONCE ATIVADO!*\n\n` +
                      `📷 A partir de agora, fotos *NORMAIS* serão APAGADAS automaticamente.\n` +
                      `📌 Use *visualização única* para enviar fotos neste grupo.\n` +
                      `📌 Use !antiviewonce off para desativar.`
            });
        }

        // ===== DESATIVAR =====
        if (sub === "off" || sub === "desativar") {
            setConfig(remoteJid, false);
            
            return sock.sendMessage(remoteJid, {
                text: `❌ *ANTI-VIEWONCE DESATIVADO!*\n\n` +
                      `📷 Fotos normais não serão mais apagadas.\n` +
                      `📌 Use !antiviewonce on para ativar novamente.`
            });
        }

        return sock.sendMessage(remoteJid, {
            text: `❌ Comando inválido!\n\n` +
                  `📌 !antiviewonce → Ver status\n` +
                  `📌 !antiviewonce on → Ativar\n` +
                  `📌 !antiviewonce off → Desativar`
        });
    }
};
