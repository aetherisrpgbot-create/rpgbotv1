// comandos/teste_python.js
const { exec } = require('child_process');
const path = require('path');

module.exports = {
    nome: "testepython",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const pergunta = args.join(" ") || "teste";
            const scriptPath = path.join(__dirname, '../testar_python.py');
            
            await sock.sendMessage(remoteJid, {
                text: `🐍 *Testando Python...*\n⏳ Aguarde...`
            });

            const start = Date.now();
            
            const cmd = `python3 "${scriptPath}" "${pergunta.replace(/"/g, '\\"')}"`;
            
            const result = await new Promise((resolve, reject) => {
                exec(cmd, { maxBuffer: 1024 * 1024 }, (err, stdout) => {
                    if (err) reject(err);
                    else {
                        try {
                            const data = JSON.parse(stdout);
                            resolve(data);
                        } catch (e) {
                            reject(new Error(`Erro ao parsear JSON: ${stdout}`));
                        }
                    }
                });
            });

            const totalTime = Date.now() - start;

            let resposta = `┏━━━━━━━━━━━━━━━━━━━━━┓\n`;
            resposta += `┃   🐍 *PYTHON TESTE*        \n`;
            resposta += `┗━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            resposta += `📝 *Pergunta:* ${pergunta}\n`;
            resposta += `💬 *Resposta:* ${result.resposta}\n\n`;
            resposta += `┌─────────────────────\n`;
            resposta += `│ ⏱️ Script: ${result.tempo_ms}ms\n`;
            resposta += `│ ⏱️ Total: ${totalTime}ms\n`;
            resposta += `│ 🆔 PID: ${result.pid}\n`;
            resposta += `└─────────────────────`;

            await sock.sendMessage(remoteJid, { text: resposta });

        } catch (err) {
            console.log("❌ ERRO testepython:", err);
            
            let erroMsg = "❌ Erro ao executar Python.";
            if (err.message.includes('python3')) {
                erroMsg = "❌ Python3 não encontrado!\n\nInstale com:\n`pkg install python`";
            } else {
                erroMsg += `\n\n${err.message.substring(0, 100)}`;
            }
            
            await sock.sendMessage(remoteJid, { text: erroMsg });
        }
    }
};
