// comandos/midia/imgeditar.js
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { exec } = require("child_process");
const { interpretarComandoAvancado } = require("../../servicos/interpretarComandoAvancado");

module.exports = {
    nome: "imgeditar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const imageMsg = quoted?.imageMessage || msg.message?.imageMessage;

            if (!imageMsg) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Responda uma *IMAGEM*.

📌 *EXEMPLOS:*
!imgeditar ia redimensiona 2100x2970 e borda vermelha 1
!imgeditar ia quadrado com borda preta 5
!imgeditar ia gira 90 graus e cinza
!imgeditar ia circular borda dourada`
                });
            }

            let argsStr = args.join(" ").trim();

            if (!argsStr.toLowerCase().startsWith("ia")) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Use: !imgeditar ia <descrição>"
                });
            }

            const descricao = argsStr.replace(/^ia\s*/i, "");

            if (!descricao) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Diga o que quer fazer!\n\nExemplo: !imgeditar ia redimensiona 2100x2970 e borda vermelha 1"
                });
            }

            await sock.sendMessage(remoteJid, {
                text: "🧠 *Interpretando...*"
            });

            const comandos = await interpretarComandoAvancado(descricao);

            if (!comandos || comandos.length === 0) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Não entendi. Tente: !imgeditar ia redimensiona 2100x2970 e borda vermelha 1"
                });
            }

            await sock.sendMessage(remoteJid, {
                text: `🧠 *Comandos:* ${comandos.join(', ')}\n⏳ Processando...`
            });

            // 🔥 BAIXA A IMAGEM
            const buffer = await downloadMediaMessage(
                { message: quoted || msg.message },
                "buffer",
                {},
                { logger: console }
            );

            if (!buffer || buffer.length < 100) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Não consegui baixar a imagem."
                });
            }

            const tempDir = os.tmpdir();
            const inputPath = path.join(tempDir, `input_${Date.now()}`);
            const outputPath = path.join(tempDir, `output_${Date.now()}.png`);

            fs.writeFileSync(inputPath, buffer);

            // 🔥 CONSTRÓI O FILTRO FFMPEG
            let filtros = [];
            let descricaoFinal = [];
            let hasResize = false;

            for (const cmd of comandos) {
                const cmdLower = cmd.toLowerCase();
                console.log(`🎨 Executando: ${cmd}`);

                // 🔥 REDIMENSIONAR
                const redimMatch = cmdLower.match(/redimensionar\s*(\d+)x(\d+)/);
                if (redimMatch) {
                    const w = parseInt(redimMatch[1]);
                    const h = parseInt(redimMatch[2]);
                    filtros.push(`scale=${w}:${h}:flags=lanczos`);
                    descricaoFinal.push(`${w}x${h}`);
                    hasResize = true;
                    continue;
                }

                // 🔥 LARGURA
                const larguraMatch = cmdLower.match(/largura\s*(\d+)/);
                if (larguraMatch) {
                    const w = parseInt(larguraMatch[1]);
                    filtros.push(`scale=${w}:-1:flags=lanczos`);
                    descricaoFinal.push(`Largura ${w}`);
                    hasResize = true;
                    continue;
                }

                // 🔥 ALTURA
                const alturaMatch = cmdLower.match(/altura\s*(\d+)/);
                if (alturaMatch) {
                    const h = parseInt(alturaMatch[1]);
                    filtros.push(`scale=-1:${h}:flags=lanczos`);
                    descricaoFinal.push(`Altura ${h}`);
                    hasResize = true;
                    continue;
                }

                // 🔥 MULTIPLICAR
                const multMatch = cmdLower.match(/multiplicar\s*([\d.]+)/);
                if (multMatch) {
                    const fator = parseFloat(multMatch[1]);
                    if (fator > 0 && fator <= 10) {
                        filtros.push(`scale=iw*${fator}:ih*${fator}:flags=lanczos`);
                        descricaoFinal.push(`${fator}x`);
                        hasResize = true;
                    }
                    continue;
                }

                // 🔥 QUADRADO
                if (cmdLower === 'quadrado') {
                    filtros.push('crop=min(iw\\,ih):min(iw\\,ih)');
                    filtros.push('scale=512:512:flags=lanczos');
                    descricaoFinal.push('Quadrado');
                    hasResize = true;
                    continue;
                }

                // 🔥 CIRCULAR
                if (cmdLower === 'circular' || cmdLower === 'redondo') {
                    if (!hasResize) {
                        filtros.push('scale=512:512:flags=lanczos');
                        hasResize = true;
                    }
                    filtros.push('format=rgba');
                    filtros.push('drawbox=0:0:iw:ih:color=black:thickness=fill');
                    filtros.push(`drawbox=0:0:iw:ih:color=white:thickness=fill:radius=min(iw,ih)/2`);
                    descricaoFinal.push('Circular');
                    continue;
                }

                // 🔥 ESTICAR
                if (cmdLower === 'esticar') {
                    filtros.push('scale=512:512:flags=lanczos');
                    descricaoFinal.push('Esticar');
                    hasResize = true;
                    continue;
                }

                // 🔥 PREENCHER
                if (cmdLower === 'preencher') {
                    filtros.push('scale=iw:ih*0.8');
                    filtros.push('pad=512:512:(512-iw)/2:(512-ih)/2:color=black');
                    descricaoFinal.push('Preencher');
                    hasResize = true;
                    continue;
                }

                // 🔥 GIRAR
                const girarMatch = cmdLower.match(/girar\s*(\d+)/);
                if (girarMatch) {
                    const angulo = parseInt(girarMatch[1]);
                    filtros.push(`rotate=${angulo}*PI/180:fillcolor=black`);
                    descricaoFinal.push(`Girar ${angulo}°`);
                    continue;
                }

                // 🔥 ESPELHAR
                if (cmdLower === 'espelhar') {
                    filtros.push('hflip');
                    descricaoFinal.push('Espelhado');
                    continue;
                }

                // 🔥 VIRAR
                if (cmdLower === 'virar') {
                    filtros.push('vflip');
                    descricaoFinal.push('Virado');
                    continue;
                }

                // 🔥 CINZA
                if (cmdLower === 'cinza' || cmdLower === 'preto e branco') {
                    filtros.push('hue=s=0');
                    descricaoFinal.push('P&B');
                    continue;
                }

                // 🔥 SEPIA
                if (cmdLower === 'sepia') {
                    filtros.push('colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131');
                    descricaoFinal.push('Sépia');
                    continue;
                }

                // 🔥 INVERTIDO
                if (cmdLower === 'invertido') {
                    filtros.push('negate');
                    descricaoFinal.push('Invertido');
                    continue;
                }

                // 🔥 DESFOCAR
                const desfocarMatch = cmdLower.match(/desfocar\s*(\d+)/);
                if (desfocarMatch) {
                    const intensidade = Math.min(parseInt(desfocarMatch[1]), 20);
                    filtros.push(`boxblur=${intensidade}:${intensidade}`);
                    descricaoFinal.push(`Desfocar ${intensidade}`);
                    continue;
                }

                // 🔥 BRILHO
                const brilhoMatch = cmdLower.match(/brilho\s*([\d.-]+)/);
                if (brilhoMatch) {
                    const brilho = parseFloat(brilhoMatch[1]);
                    if (brilho >= -1 && brilho <= 1) {
                        filtros.push(`brightness=${brilho}`);
                        descricaoFinal.push(`Brilho ${brilho}`);
                    }
                    continue;
                }

                // 🔥 CONTRASTE
                const contrasteMatch = cmdLower.match(/contraste\s*([\d.-]+)/);
                if (contrasteMatch) {
                    const contraste = parseFloat(contrasteMatch[1]);
                    if (contraste >= 0 && contraste <= 3) {
                        filtros.push(`contrast=${contraste}`);
                        descricaoFinal.push(`Contraste ${contraste}`);
                    }
                    continue;
                }

                // 🔥 BORDA PRETA
                const bordaMatch = cmdLower.match(/borda\s*(\d+)/);
                if (bordaMatch) {
                    const esp = Math.min(parseInt(bordaMatch[1]), 20);
                    filtros.push(`drawbox=color=black:thickness=${esp}`);
                    descricaoFinal.push(`Borda ${esp}px`);
                    continue;
                }

                // 🔥 BORDA BRANCA
                const bordaBrancaMatch = cmdLower.match(/bordabranca\s*(\d+)/);
                if (bordaBrancaMatch) {
                    const esp = Math.min(parseInt(bordaBrancaMatch[1]), 20);
                    filtros.push(`drawbox=color=white:thickness=${esp}`);
                    descricaoFinal.push(`Borda Branca ${esp}px`);
                    continue;
                }

                // 🔥 BORDA VERMELHA
                const bordaVermelhaMatch = cmdLower.match(/bordavermelha\s*(\d+)/);
                if (bordaVermelhaMatch) {
                    const esp = Math.min(parseInt(bordaVermelhaMatch[1]), 20);
                    filtros.push(`drawbox=color=red:thickness=${esp}`);
                    descricaoFinal.push(`Borda Vermelha ${esp}px`);
                    continue;
                }

                // 🔥 BORDA AZUL
                const bordaAzulMatch = cmdLower.match(/bordaazul\s*(\d+)/);
                if (bordaAzulMatch) {
                    const esp = Math.min(parseInt(bordaAzulMatch[1]), 20);
                    filtros.push(`drawbox=color=blue:thickness=${esp}`);
                    descricaoFinal.push(`Borda Azul ${esp}px`);
                    continue;
                }

                // 🔥 BORDA VERDE
                const bordaVerdeMatch = cmdLower.match(/bordaverde\s*(\d+)/);
                if (bordaVerdeMatch) {
                    const esp = Math.min(parseInt(bordaVerdeMatch[1]), 20);
                    filtros.push(`drawbox=color=green:thickness=${esp}`);
                    descricaoFinal.push(`Borda Verde ${esp}px`);
                    continue;
                }

                // 🔥 BORDA DOURADA
                if (cmdLower === 'bordadourada' || cmdLower === 'borda dourada') {
                    filtros.push(`drawbox=color=gold:thickness=5`);
                    descricaoFinal.push('Borda Dourada');
                    continue;
                }
            }

            // 🔥 SE NÃO TIVER NENHUM FILTRO, ESCALA PADRÃO
            if (filtros.length === 0) {
                filtros.push('scale=512:512:flags=lanczos');
                descricaoFinal.push('512x512');
            }

            // 🔥 MONTA E EXECUTA FFMPEG
            const filtroCompleto = filtros.join(',');
            const cmd = `ffmpeg -y -i "${inputPath}" -vf "${filtroCompleto}" -frames:v 1 "${outputPath}" 2>/dev/null`;

            console.log('📝 FFmpeg:', cmd);

            await new Promise((resolve, reject) => {
                exec(cmd, { maxBuffer: 1024 * 1024 * 50 }, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // 🔥 VERIFICA SE A IMAGEM FOI GERADA
            if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size < 100) {
                throw new Error("Imagem não foi gerada corretamente");
            }

            const imageBuffer = fs.readFileSync(outputPath);

            // 🔥 LIMPA ARQUIVOS TEMPORÁRIOS
            try {
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            } catch (e) {}

            // 🔥 ENVIA A IMAGEM EDITADA
            await sock.sendMessage(remoteJid, {
                image: imageBuffer,
                caption: `✅ Imagem editada!\n📐 ${descricaoFinal.join(' | ') || 'Original'}`
            });

        } catch (err) {
            console.log("❌ ERRO imgeditar:", err);
            
            let erroMsg = "❌ Erro ao editar imagem.";
            if (err.message?.includes('ffmpeg')) {
                erroMsg = "❌ Erro no FFmpeg.\n\nVerifique se o FFmpeg está instalado:\npkg install ffmpeg";
            } else if (err.message) {
                erroMsg += `\n\n${err.message.substring(0, 100)}`;
            }

            await sock.sendMessage(remoteJid, {
                text: erroMsg
            });
        }
    }
};
