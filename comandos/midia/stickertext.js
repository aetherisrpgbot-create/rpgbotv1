// !stickertext - CRIA FIGURINHA COM TEXTO (RÁPIDO)
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { criarStickerLegenda } = require("../../utils/helpers");

module.exports = {
    nome: "stickertext",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const imageMsg = quoted?.imageMessage || msg.message?.imageMessage;

            if (!imageMsg) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Responda uma *IMAGEM* para criar a figurinha com texto.\n\n📌 !stickertext <texto>"
                });
            }

            const texto = args.join(" ").trim();
            if (!texto) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Digite o texto!\n\n📌 !stickertext <texto>\nExemplo: !stickertext Olá mundo!"
                });
            }

            const buffer = await downloadMediaMessage(
                { message: quoted || msg.message },
                "buffer",
                {},
                { logger: console }
            );

            if (!buffer) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Não consegui baixar a imagem."
                });
            }

            // Detecta cor (opcional)
            let cor = "preto";
            let textoLimpo = texto;
            const cores = ["preto", "branco", "vermelho", "azul", "verde", "amarelo", "roxo", "rosa", "laranja", "cinza", "marrom", "dourado"];
            const primeiraPalavra = args[0].toLowerCase();
            if (cores.includes(primeiraPalavra)) {
                cor = primeiraPalavra;
                textoLimpo = args.slice(1).join(" ").trim();
                if (!textoLimpo) {
                    return sock.sendMessage(remoteJid, {
                        text: "❌ Digite o texto após a cor.\nExemplo: !stickertext vermelho Fogo!"
                    });
                }
            }

            const stickerBuffer = await criarStickerLegenda(buffer, textoLimpo, cor);

            await sock.sendMessage(remoteJid, {
                sticker: stickerBuffer
            });

        } catch (err) {
            console.log("❌ ERRO stickertext:", err);
            await sock.sendMessage(remoteJid, {
                text: "❌ Erro ao criar figurinha com texto."
            });
        }
    }
};
