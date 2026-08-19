// !menurpg - MENU RPG (VERSÃO 1.1 BETA)
module.exports = {
    nome: "menurpg",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const texto = `
╭━━━ ⚔️ *RPG 1.1 BETA* ━━━╮

📜 *Comandos do Aventureiro*

━━━━━━━━━━━━━━━━━━━━━━━
⚔️ *COMBATE*
━━━━━━━━━━━━━━━━━━━━━━━
!treino       → Iniciar batalha
!atacar       → Atacar
!golpe        → Golpe especial
!combo        → 3 ataques seguidos
!usarskill    → Usar habilidade
!fugir        → Fugir do combate

━━━━━━━━━━━━━━━━━━━━━━━
🛡️ *DEFESA E ESTRATÉGIA* (NOVO)
━━━━━━━━━━━━━━━━━━━━━━━
!defender     → Ativar defesa (reduz dano)
!contra-atacar → Contra-atacar após defender
!analisar     → Mostrar fraquezas
!rendicao     → Se render (menos penalidade)

━━━━━━━━━━━━━━━━━━━━━━━
📊 *STATUS* (NOVO)
━━━━━━━━━━━━━━━━━━━━━━━
!dano         → Ver dano de ataques
!defesa       → Ver defesa total
!critico      → Ver chance de crítico
!esquiva      → Ver chance de esquiva
!perfil       → Status completo

━━━━━━━━━━━━━━━━━━━━━━━
🏰 *DUNGEON* (NOVO)
━━━━━━━━━━━━━━━━━━━━━━━
!dungeon              → Menu da dungeon
!dungeon listar       → Ver dungeons
!dungeon entrar <id>  → Entrar
!dungeon status       → Ver progresso
!dungeon sair         → Sair da dungeon
!datacar              → Atacar na dungeon
!dgolpe               → Golpe na dungeon
!dcombo               → Combo na dungeon
!dskill <id>          → Skill na dungeon
!responder <resposta> → Responder puzzle

━━━━━━━━━━━━━━━━━━━━━━━
🎯 *JOGADOR*
━━━━━━━━━━━━━━━━━━━━━━━
!classe       → Definir classe
!xp           → Ver XP e progresso
!ranking      → Ranking global
!inventario   → Ver itens
!loja         → Loja do jogo
!comprar      → Comprar item
!equipar      → Equipar item
!desequipar   → Desequipar item

━━━━━━━━━━━━━━━━━━━━━━━
📌 *VERSÃO 1.1 BETA*
🔹 Novas dungeons
🔹 Status de combate
🔹 Defesa ativa
🔹 Itens lendários
🔹 Puzzles com dicas
━━━━━━━━━━━━━━━━━━━━━━━
📌 Digite !menu para voltar.
`;

        await sock.sendMessage(remoteJid, { text: texto });
    }
};
