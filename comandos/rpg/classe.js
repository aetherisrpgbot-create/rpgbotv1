// !classe
module.exports = {
    nome: "classe",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { getJogador, CLASSES } = require("../../servicos/jogador");
        const { escreverJogadores, lerJogadores } = require("../../servicos/banco");
        const fs = require("fs");
        
        const jogador = getJogador(remetenteId, msg.pushName || 'Usuário');
        const classe = args.join(" ").trim().toLowerCase();
        const classesValidas = ["guerreiro", "mago", "arqueiro", "assassino"];

        if (jogador.classe && jogador.classe !== "Sem Classe") {
            return sock.sendMessage(remoteJid, {
                text: `⚔️ Você já escolheu uma classe!\n\n🏷️ Classe atual: ${jogador.classe}\n\n❌ Não é possível trocar novamente.`
            });
        }

        if (!classe) {
            return sock.sendMessage(remoteJid, {
                image: fs.readFileSync("./imagensbot/classebotrpg.png"),
                caption: `⚔️ ═════ ESCOLHA SUA CLASSE ═════ ⚔️\n\nAntes de iniciar sua jornada, escolha o caminho que seguirá no reino:\n\n🛡️ Guerreiro\n• Equilibrado em combate\n• Resistente e confiável\n\n🔮 Mago\n• Ganha mais XP\n• Mestre das artes arcanas\n\n🏹 Arqueiro\n• Ágil e versátil\n• Bom equilíbrio entre XP e moedas\n\n🗡️ Assassino\n• Ganha mais moedas\n• Especialista em ataques precisos\n\n━━━━━━━━━━━━━━━━━━\n\n📜 Para escolher sua classe:\n\n!classe Guerreiro\n!classe Mago\n!classe Arqueiro\n!classe Assassino`
            });
        }

        if (!classesValidas.includes(classe)) {
            return sock.sendMessage(remoteJid, { text: `❌ Classe inválida!\nUse !classe para ver opções.` });
        }

        jogador.classe = classe.charAt(0).toUpperCase() + classe.slice(1);
        const dados = lerJogadores();
        dados[remetenteId] = jogador;
        escreverJogadores(dados);

        await sock.sendMessage(remoteJid, {
            text: `⚔️ ═════ CLASSE DEFINIDA ═════ ⚔️\n\n🎉 Sua escolha foi registrada!\n\n🏷️ Classe: *${jogador.classe}*\n\n🔥 A partir de agora sua jornada começa.\nTreine, evolua e conquiste seu lugar no reino!\n\n━━━━━━━━━━━━━━━━━━\n📜 Use *!menu* para ver seus próximos passos.`
        });
    }
};
