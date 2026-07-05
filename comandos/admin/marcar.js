// !marcar - Responde a mensagem puxada marcando todos (menções invisíveis)
module.exports = {
    nome: "marcar",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup) => {
        if (!isGroup) {
            return sock.sendMessage(remoteJid, {
                text: `❌ Este comando só funciona em grupos.`
            });
        }

        // ═══ VERIFICA SE PUXOU UMA MENSAGEM ═══
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        if (!contextInfo?.quotedMessage) {
            return sock.sendMessage(remoteJid, {
                text: `┏━━━━━━━━━━━━━━━━━━━━━┓\n` +
                      `┃   📢 *COMO USAR*                 \n` +
                      `┗━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                      `Responda (puxe) uma mensagem\n` +
                      `com *!marcar* para notificar\n` +
                      `todos os membros do grupo.`
            });
        }

        try {
            // ═══ OBTÉM PARTICIPANTES ═══
            const metadata = await sock.groupMetadata(remoteJid);
            const participantes = metadata.participants.map(p => p.id);
            const total = participantes.length;
            const autor = msg.pushName || "Alguém";

            // ═══ RESPONDE A MENSAGEM PUXADA COM MENÇÕES INVISÍVEIS ═══
            await sock.sendMessage(remoteJid, {
                text: `📢 *${autor}* marcou todos! (${total} membros)`,
                mentions: participantes,
                quoted: msg
            });

        } catch (err) {
            console.error("❌ Erro no marcar:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao marcar membros. Tente novamente.`
            });
        }
    }
};
