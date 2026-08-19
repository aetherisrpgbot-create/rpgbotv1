// utils/ffmpeg.js - FUNÇÕES EXPANSÍVEIS PARA FFMPEG
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

// ============================================================
// 🔥 CONFIGURAÇÕES GLOBAIS
// ============================================================
const CONFIG = {
    maxBuffer: 1024 * 1024 * 50,
    qualidade: 90,
    escalaPadrao: '512x512',
    fps: 15,
    tempoMaximo: 6,
};

// ============================================================
// 🔥 FUNÇÃO BASE PARA EXECUTAR COMANDOS
// ============================================================
function execPromise(cmd) {
    return new Promise((resolve, reject) => {
        console.log(`📝 [FFMPEG] ${cmd.substring(0, 150)}${cmd.length > 150 ? '...' : ''}`);
        exec(cmd, { maxBuffer: CONFIG.maxBuffer }, (err, stdout, stderr) => {
            if (err) {
                console.error(`❌ [FFMPEG] Erro: ${err.message}`);
                reject(err);
            } else {
                resolve(stdout);
            }
        });
    });
}

// ============================================================
// 📝 1. TEXTO
// ============================================================

/**
 * Adiciona texto com estilo
 * @param {string} inputPath - Caminho da imagem original
 * @param {string} outputPath - Caminho da imagem de saída
 * @param {object} options - Opções do texto
 * @param {string} options.texto - Texto a ser adicionado
 * @param {string} options.cor - Cor do texto (ex: 'red', 'gold')
 * @param {number} options.tamanho - Tamanho da fonte (padrão: 50)
 * @param {number|string} options.x - Posição X (número ou expressão FFmpeg)
 * @param {number|string} options.y - Posição Y (número ou expressão FFmpeg)
 * @param {string} options.estilo - 'normal', 'sombra', 'contorno', 'sombracontorno'
 * @param {number} options.opacidade - 0 a 1 (padrão: 1)
 * @param {number} options.girar - Graus de rotação
 * @param {string} options.fonte - Nome da fonte (padrão: 'Arial')
 * @param {number} options.espacoLinha - Espaçamento entre linhas
 */
async function adicionarTexto(inputPath, outputPath, options = {}) {
    const {
        texto = 'TEXTO',
        cor = 'white',
        tamanho = 50,
        x = '(w-text_w)/2',
        y = '(h-text_h)/2',
        estilo = 'normal',
        opacidade = 1,
        girar = 0,
        fonte = 'Arial',
        espacoLinha = 10
    } = options;

    const escapado = texto
        .replace(/'/g, "\\'")
        .replace(/:/g, '\\:')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n');

    let extras = '';
    
    // Estilos
    if (estilo === 'sombra' || estilo === 'sombracontorno') {
        extras += ':shadowcolor=black:shadowx=3:shadowy=3';
    }
    if (estilo === 'contorno' || estilo === 'sombracontorno') {
        extras += ':borderw=2:bordercolor=black';
    }

    // Opacidade
    if (opacidade < 1) {
        extras += `:alpha=${opacidade}`;
    }

    // Rotação
    let rotacao = '';
    if (girar !== 0) {
        rotacao = `:rotation=${girar}*PI/180`;
    }

    const cmd = `ffmpeg -y -i "${inputPath}" -vf "drawtext=text='${escapado}':fontcolor=${cor}:fontsize=${tamanho}:fontfile=${fonte}:x=${x}:y=${y}:line_spacing=${espacoLinha}${extras}${rotacao}" "${outputPath}" 2>/dev/null`;
    
    return execPromise(cmd);
}

/**
 * Adiciona múltiplos textos de uma vez
 */
async function adicionarMultiplosTextos(inputPath, outputPath, textos) {
    if (!textos || textos.length === 0) {
        throw new Error('Nenhum texto fornecido');
    }

    const filtros = textos.map(t => {
        const escapado = t.texto
            .replace(/'/g, "\\'")
            .replace(/:/g, '\\:')
            .replace(/"/g, '\\"');

        let extras = '';
        if (t.estilo === 'sombra') extras += ':shadowcolor=black:shadowx=3:shadowy=3';
        if (t.estilo === 'contorno') extras += ':borderw=2:bordercolor=black';
        if (t.opacidade && t.opacidade < 1) extras += `:alpha=${t.opacidade}`;

        const xPos = t.x || '(w-text_w)/2';
        const yPos = t.y || '(h-text_h)/2';
        const tam = t.tamanho || 50;
        const cor = t.cor || 'white';

        return `drawtext=text='${escapado}':fontcolor=${cor}:fontsize=${tam}:x=${xPos}:y=${yPos}${extras}`;
    });

    const cmd = `ffmpeg -y -i "${inputPath}" -vf "${filtros.join(',')}" "${outputPath}" 2>/dev/null`;
    return execPromise(cmd);
}

// ============================================================
// 🔄 2. REDIMENSIONAR
// ============================================================

/**
 * Redimensiona a imagem
 * @param {string} inputPath - Caminho da imagem original
 * @param {string} outputPath - Caminho da imagem de saída
 * @param {object} options - Opções de redimensionamento
 * @param {number} options.largura - Largura desejada
 * @param {number} options.altura - Altura desejada
 * @param {string} options.modo - 'exato', 'proporcional', 'preencher', 'esticar'
 * @param {string} options.interpolacao - 'lanczos', 'bicubic', 'bilinear'
 */
async function redimensionar(inputPath, outputPath, options = {}) {
    const {
        largura = 512,
        altura = 512,
        modo = 'exato',
        interpolacao = 'lanczos'
    } = options;

    let cmd;

    switch (modo) {
        case 'proporcional':
            cmd = `ffmpeg -y -i "${inputPath}" -vf "scale=${largura}:-1:flags=${interpolacao}" "${outputPath}" 2>/dev/null`;
            break;
        case 'preencher':
            cmd = `ffmpeg -y -i "${inputPath}" -vf "scale=${largura}:${altura}:flags=${interpolacao}:force_original_aspect_ratio=decrease,pad=${largura}:${altura}:(ow-iw)/2:(oh-ih)/2" "${outputPath}" 2>/dev/null`;
            break;
        case 'esticar':
            cmd = `ffmpeg -y -i "${inputPath}" -vf "scale=${largura}:${altura}:flags=${interpolacao}" "${outputPath}" 2>/dev/null`;
            break;
        default: // exato
            cmd = `ffmpeg -y -i "${inputPath}" -vf "scale=${largura}:${altura}:flags=${interpolacao}" "${outputPath}" 2>/dev/null`;
    }

    return execPromise(cmd);
}

// ============================================================
// 🎨 3. FILTROS
// ============================================================

const FILTROS = {
    cinza: 'hue=s=0',
    sepia: 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131',
    vintage: 'colorchannelmixer=.8:.6:.4:0:.6:.8:.4:0:.4:.6:.8,eq=contrast=1.2',
    cyberpunk: 'colorchannelmixer=1.2:0:0:0:0:1.2:0:0:0:0:1.2:0,eq=contrast=1.3,saturation=1.5',
    aquarela: 'edgedetect=high=0.1:low=0.01,boxblur=5:5,colorchannelmixer=.8:.6:.4:0:.6:.8:.4:0:.4:.6:.8',
    brilho: (i) => `eq=brightness=${i * 0.3}`,
    contraste: (i) => `eq=contrast=${1 + (i * 0.2)}`,
    desfoque: (i) => `boxblur=${Math.round(i * 4)}:${Math.round(i * 4)}`,
    negativo: 'negate',
    saturar: (i) => `eq=saturation=${1 + (i * 0.5)}`,
    desaturar: (i) => `eq=saturation=${1 - (i * 0.5)}`,
    esquenta: 'colorchannelmixer=1.2:0:0:0:0:0.8:0:0:0:0:0.6:0',
    esfria: 'colorchannelmixer=0.8:0:0:0:0:1.2:0:0:0:0:1.2:0',
    neon: 'eq=contrast=1.5,saturation=2,colorchannelmixer=1.5:0:0:0:0:1.5:0:0:0:0:1.5:0',
    pastel: 'eq=saturation=0.6,brightness=0.1,colorchannelmixer=.8:.6:.8:0:.6:.8:.6:0:.8:.6:.8',
    sombrio: 'eq=brightness=-0.2,contrast=1.3,saturation=0.7',
    vibrante: 'eq=saturation=1.5,contrast=1.2,brightness=0.05'
};

/**
 * Aplica filtro na imagem
 * @param {string} inputPath - Caminho da imagem original
 * @param {string} outputPath - Caminho da imagem de saída
 * @param {string} filtro - Nome do filtro
 * @param {number} intensidade - Intensidade do filtro (0-5)
 */
async function aplicarFiltro(inputPath, outputPath, filtro, intensidade = 1) {
    let filtroCmd = FILTROS[filtro];
    
    if (!filtroCmd) {
        throw new Error(`Filtro "${filtro}" não encontrado.`);
    }

    if (typeof filtroCmd === 'function') {
        filtroCmd = filtroCmd(intensidade);
    }

    const cmd = `ffmpeg -y -i "${inputPath}" -vf "${filtroCmd}" "${outputPath}" 2>/dev/null`;
    return execPromise(cmd);
}

// ============================================================
// 🖼️ 4. BORDA
// ============================================================

/**
 * Adiciona borda na imagem
 * @param {string} inputPath - Caminho da imagem original
 * @param {string} outputPath - Caminho da imagem de saída
 * @param {object} options - Opções da borda
 * @param {string} options.cor - Cor da borda
 * @param {number} options.espessura - Espessura da borda
 * @param {number} options.raio - Raio para cantos arredondados
 */
async function adicionarBorda(inputPath, outputPath, options = {}) {
    const {
        cor = 'black',
        espessura = 5,
        raio = 0
    } = options;

    let cmd;
    if (raio > 0) {
        // Borda arredondada
        cmd = `ffmpeg -y -i "${inputPath}" -vf "format=rgba,drawbox=0:0:iw:ih:color=black:thickness=fill,drawbox=0:0:iw:ih:color=white:thickness=fill:radius=${raio}" "${outputPath}" 2>/dev/null`;
    } else {
        cmd = `ffmpeg -y -i "${inputPath}" -vf "drawbox=color=${cor}:thickness=${espessura}" "${outputPath}" 2>/dev/null`;
    }

    return execPromise(cmd);
}

// ============================================================
// 🔄 5. GIRAR
// ============================================================

/**
 * Gira a imagem
 * @param {string} inputPath - Caminho da imagem original
 * @param {string} outputPath - Caminho da imagem de saída
 * @param {number} angulo - Ângulo em graus
 * @param {string} corFundo - Cor do fundo para áreas vazias
 * @param {boolean} expandir - Se deve expandir a imagem para caber a rotação
 */
async function girar(inputPath, outputPath, angulo, corFundo = 'black', expandir = false) {
    let cmd;
    if (expandir) {
        cmd = `ffmpeg -y -i "${inputPath}" -vf "rotate=${angulo}*PI/180:fillcolor=${corFundo}" "${outputPath}" 2>/dev/null`;
    } else {
        cmd = `ffmpeg -y -i "${inputPath}" -vf "rotate=${angulo}*PI/180:fillcolor=${corFundo},crop=iw:ih" "${outputPath}" 2>/dev/null`;
    }
    return execPromise(cmd);
}

// ============================================================
// ✂️ 6. CORTAR
// ============================================================

/**
 * Corta a imagem em formas
 * @param {string} inputPath - Caminho da imagem original
 * @param {string} outputPath - Caminho da imagem de saída
 * @param {string} tipo - 'quadrado', 'circulo', 'retangulo'
 * @param {object} dimensoes - Dimensões para corte personalizado
 * @param {number} dimensoes.x - Posição X
 * @param {number} dimensoes.y - Posição Y
 * @param {number} dimensoes.w - Largura
 * @param {number} dimensoes.h - Altura
 */
async function cortar(inputPath, outputPath, tipo = 'quadrado', dimensoes = null) {
    let cmd;

    switch (tipo) {
        case 'circulo':
            cmd = `ffmpeg -y -i "${inputPath}" -vf "format=rgba,drawbox=0:0:iw:ih:color=black:thickness=fill,drawbox=0:0:iw:ih:color=white:thickness=fill:radius=min(iw,ih)/2,scale=512:512:flags=lanczos" "${outputPath}" 2>/dev/null`;
            break;
        case 'retangulo':
            if (dimensoes) {
                cmd = `ffmpeg -y -i "${inputPath}" -vf "crop=${dimensoes.w}:${dimensoes.h}:${dimensoes.x}:${dimensoes.y},scale=512:512:flags=lanczos" "${outputPath}" 2>/dev/null`;
            } else {
                cmd = `ffmpeg -y -i "${inputPath}" -vf "crop=iw:ih,scale=512:512:flags=lanczos" "${outputPath}" 2>/dev/null`;
            }
            break;
        case 'quadrado':
        default:
            cmd = `ffmpeg -y -i "${inputPath}" -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512:flags=lanczos" "${outputPath}" 2>/dev/null`;
    }

    return execPromise(cmd);
}

// ============================================================
// 🎭 7. OVERLAY (SOBREPOSIÇÃO)
// ============================================================

/**
 * Sobrepoe uma imagem em cima de outra
 * @param {string} inputPath - Caminho da imagem base
 * @param {string} outputPath - Caminho da imagem de saída
 * @param {string} assetPath - Caminho da imagem a sobrepor
 * @param {object} options - Opções de overlay
 * @param {number} options.x - Posição X
 * @param {number} options.y - Posição Y
 * @param {number} options.tamanho - Tamanho do asset
 * @param {number} options.girar - Rotação em graus
 * @param {number} options.opacidade - 0 a 1
 * @param {string} options.mascara - 'circulo' para máscara circular
 */
async function overlay(inputPath, outputPath, assetPath, options = {}) {
    const {
        x = 0,
        y = 0,
        tamanho = 100,
        girar = 0,
        opacidade = 1,
        mascara = null
    } = options;

    let filtros = [];
    filtros.push(`[1:v]scale=${tamanho}:-1[asset]`);

    if (girar !== 0) {
        filtros.push(`[asset]rotate=${girar}*PI/180:fillcolor=white[asset_rot]`);
        filtros.push(`[asset_rot]setpts=PTS-STARTPTS[asset_final]`);
    } else {
        filtros.push(`[asset]setpts=PTS-STARTPTS[asset_final]`);
    }

    if (mascara === 'circulo') {
        filtros.push(`[asset_final]format=rgba,drawbox=0:0:iw:ih:color=black:thickness=fill,drawbox=0:0:iw:ih:color=white:thickness=fill:radius=min(iw,ih)/2[asset_mask]`);
        filtros.push(`[asset_mask]setpts=PTS-STARTPTS[asset_masked]`);
    }

    const assetFinal = mascara ? 'asset_masked' : 'asset_final';

    if (opacidade < 1) {
        filtros.push(`[${assetFinal}]format=rgba,colorchannelmixer=aa=${opacidade}[asset_alpha]`);
        filtros.push(`[0:v][asset_alpha]overlay=${x}:${y}[out]`);
    } else {
        filtros.push(`[0:v][${assetFinal}]overlay=${x}:${y}[out]`);
    }

    const filterComplex = filtros.join(';');
    const cmd = `ffmpeg -y -i "${inputPath}" -i "${assetPath}" -filter_complex "${filterComplex}" -map "[out]" "${outputPath}" 2>/dev/null`;
    
    return execPromise(cmd);
}

// ============================================================
// 🎨 8. FUNDO E GRADIENTES
// ============================================================

/**
 * Cria uma imagem de fundo
 * @param {string} outputPath - Caminho da imagem de saída
 * @param {object} options - Opções do fundo
 * @param {string} options.tipo - 'solido', 'gradiente'
 * @param {string} options.cor1 - Cor principal
 * @param {string} options.cor2 - Cor secundária (para gradiente)
 * @param {string} options.direcao - 'horizontal', 'vertical', 'diagonal'
 * @param {number} options.largura - Largura da imagem
 * @param {number} options.altura - Altura da imagem
 */
async function criarFundo(outputPath, options = {}) {
    const {
        tipo = 'solido',
        cor1 = 'black',
        cor2 = 'white',
        direcao = 'horizontal',
        largura = 1024,
        altura = 1024
    } = options;

    let cmd;

    if (tipo === 'gradiente') {
        const direcoes = {
            horizontal: '0',
            vertical: '1',
            diagonal: 'diagonal'
        };
        const dir = direcoes[direcao] || '0';
        const gradCmd = `gradients=${cor1}:${cor2}:size=${largura}x${altura}:rate=1:angle=${dir}`;
        cmd = `ffmpeg -y -f lavfi -i "${gradCmd}" -frames:v 1 "${outputPath}" 2>/dev/null`;
    } else {
        cmd = `ffmpeg -y -f lavfi -i color=c=${cor1}:s=${largura}x${altura}:r=1 -frames:v 1 "${outputPath}" 2>/dev/null`;
    }

    return execPromise(cmd);
}

// ============================================================
// 🎬 9. VÍDEO E GIF
// ============================================================

/**
 * Converte imagem para GIF
 * @param {string} inputPath - Caminho da imagem original
 * @param {string} outputPath - Caminho do GIF de saída
 * @param {object} options - Opções do GIF
 * @param {number} options.fps - Frames por segundo
 * @param {number} options.duracao - Duração em segundos
 * @param {number} options.largura - Largura do GIF
 * @param {number} options.altura - Altura do GIF
 */
async function converterParaGif(inputPath, outputPath, options = {}) {
    const {
        fps = 10,
        duracao = 3,
        largura = 512,
        altura = 512
    } = options;

    const cmd = `ffmpeg -y -i "${inputPath}" -vf "fps=${fps},scale=${largura}:${altura}:flags=lanczos" -loop 0 -t ${duracao} "${outputPath}" 2>/dev/null`;
    return execPromise(cmd);
}

// ============================================================
// 🛠️ 10. UTILITÁRIOS
// ============================================================

/**
 * Obtém dimensões da imagem
 */
async function getDimensions(inputPath) {
    return new Promise((resolve) => {
        const cmd = `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${inputPath}" 2>/dev/null`;
        exec(cmd, (err, stdout) => {
            if (err || !stdout) {
                resolve({ width: 1024, height: 1024 });
            } else {
                const [width, height] = stdout.trim().split(',').map(Number);
                resolve({ width: width || 1024, height: height || 1024 });
            }
        });
    });
}

/**
 * Converte cores em hex
 */
function corParaHex(cor) {
    const cores = {
        'preto': '#000000', 'branco': '#FFFFFF', 'vermelho': '#FF0000',
        'verde': '#00FF00', 'azul': '#0000FF', 'amarelo': '#FFFF00',
        'dourado': '#FFD700', 'roxo': '#800080', 'rosa': '#FF69B4',
        'laranja': '#FF8C00', 'cinza': '#808080', 'marrom': '#8B4513',
        'prata': '#C0C0C0', 'ciano': '#00FFFF', 'magenta': '#FF00FF',
        'violeta': '#EE82EE', 'bege': '#F5F5DC', 'coral': '#FF7F50'
    };
    return cores[cor.toLowerCase()] || cor;
}

module.exports = {
    // Funções principais
    adicionarTexto,
    adicionarMultiplosTextos,
    redimensionar,
    aplicarFiltro,
    adicionarBorda,
    girar,
    cortar,
    overlay,
    criarFundo,
    converterParaGif,
    
    // Utilitários
    getDimensions,
    corParaHex,
    execPromise,
    
    // Constantes e filtros
    FILTROS,
    CONFIG
};
