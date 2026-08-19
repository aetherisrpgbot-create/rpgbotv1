// ============================================================
// BOT RPG - INDEX PRINCIPAL
// ============================================================
const baileys = require("@whiskeysockets/baileys");
const makeWASocket = baileys.default;
const { useMultiFileAuthState, DisconnectReason } = baileys;
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const comandos = require("./comandos/index.js");
const { getTexto } = require("./utils/helpers.js");
const { setupAutomatico } = require("./handlers/automatico.js");
const { isAutorizado } = require("./config/auth.js");
const { logComando, atualizarEstatisticas, atualizarPerfilAvancado } = require("./servicos/database");

const PASTA_AUTH = './auth_info';
const PREFIXO = '!';

// ===== PREVENÇÃO DE MENSAGENS DUPLICADAS =====
const processedMessages = new Set();

async function startBot() {
    const logger = pino({ level: 'silent' });
    const { state, saveCreds } = await useMultiFileAuthState(PASTA_AUTH);

    const sock = makeWASocket({
        logger,
        auth: state,
        printQRInTerminal: false,
        browser: ['Linux', 'Chrome', '120.0.0']
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('📱 QR Code gerado!');
        }

        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode;
            console.log(`🔴 Desconectado. Código: ${code}`);
            if (code !== DisconnectReason.loggedOut) {
                console.log('🔄 Reconectando em 5 segundos...');
                setTimeout(startBot, 5000);
            } else {
                console.log('❌ Sessão expirada. Delete a pasta "auth_info" e reinicie.');
            }
        } else if (connection === 'open') {
            console.log('✅ BOT CONECTADO!');
            console.log('👑 Bot criado por Widnes Santos');
            console.log('📦 Sistema RPG carregado com sucesso!');
            setupAutomatico(sock);
        }
    });

    sock.ev.on('creds.update', saveCreds);

    if (!fs.existsSync(path.join(PASTA_AUTH, 'creds.json'))) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const pergunta = (texto) => new Promise(resolve => rl.question(texto, resolve));
        console.log('📱 Digite o número do WhatsApp (código do país + DDD + número):');
        console.log('📌 Exemplo: 5581999999999');
        const numero = await pergunta('Número: ');
        rl.close();
        const codigo = await sock.requestPairingCode(numero);
        console.log(`🔑 Código de pareamento: ${codigo}`);
        console.log('Digite esse código no WhatsApp → Configurações → Dispositivos vinculados → Vincular com código.');
    }

    // ============================================================
    // 📨 EVENTO DE MENSAGEM (APENAS UM!)
    // ============================================================
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg?.message || msg.key?.fromMe) return;

        // ===== PREVINE MENSAGENS DUPLICADAS =====
        const msgId = msg.key.id;
        if (processedMessages.has(msgId)) return;
        processedMessages.add(msgId);

        setTimeout(() => {
            processedMessages.delete(msgId);
        }, 5000);

        const remoteJid = msg.key.remoteJid;
        const remetenteId = msg.key.participant || remoteJid;
        const texto = getTexto(msg);
        const isGroup = remoteJid?.endsWith('@g.us');

        // ===== SISTEMA DE PROTEÇÃO =====
        if (!isAutorizado(remetenteId, remoteJid)) {
            return;
        }

        // ===== ANTI-VIEWONCE (SEMPRE RODA) =====
        if (isGroup) {
            try {
                const { handleAntiViewOnce } = require("./handlers/anti_viewonce");
                await handleAntiViewOnce(sock, msg, remoteJid);
            } catch (err) {
                console.log("⚠️ Erro no anti-viewonce:", err.message);
            }
        }

        // ===== PROCESSAMENTO DE COMANDOS =====
        if (texto.startsWith(PREFIXO)) {
            const partes = texto.slice(1).trim().split(/\s+/);
            const cmdNome = partes[0].toLowerCase();
            const args = partes.slice(1);

            console.log(`👉 Comando: ${cmdNome}`);

            // ============================================================
            // 🔥 LOGS E ESTATÍSTICAS (BANCO DE DADOS)
            // ============================================================
            logComando(remetenteId, cmdNome, args, remoteJid);
            atualizarEstatisticas(cmdNome, remetenteId);
            atualizarPerfilAvancado(remetenteId);

            // ============================================================
            // 🎯 EXECUTA O COMANDO
            // ============================================================
            const comando = comandos.get(cmdNome);
            if (comando) {
                try {
                    await comando(sock, msg, args, remetenteId, remoteJid, isGroup);
                } catch (err) {
                    console.error(`❌ Erro no comando ${cmdNome}:`, err);
                    await sock.sendMessage(remoteJid, {
                        text: '❌ Ocorreu um erro ao executar esse comando.'
                    });
                }
            } else {
                await sock.sendMessage(remoteJid, {
                    text: `❌ Comando *${cmdNome}* não encontrado.\nUse !menu para ver os comandos disponíveis.`
                });
            }
        }
    });
}

startBot().catch(console.error);
