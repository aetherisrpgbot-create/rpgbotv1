// !duelo - SISTEMA DE DUELO ENTRE JOGADORES
const { duelosAtivos, pegarAlvo, iniciarDuelo, aceitarDuelo, recusarDuelo, fugirDuelo, emDuelo, getDuelo, mostrarEquip } = require("../../servicos/duelo");

const NOMES_CLASSES = {
    "guerreiro": "⚔️ Guerreiro",
    "mago": "🧙 Mago",
    "arqueiro": "🏹 Arqueiro",
    "assassino": "🗡️ Assassino",
    "Sem Classe": "❌ Sem Classe"
};

module.exports = {
    nome: "duelo",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup) => {
        if (!isGroup) return sock.sendMessage(remoteJid, { text: "❌ Este comando só funciona em grupos!" });

        const sub = args[0]?.toLowerCase();

        // ===== DESAFIAR =====
        if (sub === "desafiar" || !sub) {
            const alvo = pegarAlvo(msg, remetenteId);
            if (!alvo) return sock.sendMessage(remoteJid, { text: "❌ Marque ou responda quem quer desafiar!\nEx: !duelo @Jogador" });
            if (alvo === remetenteId) return sock.sendMessage(remoteJid, { text: "❌ Você não pode se desafiar!" });

            const emDuelo1 = emDuelo(remetenteId);
            if (emDuelo1.emDuelo) return sock.sendMessage(remoteJid, { text: "❌ Você já está em um duelo!" });

            const emDuelo2 = emDuelo(alvo);
            if (emDuelo2.emDuelo) return sock.sendMessage(remoteJid, { text: "❌ Este jogador já está em um duelo!" });

            const resultado = iniciarDuelo(remetenteId, alvo, remoteJid);
            if (!resultado.sucesso) return sock.sendMessage(remoteJid, { text: `❌ ${resultado.erro}` });

            await sock.sendMessage(remoteJid, {
                text: `⚔️ *DESAFIO LANÇADO!*\n\n👤 @${remetenteId.split('@')[0]} desafiou @${alvo.split('@')[0]}!\n\n📌 @${alvo.split('@')[0]}, digite *!duelo aceitar* ou *!duelo recusar*.\n⏳ Você tem 30 segundos!`,
                mentions: [remetenteId, alvo]
            });

            setTimeout(() => {
                const duelo = emDuelo(remetenteId);
                if (duelo.emDuelo && duelo.duelo.status === "aguardando") {
                    delete duelosAtivos[duelo.chave];
                    sock.sendMessage(remoteJid, { text: `⏰ Desafio expirado! @${alvo.split('@')[0]} não respondeu.`, mentions: [alvo] });
                }
            }, 30000);
            return;
        }

        // ===== ACEITAR =====
        if (sub === "aceitar") {
            const emDueloAtual = emDuelo(remetenteId);
            if (emDueloAtual.emDuelo && emDueloAtual.duelo.status === "em_andamento") {
                return sock.sendMessage(remoteJid, { text: "❌ Você já está em um duelo!" });
            }

            const resultado = aceitarDuelo(remetenteId);
            if (!resultado.sucesso) return sock.sendMessage(remoteJid, { text: `❌ ${resultado.erro}` });

            const duelo = resultado.duelo;
            await sock.sendMessage(remoteJid, {
                text: `⚔️ *DUELO INICIADO!*\n\n👤 @${duelo.desafianteId.split('@')[0]} VS @${duelo.desafiadoId.split('@')[0]}\n\n❤️ @${duelo.desafianteId.split('@')[0]}: ${duelo.vidaDesafiante}/${duelo.vidaMaxDesafiante}\n❤️ @${duelo.desafiadoId.split('@')[0]}: ${duelo.vidaDesafiado}/${duelo.vidaMaxDesafiado}\n\n🎯 Turno: @${duelo.turno.split('@')[0]}\n\n⚔️ Use !atacar, !golpe, !combo ou !usarskill\n🏃 !duelo fugir para desistir`,
                mentions: [duelo.desafianteId, duelo.desafiadoId, duelo.turno]
            });
            return;
        }

        // ===== RECUSAR =====
        if (sub === "recusar") {
            const resultado = recusarDuelo(remetenteId);
            if (!resultado.sucesso) return sock.sendMessage(remoteJid, { text: `❌ ${resultado.erro}` });
            await sock.sendMessage(remoteJid, { text: `❌ @${remetenteId.split('@')[0]} recusou o duelo. 😢`, mentions: [remetenteId] });
            return;
        }

        // ===== FUGIR =====
        if (sub === "fugir") {
            const resultado = fugirDuelo(remetenteId);
            if (!resultado.sucesso) return sock.sendMessage(remoteJid, { text: `❌ ${resultado.erro}` });
            await sock.sendMessage(remoteJid, {
                text: `🏃 *FUGIU!*\n\n@${resultado.fugitivo.split('@')[0]} fugiu do duelo!\n\n💔 -${resultado.penalidade.xp} XP | -R$${resultado.penalidade.dinheiro}\n🏆 @${resultado.oponente.split('@')[0]} vence por W.O.!`,
                mentions: [resultado.fugitivo, resultado.oponente]
            });
            return;
        }

        // ===== STATUS =====
        if (sub === "status") {
            const resultado = getDuelo(remetenteId);
            if (!resultado) return sock.sendMessage(remoteJid, { text: "❌ Você não está em um duelo!" });

            const duelo = resultado.duelo;
            const c1 = NOMES_CLASSES[duelo.classeDesafiante?.toLowerCase()] || duelo.classeDesafiante || "❌ Sem Classe";
            const c2 = NOMES_CLASSES[duelo.classeDesafiado?.toLowerCase()] || duelo.classeDesafiado || "❌ Sem Classe";

            let msg = `⚔️ *STATUS DO DUELO*\n\n`;
            msg += `👤 @${duelo.desafianteId.split('@')[0]} VS @${duelo.desafiadoId.split('@')[0]}\n`;
            msg += `📊 ${duelo.status === 'em_andamento' ? '⚔️ Em andamento' : '⏳ Aguardando'}\n\n`;

            msg += `📋 *${duelo.nomeDesafiante}* ${c1}\n`;
            msg += `❤️ ${duelo.vidaDesafiante}/${duelo.vidaMaxDesafiante} | ⚔️ ${duelo.poderDesafiante} | 🛡️ ${duelo.defesaDesafiante}\n`;
            msg += `💥 ${duelo.criticoDesafiante}% | 💨 ${duelo.esquivaDesafiante}%\n`;
            msg += `🗡️ ${mostrarEquip(duelo.armaDesafiante)}\n`;
            msg += `🛡️ ${mostrarEquip(duelo.armaduraDesafiante)}\n`;
            msg += `💍 ${mostrarEquip(duelo.acessorioDesafiante)}\n\n`;

            msg += `📋 *${duelo.nomeDesafiado}* ${c2}\n`;
            msg += `❤️ ${duelo.vidaDesafiado}/${duelo.vidaMaxDesafiado} | ⚔️ ${duelo.poderDesafiado} | 🛡️ ${duelo.defesaDesafiado}\n`;
            msg += `💥 ${duelo.criticoDesafiado}% | 💨 ${duelo.esquivaDesafiado}%\n`;
            msg += `🗡️ ${mostrarEquip(duelo.armaDesafiado)}\n`;
            msg += `🛡️ ${mostrarEquip(duelo.armaduraDesafiado)}\n`;
            msg += `💍 ${mostrarEquip(duelo.acessorioDesafiado)}\n`;

            msg += `\n🎯 Turno: @${duelo.turno.split('@')[0]}`;

            await sock.sendMessage(remoteJid, { text: msg, mentions: [duelo.desafianteId, duelo.desafiadoId, duelo.turno] });
            return;
        }

        // ===== AJUDA =====
        await sock.sendMessage(remoteJid, {
            text: `⚔️ *DUELO RPG*\n\n!duelo @jogador - Desafia alguém\n!duelo aceitar - Aceita\n!duelo recusar - Recusa\n!duelo fugir - Foge\n!duelo status - Ver status\n\n⚔️ Use !atacar, !golpe, !combo ou !usarskill`
        });
    }
};
