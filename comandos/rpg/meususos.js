// !meususos - Ver quantos usos de itens hoje
const { lerJogadores } = require("../../servicos/banco");

module.exports = {
    nome: "meususos",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const dados = lerJogadores();
        if (!dados[remetenteId] || !dados[remetenteId].usoItens) {
            return sock.sendMessage(remoteJid, {
                text: "📊 *Você ainda não usou nenhum item hoje!*"
            });
        }
        
        const usos = dados[remetenteId].usoItens;
        const hoje = new Date().toDateString();
        
        if (usos.data !== hoje) {
            return sock.sendMessage(remoteJid, {
                text: "📊 *Nenhum uso registrado hoje!*"
            });
        }
        
        await sock.sendMessage(remoteJid, {
            text: `📊 *SEUS USOS HOJE*\n\n` +
                  `🔄 Itens usados: ${usos.count}/30\n` +
                  `⚔️ Batalhas: ${usos.batalhas || 0}\n\n` +
                  `📌 *Multiplicador atual:* ${usos.count <= 5 ? '1.0x' : usos.count <= 10 ? '0.9x' : usos.count <= 15 ? '0.7x' : usos.count <= 20 ? '0.5x' : '0.3x'}\n\n` +
                  `💡 Use menos itens para ganhar mais!`
        });
    }
};
