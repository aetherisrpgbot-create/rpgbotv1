// MEME NORMAL (TEXTO EM CIMA E EMBAIXO) - COM FONTE ADAPTÁVEL
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { exec } = require("child_process");
const { bufferToSticker } = require("../../utils/helpers");

module.exports = {
    nome: "stickermeme",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const imageMsg = quoted?.imageMessage || msg.message?.imageMessage;

            if (!imageMsg) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Responda uma *IMAGEM* para criar o meme.\n\n📌 !stickermeme <texto cima> | <texto baixo>\nExemplo: !stickermeme Isso é | Genial"
                });
            }

            const argsStr = args.join(" ").trim();
            if (!argsStr || !argsStr.includes("|")) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Use: !stickermeme <texto cima> | <texto baixo>\n\nExemplo: !stickermeme Isso é | Genial"
                });
            }

            const [textoCima, textoBaixo] = argsStr.split("|").map(t => t.trim());
            if (!textoCima && !textoBaixo) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Digite pelo menos um texto!"
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

            // ===== CRIA MEME NORMAL =====
            const tempDir = os.tmpdir();
            const inputPath = path.join(tempDir, `input_${Date.now()}.jpg`);
            const outputPath = path.join(tempDir, `output_${Date.now()}.jpg`);

            fs.writeFileSync(inputPath, buffer);

            // 🔥 Função para escapar caracteres especiais
            const escaparTexto = (texto) => {
                return texto
                    .replace(/:/g, '\\:')
                    .replace(/'/g, "\\'")
                    .replace(/"/g, '\\"')
                    .replace(/\\/g, '\\\\');
            };

            const textoCimaEscapado = textoCima ? escaparTexto(textoCima) : '';
            const textoBaixoEscapado = textoBaixo ? escaparTexto(textoBaixo) : '';

            // 🔥 CALCULA TAMANHO DA FONTE BASEADO NO TEXTO
            const calcularFonte = (texto, isCima = true) => {
                const comprimento = texto.length;
                
                let tamanho;
                
                if (isCima) {
                    // Texto de cima (espaço: ~90% da largura)
                    if (comprimento <= 10) tamanho = 50;
                    else if (comprimento <= 15) tamanho = 45;
                    else if (comprimento <= 20) tamanho = 38;
                    else if (comprimento <= 30) tamanho = 32;
                    else if (comprimento <= 40) tamanho = 26;
                    else tamanho = 20;
                } else {
                    // Texto de baixo (espaço: ~90% da largura)
                    if (comprimento <= 10) tamanho = 45;
                    else if (comprimento <= 15) tamanho = 40;
                    else if (comprimento <= 20) tamanho = 35;
                    else if (comprimento <= 30) tamanho = 28;
                    else if (comprimento <= 40) tamanho = 22;
                    else tamanho = 18;
                }
                
                return Math.max(16, Math.min(55, tamanho));
            };

            const fonteCima = textoCima ? calcularFonte(textoCima, true) : 45;
            const fonteBaixo = textoBaixo ? calcularFonte(textoBaixo, false) : 40;

            console.log(`📊 Fonte: Cima=${fonteCima}, Baixo=${fonteBaixo}`);

            // 🔥 FILTRO NORMAL (SEM FAIXA BRANCA)
            let filtros = [];

            // 1. Texto em cima
            if (textoCimaEscapado) {
                filtros.push(`drawtext=text='${textoCimaEscapado}':fontcolor=white:fontsize=${fonteCima}:line_spacing=10:x=(w-text_w)/2:y=15:shadowcolor=black:shadowx=2:shadowy=2:borderw=2:bordercolor=black`);
            }

            // 2. Texto embaixo
            if (textoBaixoEscapado) {
                filtros.push(`drawtext=text='${textoBaixoEscapado}':fontcolor=white:fontsize=${fonteBaixo}:line_spacing=10:x=(w-text_w)/2:y=h-text_h-15:shadowcolor=black:shadowx=2:shadowy=2:borderw=2:bordercolor=black`);
            }

            // 3. Escala pra sticker
            filtros.push(`scale=512:512:flags=lanczos`);

            const filtroCompleto = filtros.join(',');

            const cmd = `ffmpeg -y -i "${inputPath}" -vf "${filtroCompleto}" "${outputPath}"`;

            console.log('📝 Comando FFmpeg:', cmd);

            await new Promise((resolve, reject) => {
                exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
                    if (err) {
                        console.error('❌ Erro FFmpeg:', stderr);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            if (!fs.existsSync(outputPath)) {
                throw new Error("Meme não gerado");
            }

            const stickerBuffer = await bufferToSticker(fs.readFileSync(outputPath), false);

            // Limpa arquivos
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

            await sock.sendMessage(remoteJid, {
                sticker: stickerBuffer
            });

        } catch (err) {
            console.log("❌ ERRO stickermeme:", err);
            await sock.sendMessage(remoteJid, {
                text: "❌ Erro ao criar meme.\n\n" + err.message?.substring(0, 100) || ""
            });
        }
    }
};
