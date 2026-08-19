// comandos/ia/aprender.js - ENSINA A IA
const { exec } = require('child_process');
const path = require('path');

module.exports = {
    nome: "aprender",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const texto = args.join(" ").trim();
            if (!texto) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Use: !aprender pergunta | resposta\n\n📌 *Exemplo:*\n!aprender quem é o melhor | Você é o melhor!`
                });
            }

            const [pergunta, resposta] = texto.split('|').map(s => s.trim());
            if (!pergunta || !resposta) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Formato inválido!\n\nUse: !aprender pergunta | resposta`
                });
            }

            const scriptPath = path.join(__dirname, '../../ia_brain.py');
            const cmd = `python3 "${scriptPath}" aprender "${pergunta.replace(/"/g, '\\"')}" "${resposta.replace(/"/g, '\\"')}"`;

            await new Promise((resolve, reject) => {
                exec(cmd, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            await sock.sendMessage(remoteJid, {
                text: `✅ *IA aprendeu!*\n\n📝 *Pergunta:* ${pergunta}\n💬 *Resposta:* ${resposta}`
            });

        } catch (err) {
            console.log("❌ ERRO aprender:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro: ${err.message?.substring(0, 100)}`
            });
        }
    }
};
