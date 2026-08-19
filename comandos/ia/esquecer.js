// comandos/ia/esquecer.js - FAZ A IA ESQUECER (USANDO BETTER-SQLITE3)
const Database = require('better-sqlite3');
const path = require('path');

module.exports = {
    nome: "esquecer",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const pergunta = args.join(" ").trim();
            if (!pergunta) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Use: !esquecer <pergunta>\n\n📌 *Exemplo:*\n!esquecer quem é o melhor`
                });
            }

            const dbPath = path.join(__dirname, '../../database/ia_conhecimento.db');
            const db = new Database(dbPath);

            // 🔥 TENTA DELETAR A PERGUNTA
            const result = db.prepare('DELETE FROM ia_conhecimento WHERE pergunta = ?').run(pergunta.toLowerCase());

            db.close();

            if (result.changes === 0) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Não encontrei a pergunta: "${pergunta}"`
                });
            }

            await sock.sendMessage(remoteJid, {
                text: `🗑️ *IA esqueceu!*\n\n📝 *Pergunta:* ${pergunta}`
            });

        } catch (err) {
            console.log("❌ ERRO esquecer:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro: ${err.message?.substring(0, 100)}`
            });
        }
    }
};
