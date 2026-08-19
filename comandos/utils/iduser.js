// !iduser - MOSTRA O ID DO USUÁRIO (LID OU NÚMERO)
module.exports = {
    nome: "iduser",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup) => {
        // ===== PEGA O ALVO =====
        let alvoId = remetenteId;
        let nomeAlvo = msg.pushName || "Você";

        // ===== SE TIVER MENÇÃO, PEGA O ID DO MENCIONADO =====
        const mencionado = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (mencionado) {
            alvoId = mencionado;
            // Tenta pegar o nome do mencionado
            if (isGroup) {
                try {
                    const groupMeta = await sock.groupMetadata(remoteJid);
                    const participante = groupMeta.participants.find(p => p.id === mencionado);
                    if (participante) {
                        // Pega o nome do pushName se disponível
                        const pushName = participante.notify || participante.id.split('@')[0];
                        nomeAlvo = pushName;
                    }
                } catch (e) {
                    nomeAlvo = "Usuário";
                }
            }
        }

        // ===== IDENTIFICA O TIPO DO ID =====
        let tipo = "Número WhatsApp";
        if (alvoId.includes('@lid')) {
            tipo = "🔗 Linked Device ID (LID)";
        } else if (alvoId.includes('@g.us')) {
            tipo = "📋 Grupo ID";
        } else if (alvoId.includes('@s.whatsapp.net')) {
            tipo = "📱 Número WhatsApp";
        }

        // ===== EXTRAI APENAS O NÚMERO =====
        const numero = alvoId.split('@')[0].split(':')[0];

        const texto = `╭━━━ 🆔 *ID DO USUÁRIO* ━━━╮\n\n` +
                      `👤 ${nomeAlvo}\n\n` +
                      `📌 *Tipo:* ${tipo}\n` +
                      `📌 *ID Completo:*\n` +
                      `\`${alvoId}\`\n\n` +
                      `📌 *Número:* ${numero}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━━━━\n` +
                      `📌 Para adicionar como ADMIN GLOBAL:\n` +
                      `   !addadmin ${numero}\n` +
                      `   !addadmin ${alvoId}\n\n` +
                      `📌 Para mencionar:\n` +
                      `   !addadmin @${numero}\n\n` +
                      `╰━━━━━━━━━━━━━━━━━━━━╯`;

        await sock.sendMessage(remoteJid, { text: texto });
    }
};
