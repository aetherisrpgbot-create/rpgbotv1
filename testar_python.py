# testar_python.py
import sys
import json
import time
import os

# 🔥 TESTE DE RESPOSTA
def responder(mensagem):
    respostas = {
        'oi': 'Olá! 👋',
        'teste': 'Teste funcionou! ✅',
        'python': 'Python está rodando! 🐍',
        'memoria': f'Memória usada: {os.popen("ps -o vsz -p " + str(os.getpid()) + " | tail -1").read().strip()} KB',
    }
    
    for palavra, resposta in respostas.items():
        if palavra in mensagem.lower():
            return resposta
    
    return f'Você disse: "{mensagem}"'

# 🔥 PRINCIPAL
if __name__ == '__main__':
    start = time.time()
    
    entrada = sys.argv[1] if len(sys.argv) > 1 else ''
    resultado = responder(entrada)
    
    elapsed = round((time.time() - start) * 1000, 2)  # ms
    
    print(json.dumps({
        'resposta': resultado,
        'tempo_ms': elapsed,
        'pid': os.getpid()
    }))
