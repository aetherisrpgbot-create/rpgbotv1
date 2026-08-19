// !perfilavancado - MOSTRA PERFIL AVANÇADO DO JOGADOR
const { getPerfilAvancado } = require("../../servicos/database");

module.exports = {
    nome: "perfilavancado",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const perfil = getPerfilAvancado(remetenteId);
        if (!perfil) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Você ainda não tem um perfil avançado.\nUse comandos para começar!"
            });
        }

        const nome = msg.pushName || "Aventureiro";
        const totalComandos = perfil.totalComandos || 0;
        const conquistas = perfil.conquistas || [];
        const primeiroAcesso = perfil.primeiroAcesso ? new Date(perfil.primeiroAcesso).toLocaleString() : "N/A";
        const ultimoAcesso = perfil.ultimoAcesso ? new Date(perfil.ultimoAcesso).toLocaleString() : "N/A";

        let texto = `📊 *PERFIL AVANÇADO*\n\n`;
        texto += `👤 ${nome}\n`;
        texto += `📌 Total de comandos: *${totalComandos}*\n`;
        texto += `📅 Primeiro acesso: ${primeiroAcesso}\n`;
        texto += `🕐 Último acesso: ${ultimoAcesso}\n\n`;

        if (conquistas.length > 0) {
            texto += `🏆 *CONQUISTAS* (${conquistas.length})\n`;
            const { CONQUISTAS } = require("../../servicos/database");
            for (const id of conquistas) {
                const c = CONQUISTAS[id];
                if (c) {
                    texto += `   ${c.nome} - ${c.descricao}\n`;
                }
            }
        } else {
            texto += `🏆 *CONQUISTAS:* Nenhuma ainda\n`;
            texto += `💡 Continue jogando para desbloquear!`;
        }

        await sock.sendMessage(remoteJid, { text: texto });
    }
};
