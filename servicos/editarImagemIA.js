// servicos/editarImagemIA.js
const Groq = require('groq-sdk');

const groq = new Groq({ 
    apiKey: process.env.GROQ_API_KEY 
});

async function interpretarComando(descricao) {
    try {
        const sistema = `
            VOCÊ É UM ESPECIALISTA EM EDIÇÃO DE IMAGEM E TRADUÇÃO DE COMANDOS.

            Seu trabalho é converter QUALQUER descrição do usuário em comandos EXATOS.

            📌 COMANDOS DISPONÍVEIS NO JIMP (versão 1.6.1):
            
            🔹 REDIMENSIONAMENTO:
            - redimensionar={w: NUM, h: NUM}
            - redimensionar={w: NUM} (largura fixa)
            - redimensionar={h: NUM} (altura fixa)
            - multiplicar=NUM (ex: 2)
            
            🔹 CORTE:
            - quadrado (corta no centro e faz quadrado)
            - circular (corta em círculo)
            
            🔹 AJUSTES:
            - girar=NUM (ex: 90, 180, 270)
            - espelhar (inverte horizontalmente)
            - virar (inverte verticalmente)
            - cinza (preto e branco)
            - sepia (tom sépia)
            - invertido (inverte cores)
            
            🔹 FILTROS:
            - desfocar=NUM (1-20)
            - brilho=NUM (-1 a 1)
            - contraste=NUM (-1 a 1)
            
            🔹 BORDAS:
            - borda=NUM (preta)
            - bordabranca=NUM (branca)
            - bordavermelha=NUM (vermelha)
            
            🔹 OUTROS:
            - esticar (força 512x512)
            - preencher (fundo preto)

            📌 REGRAS IMPORTANTES:
            1. Retorne APENAS os comandos
            2. Use a sintaxe do Jimp 1.6.1
            3. Separe comandos com espaço
            4. Se não entender algo, ignore e faça o que der
            5. Combine múltiplos comandos

            📌 EXEMPLOS DE TRADUÇÃO:
            
            "deixa redondo com borda preta grossa" → circular borda=5
            "quadrado em preto e branco e gira 90" → quadrado cinza girar=90
            "aumenta 2x e espelha" → multiplicar=2 espelhar
            "corta círculo, desfoca um pouco e coloca sépia" → circular desfocar=3 sepia
            "deixa com fundo preto e borda vermelha" → preencher bordavermelha=5
            "redimensiona pra 500 largura e borra" → redimensionar={w:500} desfocar=4
            "quadrado com borda branca grossa" → quadrado bordabranca=8
            "quero uma imagem redonda com borda preta fina e em preto e branco" → circular borda=2 cinza
            
            "tira as cores" → cinza
            "deixa old school" → sepia
            "espelha a imagem" → espelhar
            "vira de cabeça pra baixo" → virar
            "deixa redondo" → circular
            "deixa quadrado" → quadrado
            "aumenta o tamanho" → multiplicar=1.5
            "diminui pela metade" → multiplicar=0.5
            "deixa do tamanho do whatsapp" → redimensionar={w:512,h:512}
            "coloca uma borda" → borda=3
            "fundo preto" → preencher
            "inverte as cores" → invertido
            "desfoca o fundo" → desfocar=5
        `;

        const modelos = [
            "llama-3.3-70b-versatile",
            "qwen/qwen3.6-27b",
            "groq/compound",
            "llama-3.1-8b-instant",
        ];

        let ultimoErro = null;

        for (const modelo of modelos) {
            try {
                const resposta = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: sistema },
                        { role: "user", content: `Traduza: "${descricao}"` }
                    ],
                    model: modelo,
                    temperature: 0.3,
                    max_tokens: 150,
                });

                let comandos = resposta.choices[0].message.content.trim();
                
                // 🔥 LIMPEZA
                comandos = comandos
                    .replace(/[.,!?;:]/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();

                // 🔥 CONVERTE SINTAXE ANTIGA PARA NOVA (1.6.1)
                comandos = converterParaJimp161(comandos);

                console.log(`✅ IA usou modelo: ${modelo}`);
                console.log(`📝 Comandos gerados: ${comandos}`);

                if (comandos && comandos.length >= 3) {
                    return comandos;
                }
            } catch (err) {
                ultimoErro = err;
                console.log(`⚠️ Modelo ${modelo} falhou:`, err.message);
                continue;
            }
        }

        console.error('❌ Todos os modelos falharam:', ultimoErro);
        return interpretarFallback(descricao);

    } catch (err) {
        console.error('❌ Erro na IA:', err);
        return interpretarFallback(descricao);
    }
}

// 🔥 CONVERSOR DE SINTAXE PARA JIMP 1.6.1
function converterParaJimp161(comandos) {
    let cmd = comandos;
    
    // 🔥 CONVERTE redimensionar=WxH → redimensionar={w:W,h:H}
    cmd = cmd.replace(/redimensionar=(\d+)x(\d+)/g, 'redimensionar={w:$1,h:$2}');
    
    // 🔥 CONVERTE redimensionar=W → redimensionar={w:W}
    cmd = cmd.replace(/redimensionar=(\d+)(?!x)/g, 'redimensionar={w:$1}');
    
    // 🔥 CONVERTE redimensionar=xH → redimensionar={h:H}
    cmd = cmd.replace(/redimensionar=x(\d+)/g, 'redimensionar={h:$1}');
    
    return cmd;
}

// 🔥 FALLBACK MANUAL MELHORADO
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
        'negativo': 'invertido'
    };

    // 🔥 PALAVRAS DE AÇÃO
    const acoes = {
        'aumentar': 'multiplicar=1.5',
        'aumenta': 'multiplicar=1.5',
        'diminuir': 'multiplicar=0.5',
        'diminui': 'multiplicar=0.5',
        'dobrar': 'multiplicar=2',
        'dobra': 'multiplicar=2',
        'triplicar': 'multiplicar=3',
        'triplica': 'multiplicar=3',
        'metade': 'multiplicar=0.5',
    };

    // 🔥 VERIFICA AÇÕES
    for (const [palavra, comando] of Object.entries(acoes)) {
        if (texto.includes(palavra)) {
            comandos.push(comando);
        }
    }

    // 🔥 VERIFICA PALAVRAS-CHAVE
    for (const [palavra, comando] of Object.entries(mapa)) {
        if (texto.includes(palavra)) {
            comandos.push(comando);
        }
    }

    // 🔥 BORDA
    const bordaMatch = texto.match(/(borda|bordas?)\s*(?:de)?\s*(\d+)/);
    if (bordaMatch) {
        const espessura = Math.min(parseInt(bordaMatch[2]), 20);
        if (texto.includes('vermelha') || texto.includes('vermelho')) {
            comandos.push(`bordavermelha=${espessura}`);
        } else if (texto.includes('branca') || texto.includes('branco')) {
            comandos.push(`bordabranca=${espessura}`);
        } else {
            comandos.push(`borda=${espessura}`);
        }
    }

    // 🔥 TAMANHO DA BORDA (se não especificou)
    if (texto.includes('borda') && !bordaMatch) {
        if (texto.includes('fina') || texto.includes('pequena')) {
            comandos.push('borda=2');
        } else if (texto.includes('grossa') || texto.includes('grande')) {
            comandos.push('borda=8');
        } else {
            comandos.push('borda=4');
        }
    }

    // 🔥 DESFOCAR
    const desfocarMatch = texto.match(/(desfocar|borrar|embaçar)\s*(?:de)?\s*(\d+)/);
    if (desfocarMatch) {
        comandos.push(`desfocar=${Math.min(parseInt(desfocarMatch[2]), 20)}`);
    } else if (texto.includes('desfocar') || texto.includes('borrar') || texto.includes('embaçar')) {
        if (texto.includes('pouco')) {
            comandos.push('desfocar=3');
        } else if (texto.includes('muito')) {
            comandos.push('desfocar=10');
        } else {
            comandos.push('desfocar=5');
        }
    }

    // 🔥 REDIMENSIONAR
    const redimMatch = texto.match(/(\d+)\s*(?:x|por)\s*(\d+)/);
    if (redimMatch) {
        const w = parseInt(redimMatch[1]);
        const h = parseInt(redimMatch[2]);
        if (w <= 2000 && h <= 2000) {
            comandos.push(`redimensionar={w:${w},h:${h}}`);
        }
    }

    // 🔥 LARGURA FIXA
    const larguraMatch = texto.match(/largura\s*(?:de)?\s*(\d+)/);
    if (larguraMatch) {
        const w = parseInt(larguraMatch[1]);
        if (w <= 2000) comandos.push(`redimensionar={w:${w}}`);
    }

    // 🔥 ALTURA FIXA
    const alturaMatch = texto.match(/altura\s*(?:de)?\s*(\d+)/);
    if (alturaMatch) {
        const h = parseInt(alturaMatch[1]);
        if (h <= 2000) comandos.push(`redimensionar={h:${h}}`);
    }

    // 🔥 MULTIPLICADOR
    const multMatch = texto.match(/(\d+)\s*(?:x|vezes|multiplicar)/);
    if (multMatch) {
        const fator = parseInt(multMatch[1]);
        if (fator >= 0.1 && fator <= 10) {
            comandos.push(`multiplicar=${fator}`);
        }
    }

    // 🔥 GIRAR
    const girarMatch = texto.match(/girar|rotacionar|rodar\s*(?:de)?\s*(\d+)/);
    if (girarMatch) {
        const angulo = parseInt(girarMatch[1]);
        if (angulo > 0 && angulo <= 360) {
            comandos.push(`girar=${angulo}`);
        }
    } else if (texto.includes('girar') || texto.includes('rotacionar') || texto.includes('rodar')) {
        if (texto.includes('45')) comandos.push('girar=45');
        else if (texto.includes('90')) comandos.push('girar=90');
        else if (texto.includes('180')) comandos.push('girar=180');
        else if (texto.includes('270')) comandos.push('girar=270');
        else comandos.push('girar=90');
    }

    // 🔥 INTENSIDADE (brilho, contraste)
    if (texto.includes('claro') || texto.includes('brilho')) {
        if (texto.includes('mais')) comandos.push('brilho=0.3');
        else if (texto.includes('menos')) comandos.push('brilho=-0.3');
        else comandos.push('brilho=0.2');
    }

    if (texto.includes('contraste')) {
        if (texto.includes('mais')) comandos.push('contraste=0.3');
        else if (texto.includes('menos')) comandos.push('contraste=-0.3');
        else comandos.push('contraste=0.2');
    }

    // 🔥 SE NÃO ENCONTROU NADA
    if (comandos.length === 0) {
        if (texto.includes('redondo')) return 'circular';
        if (texto.includes('quadrado')) return 'quadrado';
        if (texto.includes('redimensionar') || texto.includes('tamanho')) return 'redimensionar={w:512,h:512}';
        return 'quadrado';
    }

    return comandos.join(' ');
}

module.exports = { interpretarComando };
