// servicos/interpretarComandoAvancado.js
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function interpretarComandoAvancado(descricao) {
    try {
        const sistema = `
            VOCÊ É UM ESPECIALISTA EM EDIÇÃO DE IMAGEM E FFMPEG.

            Seu trabalho é converter QUALQUER descrição do usuário em comandos EXATOS.

            📌 COMANDOS DISPONÍVEIS (use EXATAMENTE estes nomes):
            
            🔹 REDIMENSIONAMENTO:
            - redimensionar WxH (ex: redimensionar 2100x2970)
            - largura N (ex: largura 800)
            - altura N (ex: altura 600)
            - multiplicar N (ex: multiplicar 2)
            
            🔹 CORTE E FORMAS:
            - quadrado (corta no centro e faz quadrado)
            - circular (corta em círculo)
            - cortar WxH+X+Y (ex: cortar 200x200+50+50)
            
            🔹 AJUSTES:
            - girar N (ex: girar 90, girar 180, girar 270)
            - espelhar (inverte horizontalmente)
            - virar (inverte verticalmente)
            - cinza (preto e branco)
            - sepia (tom sépia)
            - invertido (inverte cores)
            
            🔹 FILTROS:
            - desfocar N (1-20)
            - brilho N (-1 a 1)
            - contraste N (-1 a 1)
            - saturar N (-1 a 1)
            
            🔹 BORDAS:
            - borda N (preta)
            - bordabranca N (branca)
            - bordavermelha N (vermelha)
            - bordaazul N (azul)
            - bordaverde N (verde)
            - bordadourada (dourada, espessura 5)
            
            🔹 OUTROS:
            - esticar (força 512x512)
            - preencher (fundo preto nas bordas)
            - redondo (sinônimo de circular)

            📌 REGRAS IMPORTANTES:
            1. Retorne APENAS os comandos, separados por VÍRGULA
            2. Use os nomes EXATOS
            3. Mantenha números e unidades
            4. Se não entender algo, ignore e faça o que der

            📌 EXEMPLOS DE TRADUÇÃO:
            
            "redimensiona 2100x2970 e coloca borda vermelha 1" 
            → redimensionar 2100x2970, bordavermelha 1
            
            "deixa redondo com borda preta grossa" 
            → circular, borda 8
            
            "quadrado em preto e branco com borda" 
            → quadrado, cinza, borda 5
            
            "gira 90 graus, espelha e desfoca 3" 
            → girar 90, espelhar, desfocar 3
            
            "redimensiona 800x600, brilho 0.3, contraste 0.5" 
            → redimensionar 800x600, brilho 0.3, contraste 0.5
            
            "corta círculo, sépia e borda dourada" 
            → circular, sepia, bordadourada
            
            "fundo preto com borda azul 3" 
            → preencher, bordaazul 3
            
            "aumenta 2x e espelha" 
            → multiplicar 2, espelhar
            
            "inverte as cores e vira de cabeça pra baixo" 
            → invertido, virar
            
            "deixa do tamanho do whatsapp" 
            → redimensionar 512x512
            
            "deixa redondo" 
            → circular
            
            "tira as cores" 
            → cinza
            
            "deixa old school" 
            → sepia
            
            "espelha a imagem" 
            → espelhar
            
            "vira de cabeça pra baixo" 
            → virar
            
            "coloca uma borda" 
            → borda 5
            
            "fundo preto" 
            → preencher
            
            "desfoca o fundo" 
            → desfocar 5
        `;

        const resposta = await groq.chat.completions.create({
            messages: [
                { role: "system", content: sistema },
                { role: "user", content: `Traduza: "${descricao}"` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
            max_tokens: 150,
        });

        let comandos = resposta.choices[0].message.content.trim();
        comandos = comandos.replace(/[.!?;]$/, '').trim();

        console.log('🧠 IA gerou:', comandos);

        if (!comandos) return null;

        // 🔥 CONVERTE PARA ARRAY
        const lista = comandos.split(',').map(c => c.trim()).filter(c => c.length > 0);

        // 🔥 SE VEIO VAZIO, TENTA FALLBACK
        if (lista.length === 0) {
            return interpretarFallback(descricao);
        }

        return lista;

    } catch (err) {
        console.error('❌ Erro na IA:', err);
        return interpretarFallback(descricao);
    }
}

// 🔥 FALLBACK INTELIGENTE (SEM IA)
function interpretarFallback(descricao) {
    const texto = descricao.toLowerCase();
    const comandos = [];

    // 🔥 MAPA DE PALAVRAS-CHAVE
    const mapa = {
        'redondo': 'circular',
        'círculo': 'circular',
        'circular': 'circular',
        'quadrado': 'quadrado',
        'quadrada': 'quadrado',
        'cinza': 'cinza',
        'preto e branco': 'cinza',
        'pb': 'cinza',
        'pretoebranco': 'cinza',
        'espelhar': 'espelhar',
        'espelhado': 'espelhar',
        'virar': 'virar',
        'invertido': 'virar',
        'esticar': 'esticar',
        'estica': 'esticar',
        'preencher': 'preencher',
        'fundo preto': 'preencher',
        'sepia': 'sepia',
        'velho': 'sepia',
        'invertido': 'invertido',
        'negativo': 'invertido',
        'redondo': 'circular'
    };

    for (const [palavra, comando] of Object.entries(mapa)) {
        if (texto.includes(palavra)) {
            comandos.push(comando);
        }
    }

    // 🔥 AÇÕES COM NÚMEROS
    const acoes = {
        'aumentar': 'multiplicar 1.5',
        'aumenta': 'multiplicar 1.5',
        'diminuir': 'multiplicar 0.5',
        'diminui': 'multiplicar 0.5',
        'dobrar': 'multiplicar 2',
        'dobra': 'multiplicar 2',
        'triplicar': 'multiplicar 3',
        'triplica': 'multiplicar 3',
        'metade': 'multiplicar 0.5',
    };

    for (const [palavra, comando] of Object.entries(acoes)) {
        if (texto.includes(palavra)) {
            comandos.push(comando);
        }
    }

    // 🔥 BORDA
    const bordaMatch = texto.match(/(borda|bordas?)\s*(?:de)?\s*(\d+)/);
    if (bordaMatch) {
        const espessura = Math.min(parseInt(bordaMatch[2]), 20);
        if (texto.includes('vermelha') || texto.includes('vermelho')) {
            comandos.push(`bordavermelha ${espessura}`);
        } else if (texto.includes('branca') || texto.includes('branco')) {
            comandos.push(`bordabranca ${espessura}`);
        } else if (texto.includes('azul')) {
            comandos.push(`bordaazul ${espessura}`);
        } else if (texto.includes('verde')) {
            comandos.push(`bordaverde ${espessura}`);
        } else if (texto.includes('dourada') || texto.includes('dourado')) {
            comandos.push('bordadourada');
        } else {
            comandos.push(`borda ${espessura}`);
        }
    } else if (texto.includes('borda')) {
        if (texto.includes('fina') || texto.includes('pequena')) {
            comandos.push('borda 2');
        } else if (texto.includes('grossa') || texto.includes('grande')) {
            comandos.push('borda 8');
        } else {
            comandos.push('borda 4');
        }
    }

    // 🔥 DESFOCAR
    const desfocarMatch = texto.match(/(desfocar|borrar|embaçar)\s*(?:de)?\s*(\d+)/);
    if (desfocarMatch) {
        comandos.push(`desfocar ${Math.min(parseInt(desfocarMatch[2]), 20)}`);
    } else if (texto.includes('desfocar') || texto.includes('borrar') || texto.includes('embaçar')) {
        if (texto.includes('pouco')) {
            comandos.push('desfocar 3');
        } else if (texto.includes('muito')) {
            comandos.push('desfocar 10');
        } else {
            comandos.push('desfocar 5');
        }
    }

    // 🔥 REDIMENSIONAR
    const redimMatch = texto.match(/(\d+)\s*(?:x|por)\s*(\d+)/);
    if (redimMatch) {
        const w = parseInt(redimMatch[1]);
        const h = parseInt(redimMatch[2]);
        if (w <= 5000 && h <= 5000) {
            comandos.push(`redimensionar ${w}x${h}`);
        }
    }

    // 🔥 LARGURA FIXA
    const larguraMatch = texto.match(/largura\s*(?:de)?\s*(\d+)/);
    if (larguraMatch) {
        const w = parseInt(larguraMatch[1]);
        if (w <= 5000) comandos.push(`largura ${w}`);
    }

    // 🔥 ALTURA FIXA
    const alturaMatch = texto.match(/altura\s*(?:de)?\s*(\d+)/);
    if (alturaMatch) {
        const h = parseInt(alturaMatch[1]);
        if (h <= 5000) comandos.push(`altura ${h}`);
    }

    // 🔥 MULTIPLICADOR
    const multMatch = texto.match(/(\d+)\s*(?:x|vezes|multiplicar)/);
    if (multMatch) {
        const fator = parseInt(multMatch[1]);
        if (fator >= 0.1 && fator <= 10) {
            comandos.push(`multiplicar ${fator}`);
        }
    }

    // 🔥 GIRAR
    const girarMatch = texto.match(/girar|rotacionar|rodar\s*(?:de)?\s*(\d+)/);
    if (girarMatch) {
        const angulo = parseInt(girarMatch[1]);
        if (angulo > 0 && angulo <= 360) {
            comandos.push(`girar ${angulo}`);
        }
    } else if (texto.includes('girar') || texto.includes('rotacionar') || texto.includes('rodar')) {
        if (texto.includes('45')) comandos.push('girar 45');
        else if (texto.includes('90')) comandos.push('girar 90');
        else if (texto.includes('180')) comandos.push('girar 180');
        else if (texto.includes('270')) comandos.push('girar 270');
        else comandos.push('girar 90');
    }

    // 🔥 BRILHO
    if (texto.includes('claro') || texto.includes('brilho')) {
        if (texto.includes('mais') || texto.includes('aumentar')) {
            comandos.push('brilho 0.3');
        } else if (texto.includes('menos') || texto.includes('diminuir')) {
            comandos.push('brilho -0.3');
        } else {
            comandos.push('brilho 0.2');
        }
    }

    // 🔥 CONTRASTE
    if (texto.includes('contraste')) {
        if (texto.includes('mais') || texto.includes('aumentar')) {
            comandos.push('contraste 0.3');
        } else if (texto.includes('menos') || texto.includes('diminuir')) {
            comandos.push('contraste -0.3');
        } else {
            comandos.push('contraste 0.2');
        }
    }

    // 🔥 SE NÃO ENCONTROU NADA
    if (comandos.length === 0) {
        if (texto.includes('redondo')) return ['circular'];
        if (texto.includes('quadrado')) return ['quadrado'];
        if (texto.includes('redimensionar') || texto.includes('tamanho')) return ['redimensionar 512x512'];
        return ['quadrado'];
    }

    return comandos;
}

module.exports = { interpretarComandoAvancado };
