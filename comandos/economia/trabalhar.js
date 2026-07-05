// !trabalhar
module.exports = {
    nome: "trabalhar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { getJogador, adicionarXP, CLASSES } = require("../../servicos/jogador");
        const { lerJogadores, escreverJogadores } = require("../../servicos/banco");
	const { progressoMissao } = require("../../servicos/missoes");
        
        const jogador = getJogador(remetenteId, msg.pushName || 'Usuário');
        const agora = Date.now();

        // Verifica se tá descansando
        if (jogador.restEnd && jogador.restEnd > agora) {
            const restante = jogador.restEnd - agora;
            const minutos = Math.ceil(restante / 60000);
            return sock.sendMessage(remoteJid, {
                text: `😴 Você está descansando!\n\n⏳ Tempo restante: ${minutos} minuto(s).`
            });
        }

        // Reset de spam (3 minutos)
        const tempoReset = 3 * 60 * 1000;
        if (agora - (jogador.ultimoTrabalhoReal || 0) > tempoReset) {
            jogador.trabalhosSeguidos = 0;
        }

        // Verifica stamina
        if ((jogador.stamina ?? 100) <= 0) {
            return sock.sendMessage(remoteJid, {
                text: "💤 Você está sem stamina! Use !descansar para recuperar."
            });
        }

        // Cálculo de XP
        let xpBase = 10 + Math.floor(Math.random() * (10 + jogador.nivel));
        let xpGanho = Math.floor(xpBase - jogador.fatigue * 0.2);
        if (xpGanho < 1) xpGanho = 1;

        // Cálculo de dinheiro
        let base = 60 + Math.floor(Math.random() * 160);
        let bonusNivel = jogador.nivel * 2;
        let penalidadeFatigue = jogador.fatigue * 0.8;
        let penalidadeSpam = (jogador.trabalhosSeguidos || 0) * 10;
        
        let ganho = base + bonusNivel - penalidadeFatigue - penalidadeSpam;
        if (ganho < 10) ganho = 10;
        ganho = Math.floor(ganho);
        if (ganho > 10000) ganho = 10000;

        // Bônus de classe
        const classe = jogador.classe?.toLowerCase();
        if (CLASSES && CLASSES[classe]) {
            ganho = Math.floor(ganho * CLASSES[classe].dinheiro);
            xpGanho = Math.floor(xpGanho * CLASSES[classe].xp);
        }

        // Gasta stamina
        let gastoStamina = Math.max(2, 10 - Math.floor(jogador.nivel / 50));
        let ganhoFatigue = Math.max(1, 5 - Math.floor(jogador.nivel / 100));
        
        jogador.stamina = (jogador.stamina ?? 100) - gastoStamina;
        jogador.fatigue = Math.min(100, (jogador.fatigue ?? 0) + ganhoFatigue);
        if (jogador.stamina < 0) jogador.stamina = 0;

        // Atualiza contadores
        jogador.trabalhosSeguidos = (jogador.trabalhosSeguidos || 0) + 1;
        jogador.ultimoTrabalhoReal = agora;

        // Salva
        const dados = lerJogadores();
        dados[remetenteId] = jogador;
        escreverJogadores(dados);

	// ===== PROGRESSO DE MISSÃO (TRABALHAR) =====
const missoesConcluidas = progressoMissao(remetenteId, "trabalhar");
if (missoesConcluidas.length > 0) {
    let msgMissao = "\n🎯 *MISSÕES ATUALIZADAS!*\n";
    for (const m of missoesConcluidas) {
        msgMissao += `✅ *${m.nome}* concluída!\n`;
    }
    // Adiciona na mensagem de trabalho
}

        // Adiciona dinheiro e XP
        const { atualizarSaldo } = require("../../servicos/jogador");
        atualizarSaldo(remetenteId, ganho, 'saldo');
        const result = adicionarXP(remetenteId, jogador.nome, xpGanho);

        // Status de cansaço
        let status = "";
        if (jogador.fatigue >= 80) status = "💀 Você está EXAUSTO! Descanse!";
        else if (jogador.fatigue >= 50) status = "⚠️ Você está cansado.";
        else status = "💪 Você está bem.";

        await sock.sendMessage(remoteJid, {
            text: `💼 Você trabalhou!\n\n💰 +R$${ganho}\n⭐ +${xpGanho} XP\n\n⚡ -${gastoStamina} stamina\n😵 +${ganhoFatigue} fatigue\n\n📊 Stamina: ${jogador.stamina}/${jogador.maxStamina}\n💀 Cansaço: ${jogador.fatigue}%\n🔥 Trabalhos seguidos: ${jogador.trabalhosSeguidos}\n📢 Status: ${status}`
        });
    }
};
