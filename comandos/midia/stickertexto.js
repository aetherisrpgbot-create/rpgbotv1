// !stickertexto - Cria figurinha com texto sobreposto (COM QUEBRA DE LINHA E AJUSTE DE FONTE)
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { exec } = require("child_process");

module.exports = {
    nome: "stickertexto",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const texto = args.join(" ").trim();

            if (!texto) {
                return sock.sendMessage(remoteJid, {
                    text: "📌 *Use:* !stickertexto <texto>\n\nResponda uma imagem.\nExemplo: !stickertexto Olá mundo!"
                });
            }

            const media = quoted?.imageMessage || msg.message?.imageMessage;
            
            if (!media) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Responda uma imagem com !stickertexto"
                });
            }

            const buffer = await downloadMediaMessage(
                { key: msg.key, message: quoted || msg.message },
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
            const outputPath = path.join(tempDir, `output_${Date.now()}.webp`);

            fs.writeFileSync(inputPath, buffer);

            // ===== DETECTA COR =====
            const cores = {
                preto: "black",
                branco: "white",
                vermelho: "red",
                azul: "blue",
                verde: "green",
                amarelo: "yellow",
                roxo: "purple",
                rosa: "pink",
                laranja: "orange",
                cinza: "gray"
            };

            let cor = "white";
            let textoLimpo = texto;

            if (args.length > 0 && cores[args[0].toLowerCase()]) {
                cor = cores[args[0].toLowerCase()];
                textoLimpo = args.slice(1).join(" ").trim();
                if (!textoLimpo) {
                    return sock.sendMessage(remoteJid, {
                        text: "❌ Digite um texto após a cor.\nExemplo: !stickertexto vermelho Fogo!"
                    });
                }
            }

            // ===== QUEBRA O TEXTO EM LINHAS (IGUAL AO CONVERTER) =====
            function quebrarTexto(texto, limite = 20) {
                const palavras = texto.split(" ");
                let linhas = [];
                let linhaAtual = "";

                for (const palavra of palavras) {
                    if ((linhaAtual + " " + palavra).length > limite) {
                        linhas.push(linhaAtual.trim());
                        linhaAtual = palavra + " ";
                    } else {
                        linhaAtual += palavra + " ";
                    }
                }
                if (linhaAtual.trim()) linhas.push(linhaAtual.trim());
                return linhas;
            }

            const linhas = quebrarTexto(textoLimpo, 20);
            const textoQuebrado = linhas.join("\\n");

            // ===== ESCAPA O TEXTO =====
            const textoEscapado = textoQuebrado
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/'/g, "\\'")
                .replace(/:/g, "\\:")
                .replace(/%/g, "\\%")
                .replace(/\(/g, "\\(")
                .replace(/\)/g, "\\)")
                .replace(/\[/g, "\\[")
                .replace(/\]/g, "\\]")
                .replace(/\{/g, "\\{")
                .replace(/\}/g, "\\}")
                .replace(/\$/g, "\\$")
                .replace(/`/g, "\\`");

            // ===== CONVERTE EMOJIS =====
            function emojiParaTexto(texto) {
                const emojis = {
                    '😀': ':D', '😁': ':D', '😂': 'XD', '🤣': 'XDD',
                    '❤️': '<3', '🧡': '<3', '💛': '<3', '💚': '<3', '💙': '<3', '💜': '<3',
                    '🔥': '#FOGO#', '⭐': '*', '🌟': '*', '✨': '*',
                    '👑': '#REI#', '⚔️': '#ESPADA#', '🛡️': '#ESCUDO#',
                    '💰': '#DINHEIRO#', '💎': '#GEMA#', '🎯': '#ALVO#',
                    '🎉': '#FESTA#', '🎊': '#FESTA#', '🎁': '#PRESENTE#',
                    '💀': '#MORTE#', '👹': '#DEMONIO#', '👺': '#GOBLIN#',
                    '🐉': '#DRAGAO#', '🐲': '#DRAGAO#', '🌈': '#ARCO-IRIS#',
                    '☀️': '#SOL#', '🌙': '#LUA#', '💪': '#FORÇA#',
                    '🏆': '#TROFEU#', '🥇': '#OURO#', '🥈': '#PRATA#', '🥉': '#BRONZE#',
                    '🎵': '#MUSICA#', '🎶': '#MUSICA#', '📌': '#PIN#', '📍': '#PIN#',
                    '🔴': '#VERMELHO#', '🔵': '#AZUL#', '🟢': '#VERDE#',
                    '🟡': '#AMARELO#', '🟣': '#ROXO#', '🟠': '#LARANJA#',
                    '⚫': '#PRETO#', '⚪': '#BRANCO#', '⬜': '#BRANCO#',
                    '💗': '#ROSA#', '💖': '#ROSA#', '💕': '#ROSA#',
                    '👍': '#OK#', '👎': '#NAO#', '👏': '#APLAUSOS#',
                    '🙏': '#OBRIGADO#', '🤝': '#APERTO#', '💯': '#100#',
                    '🔞': '#18+', '📛': '#NOME#', '📢': '#ATENCAO#',
                    '📣': '#ATENCAO#', '🔊': '#SOM#', '🔇': '#MUDO#'
                };
                
                for (const [emoji, substituto] of Object.entries(emojis)) {
                    texto = texto.replace(new RegExp(emoji, 'g'), substituto);
                }
                return texto;
            }

            const textoFinal = emojiParaTexto(textoEscapado);

            // ===== TAMANHO DA FONTE (IGUAL AO CONVERTER) =====
            let fontSize = 40;
            const numLinhas = linhas.length;
            if (numLinhas > 4) fontSize = 24;
            else if (numLinhas > 3) fontSize = 28;
            else if (numLinhas > 2) fontSize = 34;
            else if (numLinhas > 1) fontSize = 40;
            else fontSize = 48;

            console.log(`🎨 Gerando figurinha com texto: "${textoFinal}" | Cor: ${cor} | Fonte: ${fontSize} | Linhas: ${numLinhas}`);

            // ===== FFMPEG COM TEXTO SOBREPOSTO =====
            const cmd = `ffmpeg -y -i "${inputPath}" ` +
                        `-vf "scale=512:512:flags=lanczos,drawtext=text='${textoFinal}':fontcolor=${cor}:fontsize=${fontSize}:fontfile=/system/fonts/Roboto-Regular.ttf:line_spacing=25:x=(w-text_w)/2:y=(h-text_h)/2" ` +
                        `-vcodec libwebp -lossless 0 -compression_level 6 -q:v 60 -loop 0 -preset picture -an -vsync 0 -t 6 "${outputPath}"`;

            await new Promise((resolve, reject) => {
                exec(cmd, (err) => {
                    if (err) {
                        // FALLBACK: SEM FONTE
                        const cmdFallback = `ffmpeg -y -i "${inputPath}" ` +
                                           `-vf "scale=512:512:flags=lanczos,drawtext=text='${textoFinal}':fontcolor=${cor}:fontsize=${fontSize}:line_spacing=25:x=(w-text_w)/2:y=(h-text_h)/2" ` +
                                           `-vcodec libwebp -lossless 0 -compression_level 6 -q:v 60 -loop 0 -preset picture -an -vsync 0 -t 6 "${outputPath}"`;
                        exec(cmdFallback, (err2) => {
                            if (err2) reject(err2);
                            else resolve();
                        });
                    } else {
                        resolve();
                    }
                });
            });

            if (!fs.existsSync(outputPath)) {
                throw new Error("Falha ao gerar figurinha");
            }

            const stickerBuffer = fs.readFileSync(outputPath);
            await sock.sendMessage(remoteJid, { sticker: stickerBuffer });

            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

        } catch (err) {
            console.log("ERRO stickertexto:", err);
            await sock.sendMessage(remoteJid, {
                text: "❌ Erro ao criar figurinha com texto."
            });
        }
    }
};
