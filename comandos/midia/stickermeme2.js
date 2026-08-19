// stickermeme2.js - ESTILO NINGUÉM (BARRA BRANCA EM CIMA)
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { exec } = require("child_process");
const { bufferToSticker } = require("../../utils/helpers");

module.exports = {
    nome: "stickermeme2",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const imageMsg = quoted?.imageMessage || msg.message?.imageMessage;

            if (!imageMsg) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Responda uma *IMAGEM*.\n\n📌 !stickermeme2 texto cima | texto baixo"
                });
            }

            const argsStr = args.join(" ").trim();
            if (!argsStr || !argsStr.includes("|")) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Use: !stickermeme2 texto cima | texto baixo"
                });
            }

            const [textoCima, textoBaixo] = argsStr.split("|").map(t => t.trim());
            
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

            const tempDir = os.tmpdir();
            const inputPath = path.join(tempDir, `input_${Date.now()}.jpg`);
            const outputPath = path.join(tempDir, `output_${Date.now()}.jpg`);

            fs.writeFileSync(inputPath, buffer);

            // Escapar textos
            const escapar = (t) => t.replace(/:/g, '\\:').replace(/'/g, "\\'");
            const tc = textoCima ? escapar(textoCima) : 'NINGUÉM:';
            const tb = textoBaixo ? escapar(textoBaixo) : '';

            // 🔥 CALCULA FONTE (adaptável)
            const calcFonte = (texto) => {
                const len = texto.length;
                if (len <= 10) return 40;
                if (len <= 20) return 34;
                if (len <= 30) return 28;
                if (len <= 40) return 24;
                return 20;
            };

            const fonteCima = calcFonte(tc);
            const fonteBaixo = tb ? calcFonte(tb) : 30;

            // 🔥 FILTRO - ESTILO NINGUÉM
            // 1. Reduz a imagem (70%)
            // 2. Adiciona fundo preto com espaço em cima (120px)
            // 3. Barra branca no topo (80px)
            // 4. Texto preto na barra branca
            // 5. Texto branco embaixo (se tiver)
            // 6. Escala pra sticker

            let filtros = [
                `scale=iw:ih*0.7`,
                `pad=iw:ih+120:0:80:color=black`,
                `drawbox=x=0:y=0:w=iw:h=80:color=white`
            ];

            // Texto em cima (preto)
            if (tc) {
                filtros.push(`drawtext=text='${tc}':fontcolor=black:fontsize=${fonteCima}:x=(w-text_w)/2:y=18:shadowcolor=white:shadowx=1:shadowy=1`);
            }

            // Texto embaixo (branco) - se tiver
            if (tb) {
                filtros.push(`drawtext=text='${tb}':fontcolor=white:fontsize=${fonteBaixo}:x=(w-text_w)/2:y=h-30:shadowcolor=black:shadowx=2:shadowy=2:borderw=2:bordercolor=black`);
            }

            // Escala final
            filtros.push(`scale=512:512:flags=lanczos`);

            const cmd = `ffmpeg -y -i "${inputPath}" -vf "${filtros.join(',')}" "${outputPath}"`;

            console.log('📝 Comando:', cmd);

            await new Promise((resolve, reject) => {
                exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            if (!fs.existsSync(outputPath)) {
                throw new Error("Meme não gerado");
            }

            const stickerBuffer = await bufferToSticker(fs.readFileSync(outputPath), false);

            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);

            await sock.sendMessage(remoteJid, { sticker: stickerBuffer });

        } catch (err) {
            console.log("❌ ERRO:", err);
            await sock.sendMessage(remoteJid, {
                text: "❌ Erro ao criar meme."
            });
        }
    }
};
