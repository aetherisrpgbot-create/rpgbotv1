# ia_brain.py - CORRIGIDO
import sys
import json
import re
import sqlite3
import os
import random
import subprocess
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'database/ia_conhecimento.db')

# 🔥 SUPRIME LOGS
sys.stderr = open(os.devnull, 'w')

# ============================================================
# 🔥 LISTA DE MODELOS
# ============================================================

MODELOS_GROQ = [
    'openai/gpt-oss-120b',
    'qwen/qwen3.6-27b',
    'groq/compound',
    'openai/gpt-oss-20b',
]

# ============================================================
# 🔥 BANCO DE DADOS (COM USUÁRIO)
# ============================================================

def conectar_banco():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS ia_conhecimento (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id TEXT,
            pergunta TEXT,
            resposta TEXT,
            usos INTEGER DEFAULT 1,
            criado DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    return conn

def buscar_resposta(usuario_id, pergunta):
    try:
        conn = conectar_banco()
        cursor = conn.execute(
            'SELECT resposta FROM ia_conhecimento WHERE usuario_id = ? AND pergunta = ?',
            (usuario_id, pergunta)
        )
        resultado = cursor.fetchone()
        conn.close()
        if resultado:
            return resultado[0]
    except Exception as e:
        print(f"Erro no banco: {e}", file=sys.stderr)
    return None

def salvar_resposta(usuario_id, pergunta, resposta):
    try:
        conn = conectar_banco()
        conn.execute(
            'INSERT OR REPLACE INTO ia_conhecimento (usuario_id, pergunta, resposta) VALUES (?, ?, ?)',
            (usuario_id, pergunta, resposta)
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Erro ao salvar: {e}", file=sys.stderr)

# ============================================================
# 🔥 RACIOCÍNIO CLÍNICO
# ============================================================

def analisar_pergunta(mensagem):
    mensagem_limpa = mensagem.lower().strip()
    
    tipos = {
        'receita': ['receita', 'como fazer', 'modo de preparo', 'ingredientes'],
        'historia': ['história', 'quem foi', 'o que aconteceu'],
        'ciencia': ['ciência', 'física', 'química', 'biologia'],
        'tecnologia': ['tecnologia', 'programação', 'código'],
        'rpg': ['rpg', 'classe', 'batalhar', 'dungeon'],
        'musica': ['música', 'cantor', 'banda'],
        'nome': ['meu nome', 'qual meu nome'],
    }
    
    for tipo, palavras in tipos.items():
        for palavra in palavras:
            if palavra in mensagem_limpa:
                return tipo
    
    return 'geral'

# ============================================================
# 🔥 ORGANIZAR RESPOSTA
# ============================================================

def organizar_resposta(resposta, tipo):
    if not resposta:
        return resposta
    
    emojis = {
        'receita': '🍳',
        'historia': '📜',
        'ciencia': '🔬',
        'tecnologia': '💻',
        'rpg': '🎮',
        'musica': '🎵',
        'nome': '👤',
        'geral': '🧠'
    }
    
    emoji = emojis.get(tipo, '🧠')
    titulo = tipo.capitalize() if tipo != 'geral' else 'IA'
    
    return f'{emoji} *{titulo}:*\n\n{resposta}'

# ============================================================
# 🔥 CHAMAR GROQ
# ============================================================

def chamar_groq(pergunta):
    for modelo in MODELOS_GROQ:
        try:
            pergunta_escapada = pergunta.replace('"', '\\"').replace("'", "\\'")
            
            node_script = f'''
            const Groq = require('groq-sdk');
            const groq = new Groq({{ apiKey: process.env.GROQ_API_KEY }});
            groq.chat.completions.create({{
                messages: [
                    {{ role: 'system', content: 'Responda em português de forma direta, clara e completa.' }},
                    {{ role: 'user', content: '{pergunta_escapada}' }}
                ],
                model: '{modelo}',
                temperature: 0.7,
                max_tokens: 600
            }}).then(r => console.log(JSON.stringify({{ resposta: r.choices[0].message.content }})));
            '''
            
            result = subprocess.run(
                ['node', '-e', node_script],
                capture_output=True,
                text=True,
                env={**os.environ, 'GROQ_API_KEY': os.environ.get('GROQ_API_KEY', '')},
                timeout=30
            )
            
            if result.returncode == 0:
                data = json.loads(result.stdout)
                resposta = data.get('resposta', '')
                resposta = re.sub(r'<think>.*?</think>', '', resposta, flags=re.DOTALL)
                resposta = re.sub(r'<thinking>.*?</thinking>', '', resposta, flags=re.DOTALL)
                resposta = re.sub(r'\s+', ' ', resposta).strip()
                
                if resposta and len(resposta) > 10:
                    return resposta
        except:
            continue
    
    return None

# ============================================================
# 🔥 RESPOSTAS FIXAS
# ============================================================

RESPOSTAS_FIXAS = {
    'oi': 'Olá! Como posso ajudar? 👋',
    'olá': 'Olá! Como posso ajudar? 👋',
    'bom dia': 'Bom dia! ☀️',
    'boa tarde': 'Boa tarde! 🌤️',
    'boa noite': 'Boa noite! 🌙',
    'tchau': 'Tchau! Até mais! 👋',
    'obrigado': 'Por nada! 😊',
    'valeu': 'Valeu! 👍',
}

# ============================================================
# 🔥 FUNÇÃO PRINCIPAL
# ============================================================

def responder(usuario_id, mensagem):
    mensagem_limpa = mensagem.lower().strip()
    
    # 1. SAUDAÇÕES
    for palavra, resposta in RESPOSTAS_FIXAS.items():
        if palavra in mensagem_limpa:
            return resposta
    
    # 2. PERGUNTA SOBRE NOME (usa o ID como fallback)
    if 'meu nome' in mensagem_limpa or 'qual meu nome' in mensagem_limpa:
        nome = usuario_id.split('@')[0] if '@' in usuario_id else usuario_id
        return f'👤 Seu nome é: *{nome}*\n\n(É o que eu tenho registrado como seu identificador)'
    
    # 3. BANCO DE DADOS
    resposta = buscar_resposta(usuario_id, mensagem_limpa)
    if resposta:
        return resposta
    
    # 4. ANALISAR PERGUNTA
    tipo = analisar_pergunta(mensagem)
    
    # 5. CHAMAR GROQ
    resposta = chamar_groq(mensagem)
    if resposta:
        salvar_resposta(usuario_id, mensagem_limpa, resposta)
        return organizar_resposta(resposta, tipo)
    
    # 6. FALLBACK
    return '🤔 Não sei responder isso ainda, mas vou aprender!'

# ============================================================
# 🔥 MAIN
# ============================================================

if __name__ == '__main__':
    try:
        if len(sys.argv) < 3:
            print(json.dumps({'erro': 'Argumentos insuficientes'}))
            sys.exit(1)
        
        modo = sys.argv[1]
        usuario_id = sys.argv[2]
        
        if modo == 'responder':
            entrada = sys.argv[3] if len(sys.argv) > 3 else ''
            resultado = responder(usuario_id, entrada)
            print(json.dumps({'resposta': resultado}))
        
        elif modo == 'aprender' and len(sys.argv) >= 5:
            pergunta = sys.argv[3]
            resposta = sys.argv[4]
            salvar_resposta(usuario_id, pergunta, resposta)
            print(json.dumps({'status': 'ok'}))
        
        elif modo == 'esquecer' and len(sys.argv) >= 4:
            pergunta = sys.argv[3].lower().strip()
            conn = conectar_banco()
            conn.execute(
                'DELETE FROM ia_conhecimento WHERE usuario_id = ? AND pergunta = ?',
                (usuario_id, pergunta)
            )
            conn.commit()
            conn.close()
            print(json.dumps({'status': 'ok'}))
        
        else:
            print(json.dumps({'erro': 'Modo inválido'}))
            
    except Exception as e:
        print(json.dumps({'erro': str(e)}), file=sys.stdout)
