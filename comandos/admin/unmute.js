// !unmute - Desmuta um usuário no grupo
const { isAdmin } = require("../../utils/permissoes");
const { lerMutados, escreverMutados } = require("../../servicos/banco");

module.exports = {
    nome: "unmute",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup) => {
        // ===== VERIFICA SE É GRUPO =====
        if (!isGroup) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Este comando é apenas para GRUPOS."
            });
        }

        // ===== VERIFICA SE QUEM CHAMOU É ADMIN =====
        if (!(await isAdmin(sock, remoteJid, remetenteId))) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Apenas ADMINISTRADORES podem usar este comando."
            });
        }

        // ===== PEGA O ALVO =====
        let alvo = null;

        // Tenta pegar da mensagem respondida
        if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
            alvo = msg.message.extendedTextMessage.contextInfo.participant;
        }
        // Tenta pegar de menção
        else if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
            alvo = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }
        // Tenta pegar de @numero
        else if (args[0]?.startsWith('@')) {
            const numero = args[0].replace('@', '').replace(/[^0-9]/g, '');
            alvo = numero + '@s.whatsapp.net';
        }
        // Tenta pegar de número direto
        else if (args[0] && args[0].match(/^[0-9]+$/)) {
            alvo = args[0] + '@s.whatsapp.net';
        }

        if (!alvo) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Marque ou responda a mensagem do usuário que deseja desmutar.\n\nExemplo: !unmute @usuario"
            });
        }

        // ===== VERIFICA SE ESTÁ MUTADO =====
        const mutados = lerMutados();
        if (!mutados[alvo]) {
            return sock.sendMessage(remoteJid, {
                text: `❌ @${alvo.split('@')[0]} NÃO está mutado.`,
                mentions: [alvo]
            });
        }

        // ===== REMOVE O MUTE =====
        delete mutados[alvo];
        escreverMutados(mutados);

        await sock.sendMessage(remoteJid, {
            text: `🔊 @${alvo.split('@')[0]} foi DESMUTADO com sucesso!\n\n✅ Agora pode enviar mensagens novamente.`,
            mentions: [alvo]
        });
    }
};
