// !converter - Texto em figurinha
const { criarConverterColorido, bufferToSticker } = require("../../utils/helpers");

module.exports = {
    nome: "converter",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            let texto = args.join(" ").trim();

            // ===== DETECTA COR =====
            const cores = ["preto", "vermelho", "azul", "verde", "amarelo", "roxo", "rosa", "laranja", "cinza"];
            let cor = "preto";
            let textoLimpo = texto;

            if (args.length > 0 && cores.includes(args[0].toLowerCase())) {
                cor = args[0].toLowerCase();
                textoLimpo = args.slice(1).join(" ").trim();
            }

            if (!textoLimpo && quoted) {
                textoLimpo = (
                    quoted?.conversation ||
                    quoted?.extendedTextMessage?.text ||
                    quoted?.imageMessage?.caption ||
                    quoted?.videoMessage?.caption ||
                    ""
                ).trim();
            }

            if (!textoLimpo) {
                return sock.sendMessage(remoteJid, {
                    text: `🎨 *CONVERTER*\n\n` +
                          `!converter <texto>\n` +
                          `!converter <cor> <texto>\n\n` +
                          `Cores: preto, vermelho, azul, verde, amarelo, roxo, rosa, laranja, cinza\n\n` +
                          `Ex: !converter azul Eu te amo 💙`
                });
            }

            if (textoLimpo.length > 150) textoLimpo = textoLimpo.slice(0, 150);

            const imagem = await criarConverterColorido(textoLimpo, cor);
            const sticker = await bufferToSticker(imagem);

            await sock.sendMessage(remoteJid, { sticker });

        } catch (err) {
            console.log("ERRO converter:", err);
            await sock.sendMessage(remoteJid, { text: "❌ Erro ao criar figurinha." });
        }
    }
};
