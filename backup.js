const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const PASTA_DESTINO = "/sdcard/Download/backup_bot";

function criarBackup() {
    const data = new Date();
    const dataStr = data.getFullYear() + "-" +
                    String(data.getMonth() + 1).padStart(2, "0") + "-" +
                    String(data.getDate()).padStart(2, "0") + "_" +
                    String(data.getHours()).padStart(2, "0") + "-" +
                    String(data.getMinutes()).padStart(2, "0");

    const nomeArquivo = `rpgbot_backup_${dataStr}.zip`;
    const caminhoDestino = path.join(PASTA_DESTINO, nomeArquivo);

    if (!fs.existsSync(PASTA_DESTINO)) {
        fs.mkdirSync(PASTA_DESTINO, { recursive: true });
    }

    console.log(`📦 Criando backup: ${nomeArquivo}`);

    const cmd = `zip -r "${caminhoDestino}" . -x "node_modules/*" -x "auth_info/*" -x "*.log" -x "backup/*"`;

    return new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.log("❌ Erro:", err);
                reject(err);
                return;
            }
            const stats = fs.statSync(caminhoDestino);
            console.log(`✅ Backup criado: ${nomeArquivo} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
            resolve({ caminho: caminhoDestino, nome: nomeArquivo });
        });
    });
}

if (require.main === module) {
    criarBackup();
}

module.exports = { criarBackup };
