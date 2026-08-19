// ============================================================
// HANDLER DE FUNÇÕES AUTOMÁTICAS
// ============================================================
const fs = require("fs");
const { getTexto } = require("../utils/helpers");
const { getBotId, isAdmin, isBotAdmin } = require("../utils/permissoes");
const { apagarFotoNormal } = require("../servicos/anti_viewonce");

// ============================================================
// DETECTAR MENSAGEM FANTASMA (INVISÍVEL)
// ============================================================
const CARACTERES_INVISIVEIS = [
    '\u200B', '\u200C', '\u200D', '\uFEFF', '\u2060',
    '\u2061', '\u2062', '\u2063', '\u2064', '\u200E',
    '\u200F', '\u202A', '\u202B', '\u202C', '\u202D',
    '\u202E', '\u2066', '\u2067', '\u2068', '\u2069'
];

function removerCaracteresInvisiveis(texto) {
    if (!texto) return texto;
    for (const char of CARACTERES_INVISIVEIS) {
        texto = texto.replace(new RegExp(char, 'g'), '');
    }
    return texto.trim();
}

function mensagemFantasma(texto) {
    if (!texto) return false;
    const limpo = removerCaracteresInvisiveis(texto);
    return limpo.length === 0 && texto.length > 0;
}

// ============================================================
// FECHAR GRUPO
// ============================================================
async function fecharGrupo(sock, groupId, motivo = "Mensagem fantasma detectada") {
    try {
        await sock.groupSettingUpdate(groupId, 'announcement');
        await sock.groupSettingUpdate(groupId, 'locked');
        
        const metadata = await sock.groupMetadata(groupId);
        await sock.sendMessage(groupId, {
            text: `🔒 *GRUPO FECHADO!* 🔒\n\n` +
                  `📋 ${metadata.subject}\n` +
                  `📌 Motivo: ${motivo}\n\n` +
                  `🛡️ Apenas administradores podem enviar mensagens.\n` +
                  `👑 Aguarde um admin resolver a situação.`
        });
        
        console.log(`🔒 Grupo ${groupId} fechado. Motivo: ${motivo}`);
        return true;
    } catch (err) {
        console.log("❌ Erro ao fechar grupo:", err);
        return false;
    }
}

// ============================================================
// PROCESSAR MENSAGEM
// ============================================================
async function processarMensagem(sock, msg, remetenteId, remoteJid, isGroup) {
    const texto = getTexto(msg);

// ===== ANTI-VIEWONCE =====
if (isGroup) {
    const apagou = await apagarFotoNormal(sock, msg, remoteJid, remetenteId);
    if (apagou) {
        await sock.sendMessage(remoteJid, {
            text: `📷 *FOTO APAGADA!*\n\n🚫 Este grupo está com proteção anti-viewonce ativada.\n📌 Use visualização única para enviar fotos aqui.`
        });
        return;
    }
}

// ===== 1. MUTE (SÓ APAGA A MENSAGEM, NÃO EXPULSA) =====
if (isGroup) {
    try {
        const { lerMutados } = require("../servicos/banco");
        const mutados = lerMutados();
        const numeroAtual = remetenteId.split("@")[0].split(":")[0];
        const mutado = Object.keys(mutados).find(id => {
            const numeroSalvo = id.split("@")[0].split(":")[0];
            return numeroSalvo === numeroAtual;
        });
        if (mutado) {
            // ===== APAGA A MENSAGEM =====
            try {
                await sock.sendMessage(remoteJid, {
                    delete: msg.key
                });
                console.log(`🗑️ Mensagem de usuário mutado apagada: ${numeroAtual}`);
            } catch (err) {
                console.log("❌ Erro ao apagar mensagem:", err.message);
            }
            return true; // Impede que a mensagem seja processada
        }
    } catch (err) {
        console.log("ERRO mute:", err);
    }
}

// ===== 1.5 MENSAGEM FANTASMA =====
if (isGroup) {
    try {
        const texto = getTexto(msg);
        
        // Verifica se é mensagem fantasma
        if (!texto || !mensagemFantasma(texto)) return false;

        // Verifica se quem mandou é admin
        const ehAdmin = await isAdmin(sock, remoteJid, remetenteId);
        if (ehAdmin) {
            console.log('👑 Admin enviou mensagem fantasma. Ignorando.');
            return false;
        }

        const nome = remetenteId.split('@')[0];

        // ===== TENTA APAGAR A MENSAGEM =====
        try {
            if (msg.key) {
                await sock.sendMessage(remoteJid, {
                    delete: {
                        remoteJid: remoteJid,
                        fromMe: false,
                        id: msg.key.id,
                        participant: remetenteId
                    }
                });
                console.log(`🗑️ Mensagem fantasma apagada de @${nome}`);
            }
        } catch (err) {
            console.log("⚠️ Não foi possível apagar a mensagem fantasma:", err.message);
        }

        // ===== TENTA REMOVER O USUÁRIO =====
        try {
            await sock.groupParticipantsUpdate(remoteJid, [remetenteId], "remove");
            
            // ===== TENTA FECHAR O GRUPO =====
            try {
                await fecharGrupo(sock, remoteJid, `Mensagem fantasma de @${nome}`);
            } catch (err) {
                console.log("⚠️ Não foi possível fechar o grupo:", err.message);
            }

            await sock.sendMessage(remoteJid, {
                text: `🚨 *MENSAGEM FANTASMA DETECTADA!* 🚨\n\n` +
                      `👤 @${nome}\n\n` +
                      `❌ Tentou enviar uma mensagem invisível!\n` +
                      `🗑️ Mensagem apagada!\n` +
                      `🚪 Usuário removido!\n` +
                      `🛡️ Grupo FECHADO automaticamente!`,
                mentions: [remetenteId]
            });

        } catch (err) {
            console.log("ERRO mensagem fantasma:", err);
            await sock.sendMessage(remoteJid, {
                text: `⚠️ *MENSAGEM FANTASMA DETECTADA!* ⚠️\n\n` +
                      `👤 @${nome}\n\n` +
                      `❌ Tentou enviar uma mensagem invisível!\n` +
                      `🗑️ Mensagem apagada!\n` +
                      `❌ Mas NÃO CONSEGUI REMOVER O USUÁRIO!\n\n` +
                      `🛡️ Verifique se sou administrador do grupo.`,
                mentions: [remetenteId]
            });
        }

        return true;

    } catch (err) {
        console.log("ERRO mensagem fantasma:", err);
    }
}

// ===== 2. ANTI-LINK 2.0 (COMPLETO) =====
if (isGroup) {
    try {
        // ===== ADMIN NUNCA É PUNIDO =====
        if (await isAdmin(sock, remoteJid, remetenteId)) {
            return false;
        }

        // ===== EXTRAI TEXTO DE TODO TIPO DE MENSAGEM =====
        let textoCompleto = "";

        // Mensagem normal
        if (msg.message?.conversation) {
            textoCompleto += msg.message.conversation;
        }

        // Texto com formatação
        if (msg.message?.extendedTextMessage?.text) {
            textoCompleto += msg.message.extendedTextMessage.text;
        }

        // Legenda de imagem
        if (msg.message?.imageMessage?.caption) {
            textoCompleto += msg.message.imageMessage.caption;
        }

        // Legenda de vídeo
        if (msg.message?.videoMessage?.caption) {
            textoCompleto += msg.message.videoMessage.caption;
        }

        // Legenda de documento
        if (msg.message?.documentMessage?.caption) {
            textoCompleto += msg.message.documentMessage.caption;
        }

        // Mensagem com botão
        if (msg.message?.buttonsResponseMessage?.selectedDisplayText) {
            textoCompleto += msg.message.buttonsResponseMessage.selectedDisplayText;
        }

        // Mensagem de lista
        if (msg.message?.listResponseMessage?.selectedDisplayText) {
            textoCompleto += msg.message.listResponseMessage.selectedDisplayText;
        }

        // Nome de contato
        if (msg.message?.contactMessage?.displayName) {
            textoCompleto += msg.message.contactMessage.displayName;
        }

        // VCard
        if (msg.message?.contactMessage?.vcard) {
            textoCompleto += msg.message.contactMessage.vcard;
        }

        // Localização
        if (msg.message?.locationMessage?.name) {
            textoCompleto += msg.message.locationMessage.name;
        }

        if (msg.message?.locationMessage?.address) {
            textoCompleto += msg.message.locationMessage.address;
        }

        // Reação com texto
        if (msg.message?.reactionMessage?.text) {
            textoCompleto += msg.message.reactionMessage.text;
        }

        // Protocolo
        if (msg.message?.protocolMessage?.message?.conversation) {
            textoCompleto += msg.message.protocolMessage.message.conversation;
        }

        // Mensagem de áudio com legenda
        if (msg.message?.audioMessage?.caption) {
            textoCompleto += msg.message.audioMessage.caption;
        }

        // Mensagem de visualização única
        if (msg.message?.viewOnceMessage?.message?.conversation) {
            textoCompleto += msg.message.viewOnceMessage.message.conversation;
        }
        if (msg.message?.viewOnceMessage?.message?.extendedTextMessage?.text) {
            textoCompleto += msg.message.viewOnceMessage.message.extendedTextMessage.text;
        }

        // Mensagem de imagem com legenda (view once)
        if (msg.message?.viewOnceMessage?.message?.imageMessage?.caption) {
            textoCompleto += msg.message.viewOnceMessage.message.imageMessage.caption;
        }
        if (msg.message?.viewOnceMessage?.message?.videoMessage?.caption) {
            textoCompleto += msg.message.viewOnceMessage.message.videoMessage.caption;
        }

        if (!textoCompleto || textoCompleto.length < 2) return false;

        // ===== LIMPA O TEXTO =====
        const textoLimpo = textoCompleto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .trim();

        // ===== PADRÕES DE LINK (TODOS OS POSSÍVEIS) =====
        const padroes = [
            // URLs
            /https?:\/\/[^\s]+/i,
            /www\.[a-zA-Z0-9\-]+\.[a-z]{2,}/i,
            /[a-zA-Z0-9\-]+\.[a-z]{2,}\/[^\s]*/i,
            
            // WhatsApp
            /chat\.whatsapp\.com/i,
            /wa\.me\//i,
            /whatsapp\.com\/channel\//i,
            /whatsapp\.com\/c\//i,
            
            // Telegram
            /t\.me\//i,
            /telegram\.(org|com)\//i,
            
            // Discord
            /discord\.(gg|com)\//i,
            /discordapp\.com\//i,
            
            // Redes sociais
            /instagram\.com\//i,
            /facebook\.com\//i,
            /fb\.com\//i,
            /twitter\.com\//i,
            /x\.com\//i,
            /youtube\.com\//i,
            /youtu\.be\//i,
            /tiktok\.com\//i,
            /kwai\.com\//i,
            /linkedin\.com\//i,
            /pinterest\.com\//i,
            /snapchat\.com\//i,
            
            // Encurtadores
            /bit\.ly\//i,
            /tinyurl\.com\//i,
            /cutt\.ly\//i,
            /rebrandly\.com\//i,
            /goo\.gl\//i,
            /qrco\.de\//i,
            /linktr\.ee\//i,
            /shorturl\.at\//i,
            /ow\.ly\//i,
            /is\.gd\//i,
            /buff\.ly\//i,
            /short\.link\//i,
            /shorte\.st\//i,
            /v.gd\//i,
            /tiny\.cc\//i,
            /clck\.ru\//i,
            /u\.to\//i,
            
            // IP
            /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/i,
            
            // Links de arquivo
            /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|exe|apk|torrent|mp3|mp4|avi|mkv)[\s\/]?/i,
            
            // Links de imagem
            /\.(jpg|jpeg|png|gif|bmp|svg|webp)[\s\/]?/i,
            
            // Links de código
            /github\.com\/[a-zA-Z0-9\-]+\/[a-zA-Z0-9\-]+/i,
            /gitlab\.com\/[a-zA-Z0-9\-]+\/[a-zA-Z0-9\-]+/i,
            
            // Outros
            /docs\.google\.com\//i,
            /drive\.google\.com\//i,
            /dropbox\.com\//i,
            /onedrive\.live\.com\//i,
            /paypal\.me\//i,
            /pix\.[a-z]{2,}\//i,
            /mercadoenvios\.com\//i,
            /nubank\.com\.br\//i
        ];

        const temLink = padroes.some(p => p.test(textoLimpo));

        // ===== CONTEÚDO PROIBIDO (TODOS OS TIPOS) =====
        const conteudoProibido = temLink ||
            msg.message?.groupInviteMessage ||
            msg.message?.paymentInviteMessage ||
            msg.message?.orderMessage ||
            msg.message?.liveLocationMessage ||
            msg.message?.pollCreationMessage ||
            msg.message?.pollUpdateMessage ||
            msg.message?.reactionMessage?.text ||
            msg.message?.listMessage ||
            msg.message?.buttonsMessage ||
            msg.message?.templateMessage ||
            msg.message?.productMessage ||
            msg.message?.contactMessage ||
            msg.message?.locationMessage;

        if (conteudoProibido) {
            const nome = remetenteId.split('@')[0];

            // ===== TENTA APAGAR =====
            try {
                if (msg.key) {
                    await sock.sendMessage(remoteJid, {
                        delete: {
                            remoteJid: remoteJid,
                            fromMe: false,
                            id: msg.key.id,
                            participant: remetenteId
                        }
                    });
                    console.log(`🗑️ Mensagem apagada de @${nome}`);
                }
            } catch (err) {
                console.log("⚠️ Erro ao apagar:", err.message);
            }

            // ===== TENTA REMOVER =====
            try {
                await sock.groupParticipantsUpdate(remoteJid, [remetenteId], "remove");

                await sock.sendMessage(remoteJid, {
                    text: `🚨 *ANTI-LINK 2.0* 🚨\n\n` +
                          `👤 @${nome}\n\n` +
                          `❌ Link ou conteúdo proibido detectado!\n` +
                          `🗑️ Mensagem apagada!\n` +
                          `🚪 Usuário removido!\n\n` +
                          `📌 Motivo: ${temLink ? 'Link suspeito' : 'Conteúdo proibido'}`,
                    mentions: [remetenteId]
                });

            } catch (err) {
                console.log("ERRO anti-link:", err);
                await sock.sendMessage(remoteJid, {
                    text: `⚠️ *ANTI-LINK 2.0* ⚠️\n\n` +
                          `👤 @${nome}\n\n` +
                          `❌ Link detectado, mas NÃO CONSEGUI REMOVER!\n` +
                          `🗑️ Mensagem apagada!\n\n` +
                          `🛡️ Verifique se sou administrador do grupo.`,
                    mentions: [remetenteId]
                });
            }

            return true;
        }

    } catch (err) {
        console.log("ERRO anti-link:", err);
    }
}


    // ===== 4. XP POR MENSAGEM =====
    if (!msg.key.fromMe && texto && !texto.startsWith("!")) {
        try {
            const { getJogador, adicionarXP } = require("../servicos/jogador");
            const { lerJogadores, escreverJogadores } = require("../servicos/banco");
            const jogador = getJogador(remetenteId, msg.pushName || "Usuário");
            const agora = Date.now();
            if (texto.trim().length >= 5 && (agora - (jogador.ultimoXP || 0)) >= 30000) {
                const xpGanho = Math.floor(Math.random() * 3) + 3;
                const nivelAntes = jogador.nivel || 1;
                const result = adicionarXP(remetenteId, jogador.nome, xpGanho);
                jogador.ultimoXP = agora;
                const dados = lerJogadores();
                dados[remetenteId] = jogador;
                escreverJogadores(dados);
                if (result.subiu && result.nivel > nivelAntes) {
                    await sock.sendMessage(remoteJid, {
                        text: `🎉 Parabéns, ${jogador.nome}!\n⬆️ Você subiu para o nível ${result.nivel}!`
                    });
                }
            }
        } catch (err) {
            console.log("ERRO XP:", err);
        }
    }

    return false;
}

// ============================================================
// BOAS-VINDAS
// ============================================================
async function processarEntrada(sock, update) {
    try {
        const { id: groupId, participants, action } = update;

        if (action !== "add") return;

        const botId = getBotId(sock);
        const metadata = await sock.groupMetadata(groupId);
        const groupName = metadata.subject;

        for (const p of participants) {
            // 🔥 PEGA O ID CORRETO (pode ser string ou objeto)
            let user = p;
            if (typeof p === 'object' && p.id) {
                user = p.id;
            }

            if (user === botId) continue;

            // 🔥 SÓ AGORA FAZ O SPLIT
            const nome = user.split('@')[0];
            const imagemPath = "./imagensbot/bemvindobotrpg.png";

		const mensagem = `⚔️━━━━━━━━━━━━━━━━⚔️
      DESPERTAR NO REINO
⚔️━━━━━━━━━━━━━━━━⚔️

📯 Atenção, aventureiros!

Um novo herói atravessou os portões do reino.

👤 @${nome}
🏰 ${groupName}

━━━━━━━━━━━━━━━━━━

📜 REGISTRO DO AVENTUREIRO

📸 Foto
📝 Nome
🎂 Idade
📍 Origem

━━━━━━━━━━━━━━━━━━

🛡️ COMANDOS INICIAIS

⚔️ !classe
📖 !menu

━━━━━━━━━━━━━━━━━━

🌟 O destino aguarda.
🔥 Forje sua lenda neste reino!`;


            try {
                if (fs.existsSync(imagemPath)) {
                    await sock.sendMessage(groupId, {
                        image: fs.readFileSync(imagemPath),
                        caption: mensagem,
                        mentions: [user]
                    });
                } else {
                    await sock.sendMessage(groupId, {
                        text: mensagem,
                        mentions: [user]
                    });
                }
                console.log(`✅ Boas-vindas enviadas para @${nome}`);
            } catch (err) {
                console.log(`❌ Erro ao enviar boas-vindas:`, err);
            }
        }
    } catch (err) {
        console.log("ERRO boas-vindas:", err);
    }
}


// ============================================================
// SETUP
// ============================================================
function setupAutomatico(sock) {

    // ===== APROVAÇÃO AUTOMÁTICA DE SOLICITAÇÕES =====
    sock.ev.on("group.join-request", async (update) => {
        try {
            console.log("📥 NOVA SOLICITAÇÃO:", JSON.stringify(update, null, 2));
            const groupId = update.id;
            const participante = update.participant;
            if (!groupId || !participante) {
                console.log("❌ Dados inválidos:", update);
                return;
            }
            await sock.groupRequestParticipantsUpdate(groupId, [participante], "approve");
            console.log(`✅ ${participante} aprovado automaticamente`);
        } catch (err) {
            console.log("❌ ERRO autoaprovação:", err);
        }
    });

    // ===== MENSAGENS =====
    sock.ev.on("messages.upsert", async ({ messages }) => {
        for (const msg of messages) {
            if (!msg?.message || msg.key?.fromMe) continue;
            const remoteJid = msg.key.remoteJid;
            const remetenteId = msg.key.participant || remoteJid;
            const isGroup = remoteJid?.endsWith("@g.us");
            await processarMensagem(sock, msg, remetenteId, remoteJid, isGroup);
        }
    });

    // ===== ENTRADA / SAÍDA DE MEMBROS =====
    sock.ev.on("group-participants.update", async (update) => {
        await processarEntrada(sock, update);
    });

    console.log("✅ Funções automáticas ativadas!");
}

// ============================================================
// EXPORTAÇÕES
// ============================================================
module.exports = {
    setupAutomatico,
    processarMensagem
};
