// !menu - VERSÃO COMPLETA
module.exports = {
    nome: "menu",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { getJogador } = require("../../servicos/jogador");
        const fs = require("fs");

        const jogador = getJogador(remetenteId, msg.pushName || 'Usuário');

        const texto = `
╭━━━ ⟡ 👑 *BOT RPG* 👑 ⟡ ━━━╮

⚔️ *CENTRAL DO AVENTUREIRO*

Bem-vindo, ${jogador.nome}!

💠 Classe: ${jogador.classe}
⭐ Nível: ${jogador.nivel}
✨ XP: ${jogador.xp}
💰 Dinheiro: R$${jogador.saldo}

╰━━━━━━━━━━━━━━━━━━━━╯

🎮 *Comece sua jornada usando comandos abaixo!*

╭━━━ ⚔️ *RPG* ━━━╮
• !classe → definir classe
• !resetclasse → resetar classe
• !perfil → ver status completo
• !xp → ver XP e progresso
• !ranking → ranking global
• !treino <dificuldade> → iniciar batalha
• !atacar → atacar no combate
• !skills → ver habilidades da classe
• !usarskill <id> → usar habilidade
• !combo → 3 ataques seguidos
• !golpe → super golpe
• !fugir → fugir do combate
• !loja → loja do jogo
• !comprar <id> → comprar item
• !inventario → ver itens
• !equipar <id> / !desequipar
• !equipamentos → ver equipados
• !usar <id> → usar consumível
╰━━━━━━━━━━━━━━╯

╭━━━ 💰 *ECONOMIA* ━━━╮
• !trabalhar → ganhar dinheiro
• !descansar → recuperar energia
• !acordar → acordar antes do descanso
• !saldo → ver saldo
• !depositar <valor> → depositar no banco
• !sacar <valor> → sacar do banco
• !roubar @user → roubar alguém
• !seguranca → contratar segurança
╰━━━━━━━━━━━━━━╯

╭━━━ 🎯 *MISSÕES* ━━━╮
• !missoes → ver missões diárias
• !semanal → ver missão semanal
╰━━━━━━━━━━━━━━╯

╭━━━ 🎮 *DIVERSÃO* ━━━╮
• !dado → rolar dado 🎲
• !moeda → cara ou coroa 🪙
• !8ball → pergunta ao destino 🔮
• !sorteio → número aleatório 🎯
• !pergunta → quiz de conhecimento
• !resposta → responder quiz
• !rankquiz → ranking do quiz
• !marcar → mencionar todos
╰━━━━━━━━━━━━━━╯

╭━━━ 🎨 *MÍDIA* ━━━╮
• !figurinha → criar figurinha
• !foto → figurinha em imagem
• !converter <cor> <texto> → texto em figurinha
• !converterpreto → texto preto
• !converterbranco → texto branco
• !revelar → revelar mídia única 👁️
• !stickertexto → figurinha com texto
• !play <música> → baixar música 🎵
╰━━━━━━━━━━━━━━╯

╭━━━ 👑 *ADMIN* ━━━╮
• !ban @user → banir
• !promover @user → promover
• !rebaixar @user → rebaixar
• !mute @user → mutar
• !unmute @user → desmutar
• !adv @user → advertir
• !rmadv @user → remover advertência
• !limparadv @user → limpar advertências
• !consultadv @user → consultar advertências
• !rankadv → ranking de advertências
• !resetmissoes @user → resetar missões 🔄
• !permissoes → ver permissões
• !backup → enviar backup do bot 📦
╰━━━━━━━━━━━━━━╯

╭━━━ ⚙️ *UTILITÁRIOS* ━━━╮
• !ping → testar bot
• !menu → este menu
╰━━━━━━━━━━━━━━╯

✨ *Divirta-se e evolua no RPG!*
`;

        try {
            await sock.sendMessage(remoteJid, {
                image: fs.readFileSync("./imagensbot/file_00000000c380720e9fa24e772c715ada.png"),
                caption: texto
            });
        } catch (err) {
            await sock.sendMessage(remoteJid, { text: texto });
        }
    }
};
