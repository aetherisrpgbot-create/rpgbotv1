// !limpargrupo - Remove todos os membros do grupo (exceto admins e bot)
const { isAdmin, getBotId } = require("../../utils/permissoes");

module.exports = {
    nome: "limpargrupo",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup) => {
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

        // ===== CONFIRMAÇÃO =====
        if (args[0] !== "confirmar") {
            return sock.sendMessage(remoteJid, {
                text: `⚠️ *ATENÇÃO!*\n\n` +
                      `Este comando vai remover TODOS os membros do grupo (exceto administradores).\n\n` +
                      `📌 Para confirmar, digite:\n` +
                      `!limpargrupo confirmar\n\n` +
                      `⚠️ Esta ação é IRREVERSÍVEL!`
            });
        }

        try {
            // ===== PEGA A LISTA DE PARTICIPANTES =====
            const metadata = await sock.groupMetadata(remoteJid);
            const participantes = metadata.participants;
            const botId = getBotId(sock);

            // ===== FILTRA QUEM VAI SER REMOVIDO =====
            const paraRemover = participantes
                .filter(p => {
                    // NÃO REMOVE ADMINISTRADORES
                    if (p.admin === "admin" || p.admin === "superadmin") return false;
                    // NÃO REMOVE O BOT
                    if (p.id === botId) return false;
                    return true;
                })
                .map(p => p.id);

            if (paraRemover.length === 0) {
                return sock.sendMessage(remoteJid, {
                    text: "📋 Nenhum membro para remover (todos são administradores)."
                });
            }

            // ===== CONFIRMA NO GRUPO =====
            await sock.sendMessage(remoteJid, {
                text: `⏳ *Removendo ${paraRemover.length} membros...*\n\nAguarde um momento.`
            });

            // ===== REMOVE EM LOTE (10 POR VEZ) =====
            let removidos = 0;
            const tamanhoLote = 10;

            for (let i = 0; i < paraRemover.length; i += tamanhoLote) {
                const lote = paraRemover.slice(i, i + tamanhoLote);
                try {
                    await sock.groupParticipantsUpdate(remoteJid, lote, "remove");
                    removidos += lote.length;
                    console.log(`✅ Removidos ${removidos}/${paraRemover.length} membros`);
                } catch (err) {
                    console.log(`❌ Erro ao remover lote:`, err);
                }
                // Pequena pausa pra não sobrecarregar
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // ===== MENSAGEM FINAL =====
            await sock.sendMessage(remoteJid, {
                text: `🧹 *GRUPO LIMPO!*\n\n` +
                      `✅ ${removidos} membros removidos com sucesso.\n` +
                      `👑 Administradores mantidos.\n` +
                      `🤖 Bot mantido.`
            });

        } catch (err) {
            console.log("ERRO limpargrupo:", err);
            await sock.sendMessage(remoteJid, {
                text: "❌ Erro ao limpar o grupo. Verifique se o bot é administrador."
            });
        }
    }
};
