// !resetclasse
module.exports = {
    nome: "resetclasse",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { lerJogadores, escreverJogadores } = require("../../servicos/banco");
        
        const dados = lerJogadores();
        if (!dados[remetenteId]) {
            return sock.sendMessage(remoteJid, { text: "❌ Você ainda não possui um perfil." });
        }

        const custo = 1000;

        if (args[0] !== "confirmar") {
            return sock.sendMessage(remoteJid, {
                text: `⚠️ ═════ REDEFINIR CLASSE ═════ ⚠️\n\n💰 Custo: ${custo} moedas\n\nSua classe atual: *${dados[remetenteId].classe}*\n\nAo redefinir, você poderá escolher uma nova classe.\n\n📜 Para confirmar, digite:\n\n!resetclasse confirmar`
            });
        }

        if (dados[remetenteId].saldo < custo) {
            return sock.sendMessage(remoteJid, {
                text: `❌ Você não possui moedas suficientes.\n\n💰 Necessário: ${custo}\n💰 Seu saldo: ${dados[remetenteId].saldo}`
            });
        }

        dados[remetenteId].saldo -= custo;
        dados[remetenteId].classe = "Sem Classe";
        escreverJogadores(dados);

        await sock.sendMessage(remoteJid, {
            text: `🔄 ═════ CLASSE RESETADA ═════ 🔄\n\n💰 -${custo} moedas\n\n⚔️ Sua classe foi removida com sucesso.\n\n📜 Use *!classe* para escolher uma nova classe.`
        });
    }
};
