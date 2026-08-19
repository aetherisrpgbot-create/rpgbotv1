// ============================================================
// HANDLER - ANTI-VIEWONCE (SALVA IMAGENS DE VISUALIZAÇÃO ÚNICA)
// ============================================================
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const { lerJSON } = require("../servicos/banco");

const ARQUIVO_CONFIG = "./database/anti_viewonce.json";
const PASTA_SALVAR = "./imagens/viewonce";

function isAntiViewOnceAtivo(grupoId) {
    try {
        const config = lerJSON(ARQUIVO_CONFIG);
        return config[grupoId] || false;
    } catch {
        return false;
    }
}

async function salvarImagem(buffer, nomeArquivo) {
    if (!fs.existsSync(PASTA_SALVAR)) {
        fs.mkdirSync(PASTA_SALVAR, { recursive: true });
    }

    const caminho = path.join(PASTA_SALVAR, nomeArquivo);
    fs.writeFileSync(caminho, buffer);
    return caminho;
}

async function handleAntiViewOnce(sock, msg, remoteJid) {
    // ===== VERIFICA SE A FUNÇÃO ESTÁ ATIVA NO GRUPO =====
    if (!isAntiViewOnceAtivo(remoteJid)) return;

    // ===== VERIFICA SE É UMA IMAGEM DE VISUALIZAÇÃO ÚNICA =====
    const viewOnce = msg.message?.viewOnceMessageV2 || msg.message?.viewOnceMessage;
    if (!viewOnce) return;

    // ===== EXTRAI A IMAGEM =====
    const imageMsg = viewOnce.message?.imageMessage;
    if (!imageMsg) return;

    try {
        // ===== BAIXA A IMAGEM =====
        const buffer = await downloadMediaMessage(
            { key: msg.key, message: viewOnce },
            "buffer",
            {},
            { logger: console }
        );

        if (!buffer) return;

        // ===== GERA NOME DO ARQUIVO =====
        const timestamp = Date.now();
        const nome = `${timestamp}.jpg`;
        const caminho = await salvarImagem(buffer, nome);

        console.log(`📷 IMAGEM VIEWONCE SALVA: ${caminho}`);

        // ===== ENVIA MENSAGEM NO GRUPO (AVISA QUE SALVOU) =====
        await sock.sendMessage(remoteJid, {
            text: `📷 *IMAGEM SALVA!*\n\n` +
                  `🔒 Visualização única detectada.\n` +
                  `✅ A imagem foi salva automaticamente.\n` +
                  `📁 Arquivo: ${nome}`
        });

        // ===== TAMBÉM ENVIA A IMAGEM DE VOLTA (OPCIONAL) =====
        // await sock.sendMessage(remoteJid, {
        //     image: buffer,
        //     caption: `📷 *Imagem salva automaticamente*`
        // });

    } catch (err) {
        console.log("❌ ERRO AO SALVAR VIEWONCE:", err);
    }
}

module.exports = {
    isAntiViewOnceAtivo,
    salvarImagem,
    handleAntiViewOnce
};
