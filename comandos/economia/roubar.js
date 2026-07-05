// !roubar
module.exports = {
    nome: "roubar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { getJogador } = require("../../servicos/jogador");
        const { lerJogadores, escreverJogadores } = require("../../servicos/banco");
        
        const alvo = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        
        if (!alvo) {
            return sock.sendMessage(remoteJid, {
                text: "🦹 Marque alguém para roubar!\nExemplo: !roubar @usuario"
            });
        }

        if (alvo === remetenteId) {
            return sock.sendMessage(remoteJid, { text: "🤡 Você não pode roubar a si mesmo." });
        }

        const dados = lerJogadores();
        const ladrao = getJogador(remetenteId, msg.pushName || "Usuário");
        const vitima = getJogador(alvo);

        if (vitima.saldo <= 0 && vitima.banco <= 0) {
            return sock.sendMessage(remoteJid, { text: "💸 Essa pessoa não tem dinheiro." });
        }

        // Verifica segurança da vítima
        if (vitima.segurancaAte && Date.now() < vitima.segurancaAte) {
            return sock.sendMessage(remoteJid, {
                text: `🛡️ @${alvo.split('@')[0]} está protegido por um segurança!\n\nNão é possível roubá-lo.`,
                mentions: [alvo]
            });
        }

        const chance = Math.random();

        // ❌ 75% falha (aumentei a chance de falha)
        if (chance > 0.25) {
            const multa = 250 + Math.floor(Math.random() * 500);
            let restante = multa;

            if (ladrao.saldo >= restante) {
                ladrao.saldo -= restante;
            } else {
                restante -= ladrao.saldo;
                ladrao.saldo = 0;
                ladrao.banco = Math.max(0, ladrao.banco - restante);
            }

            dados[remetenteId] = ladrao;
            escreverJogadores(dados);

            return sock.sendMessage(remoteJid, {
                text: `🚔 VOCÊ FOI PEGO!\n\n💸 Multa total: R$${multa}\n\n👮 A guarda do reino confiscou seu dinheiro.`,
            });
        }

        // ✅ Sucesso
        let valor = Math.floor(Math.random() * 301);
        let ganho = valor;

        if (vitima.saldo >= ganho) {
            vitima.saldo -= ganho;
        } else {
            ganho -= vitima.saldo;
            vitima.saldo = 0;
            vitima.banco = Math.max(0, vitima.banco - ganho);
        }

        ladrao.saldo += valor;
        dados[remetenteId] = ladrao;
        dados[alvo] = vitima;
        escreverJogadores(dados);

        await sock.sendMessage(remoteJid, {
            text: `🦹 ROUBO REALIZADO!\n\n💰 Valor roubado: R$${valor}\n\n👤 Ladrão: @${remetenteId.split('@')[0]}\n😱 Vítima: @${alvo.split('@')[0]}`,
            mentions: [remetenteId, alvo]
        });
    }
};
