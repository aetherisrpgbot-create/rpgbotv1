// ============================================================
// EXPORTA TODOS OS COMANDOS
// ============================================================
const fs = require("fs");
const path = require("path");

const comandos = new Map();

// Lê todas as pastas dentro de "comandos"
const pastas = fs.readdirSync(__dirname);

for (const pasta of pastas) {
    if (pasta === "index.js") continue;
    
    const caminho = path.join(__dirname, pasta);
    if (!fs.statSync(caminho).isDirectory()) continue;
    
    // Lê todos os arquivos .js da pasta
    const arquivos = fs.readdirSync(caminho).filter(f => f.endsWith(".js"));
    
    for (const arquivo of arquivos) {
        const comando = require(path.join(caminho, arquivo));
        if (comando.nome) {
            comandos.set(comando.nome, comando.executar);
            console.log(`✅ Comando carregado: ${comando.nome}`);
        }
    }
}

// Também carrega comandos direto na pasta comandos/
const arquivosRaiz = fs.readdirSync(__dirname).filter(f => f.endsWith(".js") && f !== "index.js");
for (const arquivo of arquivosRaiz) {
    const comando = require(path.join(__dirname, arquivo));
    if (comando.nome) {
        comandos.set(comando.nome, comando.executar);
        console.log(`✅ Comando carregado: ${comando.nome}`);
    }
}

module.exports = comandos;
