// ============================================================
// BANCO DE PERGUNTAS - QUIZ DO BOT
// ============================================================
const perguntas = [
    // ===== GEOGRAFIA =====
    { pergunta: "Qual é a capital do Brasil?", resposta: "brasilia" },
    { pergunta: "Qual é a capital da Argentina?", resposta: "buenos aires" },
    { pergunta: "Qual é a capital da França?", resposta: "paris" },
    { pergunta: "Qual é a capital do Japão?", resposta: "toquio" },
    { pergunta: "Qual é a capital de Portugal?", resposta: "lisboa" },
    { pergunta: "Qual é a capital da Austrália?", resposta: "camberra" },
    { pergunta: "Qual é a capital do Canadá?", resposta: "ottawa" },
    { pergunta: "Qual é a capital da Itália?", resposta: "roma" },
    { pergunta: "Qual é a capital da Alemanha?", resposta: "berlim" },
    { pergunta: "Qual é a capital da Inglaterra?", resposta: "londres" },

    // ===== CIÊNCIAS =====
    { pergunta: "Qual é o maior planeta do Sistema Solar?", resposta: "jupiter" },
    { pergunta: "Qual planeta é conhecido como Planeta Vermelho?", resposta: "marte" },
    { pergunta: "Qual é o satélite natural da Terra?", resposta: "lua" },
    { pergunta: "Qual estrela está no centro do Sistema Solar?", resposta: "sol" },
    { pergunta: "Qual é o menor planeta do Sistema Solar?", resposta: "mercurio" },
    { pergunta: "Qual elemento químico possui o símbolo Au?", resposta: "ouro" },
    { pergunta: "Qual gás as plantas absorvem?", resposta: "dioxido de carbono" },
    { pergunta: "Qual órgão bombeia o sangue?", resposta: "coracao" },
    { pergunta: "Qual é o maior osso do corpo humano?", resposta: "femur" },
    { pergunta: "Qual é o maior órgão do corpo humano?", resposta: "pele" },

    // ===== HISTÓRIA =====
    { pergunta: "Quem descobriu o Brasil em 1500?", resposta: "pedro alvares cabral" },
    { pergunta: "Em que ano o Brasil foi descoberto?", resposta: "1500" },
    { pergunta: "Quem foi o primeiro presidente do Brasil?", resposta: "deodoro da fonseca" },
    { pergunta: "Em que ano ocorreu a queda do Muro de Berlim?", resposta: "1989" },
    { pergunta: "Quem foi o líder francês derrotado em Waterloo?", resposta: "napoleao bonaparte" },
    { pergunta: "Quem escreveu 'Os Lusíadas'?", resposta: "luis de camoes" },
    { pergunta: "Qual império foi governado por Júlio César?", resposta: "romano" },
    { pergunta: "Em que ano caiu o Império Romano do Ocidente?", resposta: "476" },
    { pergunta: "Qual foi a primeira civilização a desenvolver a escrita?", resposta: "sumerios" },
    { pergunta: "Quem foi conhecido como o Libertador da América?", resposta: "simon bolivar" },

    // ===== MATEMÁTICA =====
    { pergunta: "Quanto é 5 x 5?", resposta: "25" },
    { pergunta: "Quanto é 12 + 8?", resposta: "20" },
    { pergunta: "Quanto é 100 ÷ 4?", resposta: "25" },
    { pergunta: "Quanto é 9²?", resposta: "81" },
    { pergunta: "Quanto é a raiz quadrada de 64?", resposta: "8" },
    { pergunta: "Quanto é 7 x 8?", resposta: "56" },
    { pergunta: "Quanto é 144 ÷ 12?", resposta: "12" },
    { pergunta: "Quanto é 15 + 27?", resposta: "42" },
    { pergunta: "Quanto é 6³?", resposta: "216" },
    { pergunta: "Quanto é a raiz quadrada de 144?", resposta: "12" },

    // ===== CULTURA POP =====
    { pergunta: "Quem pintou a Mona Lisa?", resposta: "leonardo da vinci" },
    { pergunta: "Quem escreveu Dom Quixote?", resposta: "miguel de cervantes" },
    { pergunta: "Quem escreveu Harry Potter?", resposta: "jk rowling" },
    { pergunta: "Quem compôs a Nona Sinfonia?", resposta: "beethoven" },
    { pergunta: "Quem pintou A Noite Estrelada?", resposta: "vincent van gogh" },
    { pergunta: "Quem escreveu 'A República'?", resposta: "platao" },
    { pergunta: "Qual filósofo ficou conhecido pela frase 'Penso, logo existo'?", resposta: "descartes" },
    { pergunta: "Quem desenvolveu a teoria da evolução?", resposta: "charles darwin" },
    { pergunta: "Quem formulou a Teoria da Relatividade?", resposta: "albert einstein" },
    { pergunta: "Quem pintou o teto da Capela Sistina?", resposta: "michelangelo" },

    // ===== ANIMAIS =====
    { pergunta: "Qual animal é conhecido como rei da selva?", resposta: "leao" },
    { pergunta: "Qual é o maior mamífero do mundo?", resposta: "baleia azul" },
    { pergunta: "Quantas patas possui uma aranha?", resposta: "8" },
    { pergunta: "Qual animal produz mel?", resposta: "abelha" },
    { pergunta: "Qual ave não consegue voar?", resposta: "avestruz" },
    { pergunta: "Qual é o único mamífero capaz de voo verdadeiro?", resposta: "morcego" },
    { pergunta: "Qual animal é conhecido como o 'Rei dos Animais'?", resposta: "leao" },
    { pergunta: "Quantos dentes tem um adulto humano?", resposta: "32" },
    { pergunta: "Qual é o animal mais rápido do mundo?", resposta: "guepardo" },
    { pergunta: "Qual é o maior réptil do mundo?", resposta: "crocodilo" },

    // ===== ESPORTES =====
    { pergunta: "Qual seleção ganhou a Copa de 2002?", resposta: "brasil" },
    { pergunta: "Quem é conhecido como Rei do Futebol?", resposta: "pele" },
    { pergunta: "Quantos jogadores tem um time em campo no futebol?", resposta: "11" },
    { pergunta: "Qual país sediou a Copa de 2014?", resposta: "brasil" },
    { pergunta: "Qual jogador usa o apelido CR7?", resposta: "cristiano ronaldo" },
    { pergunta: "Qual país venceu a primeira Copa do Mundo em 1930?", resposta: "uruguai" },
    { pergunta: "Qual é o esporte mais praticado no mundo?", resposta: "futebol" },
    { pergunta: "Em que ano o Brasil ganhou a primeira Copa?", resposta: "1958" },
    { pergunta: "Qual país é conhecido como o 'país do futebol'?", resposta: "brasil" },
    { pergunta: "Quantas Copas o Brasil já ganhou?", resposta: "5" },

    // ===== BÍBLIA / RELIGIÃO =====
    { pergunta: "Qual o primeiro livro da Bíblia?", resposta: "genesis" },
    { pergunta: "Quantos livros tem a Bíblia?", resposta: "66" },
    { pergunta: "Quem escreveu os Salmos?", resposta: "davi" },
    { pergunta: "Qual é o maior livro da Bíblia?", resposta: "salmos" },
    { pergunta: "Quem foi o profeta que enfrentou os profetas de Baal?", resposta: "elias" },
    { pergunta: "Quem traduziu a Bíblia para o latim?", resposta: "jeronimo" },

    // ===== PERSONALIZADAS =====
    { pergunta: "Quem a Grazi ama?", resposta: "pierry" },
    { pergunta: "Qual é o melhor bot de WhatsApp?", resposta: "rpg bot" }
];

module.exports = perguntas;
