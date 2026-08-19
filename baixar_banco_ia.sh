#!/bin/bash
# baixar_banco_ia.sh

echo "📥 Criando banco de conhecimento da IA..."

mkdir -p database

sqlite3 database/ia_conhecimento.db << EOF
CREATE TABLE IF NOT EXISTS ia_conhecimento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pergunta TEXT UNIQUE,
    resposta TEXT,
    usos INTEGER DEFAULT 1,
    criado DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 🔥 CONHECIMENTO BASE
INSERT OR IGNORE INTO ia_conhecimento (pergunta, resposta) VALUES 
('quem criou você', 'Fui criado pelo Widnes Santos, um desenvolvedor incrível! 👨‍💻'),
('qual seu nome', 'Sou o RPGBot, seu assistente pessoal! 🤖'),
('o que você sabe fazer', 'Sei jogar RPG, editar imagens, tocar música, baixar conteúdo e conversar!'),
('qual a melhor classe', 'Depende do seu estilo! Guerreiro é forte, Mago é poderoso, Arqueiro é preciso, Ladino é rápido, Paladino é equilibrado e Druida é versátil!'),
('como jogar rpg', 'Use !perfil para ver seu personagem, !batalhar para lutar, !loja para comprar itens e !dungeon para explorar masmorras! ⚔️'),
('o que é amor', 'Amor é um sentimento profundo de afeto e conexão. ❤️');
EOF

echo "✅ Banco criado!"
