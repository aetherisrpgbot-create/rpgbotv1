// servicos/iaPython.js
const { exec } = require('child_process');
const path = require('path');

const SCRIPT_PATH = path.join(__dirname, '../ia_brain.py');

function chamarIA(mensagem, usuarioId) {
    return new Promise((resolve, reject) => {
        // 🔥 SE usuarioId FOR UNDEFINED, USA "anonimo"
        const userId = usuarioId || 'anonimo';
        const msg = mensagem.replace(/"/g, '\\"').replace(/'/g, "\\'");
        const cmd = `python3 "${SCRIPT_PATH}" responder "${userId}" "${msg}"`;

        console.log(`📝 [PYTHON] ${cmd}`);

        exec(cmd, { maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }

            try {
                const data = JSON.parse(stdout);
                let resposta = data.resposta || '';
                resposta = resposta.replace(/<think>.*?<\/think>/gis, '');
                resposta = resposta.replace(/<thinking>.*?<\/thinking>/gis, '');
                resposta = resposta.replace(/\s+/g, ' ').trim();

                if (!resposta) {
                    resposta = '🤔 Não consegui responder agora. Tente de outra forma!';
                }

                resolve(resposta);
            } catch (e) {
                reject(new Error(`Erro ao processar: ${stdout}`));
            }
        });
    });
}

module.exports = { chamarIA };
