// !converterpreto - Atalho fundo branco letra preta
const { criarConverterColorido, bufferToSticker } = require("../../utils/helpers");

module.exports = {
    nome: "converterpreto",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            let texto = args.join(" ").trim();

            if (!texto && quoted) {
                texto = (
                    quoted?.conversation ||
                    quoted?.extendedTextMessage?.text ||
                    quoted?.imageMessage?.caption ||
                    quoted?.videoMessage?.caption ||
                    ""
                ).trim();
            }

            if (!texto) {
                return sock.sendMessage(remoteJid, {
                    text: "📌 Use: !converterpreto <texto>\nExemplo: !converterpreto Olá mundo!"
                });
            }

            if (texto.length > 150) texto = texto.slice(0, 150);

            const imagem = await criarConverterColorido(texto, "preto");
            const sticker = await bufferToSticker(imagem);

            await sock.sendMessage(remoteJid, { sticker });

        } catch (err) {
            console.log("ERRO converterpreto:", err);
            await sock.sendMessage(remoteJid, {
                text: "❌ Erro ao criar figurinha. Tente novamente!"
            });
        }
    }
};
