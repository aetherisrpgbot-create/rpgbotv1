// ============================================================
// MIGRAR DADOS DO JSON PARA SQLITE
// ============================================================
const fs = require("fs");
const path = require("path");
const { saveJogador, conectarDB, closeDB } = require("../servicos/banco_sqlite");

const ARQ_JOGADOR = path.join(__dirname, "../ARQ_JOGADOR.json");

async function migrar() {
    console.log("🚀 INICIANDO MIGRAÇÃO...");

    await conectarDB();

    if (!fs.existsSync(ARQ_JOGADOR)) {
        console.log("❌ ARQ_JOGADOR.json não encontrado!");
        return;
    }

    const dados = JSON.parse(fs.readFileSync(ARQ_JOGADOR, "utf8"));
    const jogadores = Object.entries(dados);

    console.log(`📊 ${jogadores.length} jogadores encontrados`);

    let contador = 0;
    for (const [id, jogador] of jogadores) {
        try {
            saveJogador(id, jogador);
            contador++;
            if (contador % 10 === 0) {
                console.log(`✅ ${contador} jogadores migrados...`);
            }
        } catch (err) {
            console.log(`❌ Erro ao migrar ${id}:`, err.message);
        }
    }

    console.log(`✅ MIGRAÇÃO CONCLUÍDA! ${contador} jogadores salvos.`);
    closeDB();
    process.exit(0);
}

migrar();
