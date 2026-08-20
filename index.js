// ============================================================
// BOT RPG - INDEX PRINCIPAL (PAIRING CODE COM DELAY)
// ============================================================
const baileys = require("@whiskeysockets/baileys");
const makeWASocket = baileys.default;
const { useMultiFileAuthState, DisconnectReason } = baileys;
const pino = require("pino");
const fs = require("fs");
const path = require("path");

const comandos = require("./comandos/index.js");
const { getTexto } = require("./utils/helpers.js");
const { setupAutomatico } = require("./handlers/automatico.js");
const { isAutorizado } = require("./config/auth.js");
const { logComando, atualizarEstatisticas, atualizarPerfilAvancado } = require("./servicos/database");

const PASTA_AUTH = './auth_info';
const PREFIXO = '!';

// 🔥 SEU NÚMERO (FIXO)
const NUMERO_BOT = process.env.PHONE_NUMBER || "558195892386";

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
            console.log('📱 QR Code gerado (use o código de pareamento)');
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

    // 🔥 PAIRING CODE COM DELAY
    if (!fs.existsSync(path.join(PASTA_AUTH, 'creds.json'))) {
        console.log('📱 Gerando código de pareamento...');
        console.log(`📱 Número: ${NUMERO_BOT}`);
        console.log('📌 Abra o WhatsApp → Configurações → Dispositivos vinculados → Vincular com código');
        
        try {
            console.log('⏳ Aguardando 5 segundos...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            const codigo = await sock.requestPairingCode(NUMERO_BOT);
            console.log(`🔑 CÓDIGO DE PAREAMENTO: ${codigo}`);
            console.log(`📱 Digite este código no WhatsApp!`);
        } catch (err) {
            console.log('❌ Erro ao gerar código:', err.message);
            console.log('📱 Tentando novamente em 10 segundos...');
            
            setTimeout(async () => {
                try {
                    const codigo = await sock.requestPairingCode(NUMERO_BOT);
                    console.log(`🔑 CÓDIGO DE PAREAMENTO: ${codigo}`);
                } catch (err2) {
                    console.log('❌ Erro novamente:', err2.message);
                    console.log('📱 Use o QR Code (escaneie com outro celular)');
                }
            }, 10000);
        }
    }

    // ============================================================
    // 📨 EVENTO DE MENSAGEM
    // ============================================================
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg?.message || msg.key?.fromMe) return;

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

        if (!isAutorizado(remetenteId, remoteJid)) {
            return;
        }

        if (isGroup) {
            try {
                const { handleAntiViewOnce } = require("./handlers/anti_viewonce");
                await handleAntiViewOnce(sock, msg, remoteJid);
            } catch (err) {
                console.log("⚠️ Erro no anti-viewonce:", err.message);
            }
        }

        if (texto.startsWith(PREFIXO)) {
            const partes = texto.slice(1).trim().split(/\s+/);
            const cmdNome = partes[0].toLowerCase();
            const args = partes.slice(1);

            console.log(`👉 Comando: ${cmdNome}`);

            logComando(remetenteId, cmdNome, args, remoteJid);
            atualizarEstatisticas(cmdNome, remetenteId);
            atualizarPerfilAvancado(remetenteId);

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
