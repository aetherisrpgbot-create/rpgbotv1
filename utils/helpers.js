// ============================================================
// UTILITÁRIOS - FUNÇÕES REUTILIZÁVEIS
// ============================================================
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const os = require("os");

// ========== CONVERTER BUFFER PARA FIGURINHA ==========
async function bufferToSticker(buffer, isVideo = false) {
    const input = path.join(os.tmpdir(), `in_${Date.now()}${isVideo ? ".mp4" : ".jpg"}`);
    const output = path.join(os.tmpdir(), `out_${Date.now()}.webp`);

    try {
        fs.writeFileSync(input, buffer);

        const cmd =
            `ffmpeg -y -i "${input}" ` +
            `-vf "fps=15,scale=512:512:flags=lanczos" ` +
            `-vcodec libwebp ` +
            `-lossless 0 ` +
            `-compression_level 6 ` +
            `-q:v 60 ` +
            `-loop 0 ` +
            `-preset picture ` +
            `-an ` +
            `-vsync 0 ` +
            `-t 6 ` +
            `"${output}"`;

        await new Promise((resolve, reject) => {
            exec(cmd, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        if (!fs.existsSync(output)) throw new Error("Sticker não gerado");

        return fs.readFileSync(output);
    } finally {
        if (fs.existsSync(input)) fs.unlinkSync(input);
        if (fs.existsSync(output)) fs.unlinkSync(output);
    }
}

// ========== CRIAR IMAGEM DE TEXTO (ANTIGA) ==========
async function criarConverter(texto) {
    function quebrarTexto(texto, limite = 18) {
        const palavras = texto.split(" ");
        let linhas = [];
        let linhaAtual = "";

        for (const palavra of palavras) {
            if ((linhaAtual + palavra).length > limite) {
                linhas.push(linhaAtual.trim());
                linhaAtual = palavra + " ";
            } else {
                linhaAtual += palavra + " ";
            }
        }
        if (linhaAtual.trim()) linhas.push(linhaAtual.trim());
        return linhas.join("\n");
    }

    texto = quebrarTexto(texto, 18);
    const png = path.join(os.tmpdir(), `converter_${Date.now()}.png`);
    texto = texto.replace(/'/g, "\\'").replace(/:/g, "\\:").replace(/%/g, "\\%");

    const cmd =
        `ffmpeg -y ` +
        `-f lavfi -i color=c=white:s=512x512 ` +
        `-vf "drawtext=text='${texto}':fontcolor=black:fontsize=32:line_spacing=15:x=(w-text_w)/2:y=(h-text_h)/2" ` +
        `-frames:v 1 ` +
        `"${png}"`;

    await new Promise((resolve, reject) => {
        exec(cmd, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });

    const buffer = fs.readFileSync(png);
    if (fs.existsSync(png)) fs.unlinkSync(png);
    return buffer;
}

// ========== CRIAR IMAGEM DE TEXTO COM CORES (FFMPEG) ==========
async function criarConverterColorido(texto, cor = "preto") {
    function quebrarTexto(texto, limite = 20) {
        const palavras = texto.split(" ");
        let linhas = [];
        let linhaAtual = "";

        for (const palavra of palavras) {
            if ((linhaAtual + " " + palavra).length > limite) {
                linhas.push(linhaAtual.trim());
                linhaAtual = palavra + " ";
            } else {
                linhaAtual += palavra + " ";
            }
        }
        if (linhaAtual.trim()) linhas.push(linhaAtual.trim());
        return linhas;
    }

    const linhas = quebrarTexto(texto, 20);
    const textoQuebrado = linhas.join("\n");

    const textoEscapado = textoQuebrado
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/'/g, "\\'")
        .replace(/:/g, "\\:")
        .replace(/%/g, "\\%")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)")
        .replace(/\[/g, "\\[")
        .replace(/\]/g, "\\]")
        .replace(/\{/g, "\\{")
        .replace(/\}/g, "\\}")
        .replace(/\$/g, "\\$")
        .replace(/`/g, "\\`");

    const png = path.join(os.tmpdir(), `converter_${Date.now()}.png`);

    const cores = {
        preto: { fundo: "white", texto: "black" },
        branco: { fundo: "black", texto: "white" },
        vermelho: { fundo: "white", texto: "red" },
        azul: { fundo: "white", texto: "blue" },
        verde: { fundo: "white", texto: "green" },
        amarelo: { fundo: "white", texto: "yellow" },
        roxo: { fundo: "white", texto: "purple" },
        rosa: { fundo: "white", texto: "pink" },
        laranja: { fundo: "white", texto: "orange" },
        cinza: { fundo: "white", texto: "gray" }
    };

    const corSelecionada = cores[cor.toLowerCase()] || cores.preto;

    let fontSize = 40;
    const numLinhas = linhas.length;
    if (numLinhas > 4) fontSize = 24;
    else if (numLinhas > 3) fontSize = 28;
    else if (numLinhas > 2) fontSize = 34;
    else if (numLinhas > 1) fontSize = 40;
    else fontSize = 48;

    const altura = Math.max(512, numLinhas * 80 + 40);

    const cmd = 
        `ffmpeg -y ` +
        `-f lavfi -i color=c=${corSelecionada.fundo}:s=512x${altura} ` +
        `-vf "drawtext=` +
        `text='${textoEscapado}':` +
        `fontcolor=${corSelecionada.texto}:` +
        `fontsize=${fontSize}:` +
        `line_spacing=25:` +
        `x=(w-text_w)/2:` +
        `y=(h-text_h)/2` +
        `" ` +
        `-frames:v 1 ` +
        `"${png}"`;

    console.log(`🎨 Gerando imagem | Cor: ${cor} | Fundo: ${corSelecionada.fundo}`);

    await new Promise((resolve, reject) => {
        exec(cmd, (err) => {
            if (err) {
                const cmdFallback = 
                    `ffmpeg -y ` +
                    `-f lavfi -i color=c=${corSelecionada.fundo}:s=512x${altura} ` +
                    `-vf "drawtext=` +
                    `text='${textoEscapado}':` +
                    `fontcolor=${corSelecionada.texto}:` +
                    `fontsize=${fontSize}:` +
                    `line_spacing=25:` +
                    `x=(w-text_w)/2:` +
                    `y=(h-text_h)/2` +
                    `" ` +
                    `-frames:v 1 ` +
                    `"${png}"`;

                exec(cmdFallback, (err2) => {
                    if (err2) reject(err2);
                    else resolve();
                });
            } else {
                resolve();
            }
        });
    });

    if (!fs.existsSync(png)) {
        throw new Error("Imagem não foi gerada");
    }

    const buffer = fs.readFileSync(png);
    if (fs.existsSync(png)) fs.unlinkSync(png);

    return buffer;
}    

// ========== NORMALIZAR TEXTO ==========
function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

// ========== EXTRAIR TEXTO DA MENSAGEM ==========
function getTexto(msg) {
    return (
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        msg.message?.documentMessage?.caption ||
        ""
    );
}

// ========== ATRIBUTOS DE COMBATE ==========
function getAtributosCombate(jogador) {
    let ITENS = {};
    try {
        ITENS = require("../dados/itens");
    } catch (e) {
        console.log("⚠️ Arquivo de itens não encontrado");
    }
    
    let poder = jogador.poder || 10;
    let defesa = jogador.defesa || 5;
    let critico = jogador.critico || 5;
    let esquiva = jogador.esquiva || 3;
    let vidaMax = jogador.vidaMax || 100;
    let manaMax = jogador.manaMax || 100;

    const equipados = [
        jogador.arma,
        jogador.armadura,
        jogador.acessorio
    ];

    for (const itemId of equipados) {
        if (!itemId) continue;
        const item = ITENS[itemId];
        if (!item) continue;
        poder += item.ataque || 0;
        defesa += item.defesa || 0;
        critico += item.critico || 0;
        esquiva += item.esquiva || 0;
        vidaMax += item.vidaMax || 0;
        manaMax += item.manaMax || 0;
    }

    return { poder, defesa, critico, esquiva, vidaMax, manaMax };
}

//=========EXPORTAÇÕES

module.exports = {
    bufferToSticker,
    criarConverter,
    criarConverterColorido,
    normalizarTexto,
    getTexto,
    getAtributosCombate
};
