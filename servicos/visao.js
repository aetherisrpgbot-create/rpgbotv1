// servicos/visao.js - CORRIGIDO (SEM JIMP)
const Groq = require('groq-sdk');
const crypto = require('crypto');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 🔥 CACHE EM MEMÓRIA
const cacheMemoria = new Map();
const CACHE_TTL = 3600000; // 1 hora

/**
 * Gera hash da imagem
 */
function gerarHashImagem(buffer) {
    return crypto.createHash('md5').update(buffer).digest('hex');
}

/**
 * Detecta o MIME type da imagem
 */
function detectarMimeType(buffer) {
    if (!buffer || buffer.length < 12) return 'image/jpeg';
    
    const hex = buffer.toString('hex', 0, 12);
    
    if (hex.startsWith('ffd8ffe0') || hex.startsWith('ffd8ffe1') || hex.startsWith('ffd8ffe2')) {
        return 'image/jpeg';
    }
    if (hex.startsWith('89504e47')) return 'image/png';
    if (hex.startsWith('47494638')) return 'image/gif';
    if (hex.startsWith('52494646') && hex.substring(8, 20).includes('57454250')) {
        return 'image/webp';
    }
    if (hex.startsWith('424d')) return 'image/bmp';
    if (hex.startsWith('49492a00') || hex.startsWith('4d4d002a')) return 'image/tiff';
    
    return 'image/jpeg';
}

/**
 * DESCRIÇÃO PRINCIPAL (com cache e fallback)
 */
async function descreverImagem(buffer, idioma = 'pt') {
    try {
        const hash = gerarHashImagem(buffer);
        
        // 🔥 VERIFICA CACHE
        if (cacheMemoria.has(hash)) {
            const cache = cacheMemoria.get(hash);
            if (Date.now() - cache.timestamp < CACHE_TTL) {
                console.log('📸 [CACHE] Usando descrição em cache');
                return cache.descricao;
            } else {
                cacheMemoria.delete(hash);
            }
        }

        console.log('📸 [VISÃO] Chamando Groq Vision...');
        const descricao = await chamarGroqVision(buffer, idioma);
        
        cacheMemoria.set(hash, {
            descricao: descricao,
            timestamp: Date.now()
        });

        return descricao;

    } catch (err) {
        console.error('❌ [VISÃO] Erro:', err.message);
        
        // 🔥 FALLBACK 1: Tenta modelo menor
        try {
            console.log('📸 [FALLBACK] Tentando modelo 11B...');
            return await chamarGroqVision11B(buffer, idioma);
        } catch (fallbackErr) {
            console.error('❌ [FALLBACK] Modelo 11B falhou:', fallbackErr.message);
            
            // 🔥 FALLBACK 2: Sem IA
            return descreverImagemSemIA(buffer);
        }
    }
}

/**
 * CHAMA GROQ VISION (modelo 90B)
 */
async function chamarGroqVision(buffer, idioma = 'pt') {
    const base64 = buffer.toString('base64');
    const mimeType = detectarMimeType(buffer);

    const prompt = idioma === 'pt' 
        ? `Descreva esta imagem em DETALHES. O que você vê?
           - Objetos, pessoas, animais, veículos
           - Cores predominantes e paleta
           - Fundo e ambiente
           - Iluminação e clima
           - Estilo da imagem
           - Qualquer texto visível
           - Sentimento ou atmosfera
           - Elementos em destaque
           - Posição dos elementos
           
           Seja detalhista, isso é importante para edição.`
        : `Describe this image in DETAIL. What do you see?
           - Objects, people, animals, vehicles
           - Predominant colors and palette
           - Background and environment
           - Lighting and weather
           - Image style
           - Any visible text
           - Feeling or atmosphere
           - Prominent elements
           - Position of elements
           
           Be detailed, this is important for editing.`;

    const resposta = await groq.chat.completions.create({
        messages: [
            {
                role: 'user',
                content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } }
                ]
            }
        ],
        model: 'llama-3.2-90b-vision-preview',
        temperature: 0.3,
        max_tokens: 500,
    });

    const descricao = resposta.choices[0].message.content;
    console.log(`📸 [VISÃO] Descrição gerada (${idioma}):`, descricao.substring(0, 150) + '...');
    
    return descricao;
}

/**
 * CHAMA GROQ VISION (modelo 11B)
 */
async function chamarGroqVision11B(buffer, idioma = 'pt') {
    const base64 = buffer.toString('base64');
    const mimeType = detectarMimeType(buffer);

    const prompt = idioma === 'pt' 
        ? `Descreva esta imagem de forma clara e objetiva. O que tem nela? Cores, objetos, ambiente.`
        : `Describe this image clearly and objectively. What's in it? Colors, objects, environment.`;

    const resposta = await groq.chat.completions.create({
        messages: [
            {
                role: 'user',
                content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } }
                ]
            }
        ],
        model: 'llama-3.2-11b-vision-preview',
        temperature: 0.3,
        max_tokens: 200,
    });

    return resposta.choices[0].message.content;
}

/**
 * DESCRIÇÃO SEM IA (FALLBACK FINAL)
 */
function descreverImagemSemIA(buffer) {
    const size = buffer.length;
    const sizeKB = Math.round(size / 1024);
    const mimeType = detectarMimeType(buffer);
    
    let descricao = `Imagem ${mimeType} de ${sizeKB}KB. `;

    // Informações básicas baseadas no tamanho
    if (size < 1024) {
        descricao += 'Imagem muito pequena (ícone ou arte simples). ';
    } else if (size < 10240) {
        descricao += 'Imagem pequena, provavelmente ilustração ou ícone. ';
    } else if (size < 102400) {
        descricao += 'Imagem de tamanho médio, provavelmente foto com compressão. ';
    } else {
        descricao += 'Imagem grande, provavelmente foto de alta qualidade. ';
    }

    // Detecta se é WebP (comum em figurinhas)
    if (mimeType === 'image/webp') {
        const hex = buffer.toString('hex', 0, 100);
        if (hex.includes('414e494d')) {
            descricao += 'Esta é uma imagem ANIMADA (figurinha de vídeo). ';
        } else {
            descricao += 'Esta é uma imagem ESTÁTICA. ';
        }
    }

    // Tenta extrair informações do cabeçalho
    if (mimeType === 'image/jpeg') {
        descricao += 'Formato JPEG - comum em fotos. ';
    } else if (mimeType === 'image/png') {
        descricao += 'Formato PNG - comum em imagens com transparência. ';
    } else if (mimeType === 'image/webp') {
        descricao += 'Formato WebP - comum em figurinhas do WhatsApp. ';
    }

    return descricao;
}

/**
 * EXTRAI INFORMAÇÕES ESTRUTURADAS DA DESCRIÇÃO
 */
function extrairInfoDaDescricao(descricao) {
    const texto = descricao.toLowerCase();
    
    const info = {
        objetos: [],
        cores: [],
        ambiente: '',
        estilo: '',
        iluminacao: '',
        texto: '',
        atmosfera: '',
        keywords: []
    };

    // AMBIENTES
    const ambientes = ['praia', 'floresta', 'cidade', 'campo', 'deserto', 'montanha', 'neve', 'chuva', 'estúdio', 'interno', 'externo', 'mar', 'oceano', 'rua', 'parque', 'jardim'];
    for (const amb of ambientes) {
        if (texto.includes(amb)) {
            info.ambiente = amb;
            info.keywords.push(amb);
            break;
        }
    }

    // CORES
    const cores = ['vermelho', 'azul', 'verde', 'amarelo', 'roxo', 'rosa', 'laranja', 'marrom', 'cinza', 'preto', 'branco', 'dourado', 'prata', 'ciano', 'magenta'];
    for (const cor of cores) {
        if (texto.includes(cor)) {
            info.cores.push(cor);
            info.keywords.push(cor);
        }
    }

    // ESTILOS
    const estilos = ['realista', 'desenho', 'pintura', 'arte digital', 'aquarela', 'cartoon', 'foto', 'ilustração', 'vetor', '3d'];
    for (const estilo of estilos) {
        if (texto.includes(estilo)) {
            info.estilo = estilo;
            info.keywords.push(estilo);
            break;
        }
    }

    // ILUMINAÇÃO
    const iluminacoes = ['dia', 'noite', 'ensolarado', 'nublado', 'por do sol', 'amanhecer', 'neon', 'escuro', 'claro'];
    for (const ilum of iluminacoes) {
        if (texto.includes(ilum)) {
            info.iluminacao = ilum;
            info.keywords.push(ilum);
            break;
        }
    }

    // ATMOSFERA
    const atmosferas = ['feliz', 'triste', 'calmo', 'agitado', 'misterioso', 'romântico', 'épico', 'sombrio', 'alegre', 'sereno'];
    for (const atm of atmosferas) {
        if (texto.includes(atm)) {
            info.atmosfera = atm;
            info.keywords.push(atm);
            break;
        }
    }

    return info;
}

/**
 * LIMPA O CACHE
 */
function limparCache() {
    cacheMemoria.clear();
    console.log('📸 [CACHE] Cache limpo');
}

module.exports = { 
    descreverImagem,
    detectarMimeType,
    extrairInfoDaDescricao,
    limparCache,
    chamarGroqVision,
    chamarGroqVision11B
};
