// rename.js - VERSÃO SEM FFMPEG (USA APENAS node-webpmux)
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { adicionarExif } = require("../../utils/helpers");

module.exports = {
    nome: "rename",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            // ===== VERIFICA SE RESPONDEU UMA FIGURINHA =====
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const stickerMsg = quoted?.stickerMessage || msg.message?.stickerMessage;

            if (!stickerMsg) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Responda uma *FIGURINHA* (imagem ou vídeo) para renomear.\n\n📌 !rename <novo nome>"
                });
            }

            // ===== PEGA O NOME =====
            let novoNome = args.join(" ").trim() || "Figurinha";

            // Se for "my name" ou "meu nome", usa o nome do WhatsApp
            if (novoNome.toLowerCase() === "my name" || novoNome.toLowerCase() === "meu nome") {
                novoNome = msg.pushName || "Aventureiro";
            }

            // ===== BAIXA A FIGURINHA =====
            const buffer = await downloadMediaMessage(
                { message: quoted || msg.message },
                "buffer",
                {},
                { logger: console }
            );

            if (!buffer) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Não consegui baixar a figurinha."
                });
            }

            // ===== USA O BUFFER DIRETO, SEM FFMPEG =====
            // Tenta adicionar o EXIF diretamente
            let stickerFinal;
            try {
                stickerFinal = await adicionarExif(
                    buffer,
                    novoNome,
                    "👑 𝕿𝖍𝖊 ℝℙ𝔾 𝕭𝖔𝖙 👑"
                );
            } catch (exifErr) {
                console.log('⚠️ Erro no EXIF, enviando sem renomear:', exifErr.message);
                stickerFinal = buffer;
            }

            // ===== ENVIA =====
            await sock.sendMessage(remoteJid, {
                sticker: stickerFinal
            });

            await sock.sendMessage(remoteJid, {
                text: `✅ Figurinha renomeada para: *${novoNome}*`
            });

        } catch (err) {
            console.log("❌ ERRO rename:", err);

            let erroMsg = "❌ Erro ao renomear figurinha.";

            if (err.message?.includes("ffmpeg")) {
                erroMsg = "❌ Erro no FFmpeg.\n\nTente enviar uma figurinha normal.";
            } else if (err.message?.includes("adicionarExif")) {
                erroMsg = "❌ Erro no EXIF. Verifique se o helpers.js exporta adicionarExif.";
            } else if (err.message?.includes("node-webpmux")) {
                erroMsg = "❌ Erro no node-webpmux.\n\nInstale com: npm install node-webpmux";
            } else if (err.message) {
                erroMsg += `\n\n${err.message.substring(0, 100)}`;
            }

            await sock.sendMessage(remoteJid, {
                text: erroMsg
            });
        }
    }
};
