// !personagens - MOSTRA TODOS OS PERSONAGENS IA
const { listarPersonagens } = require("../../servicos/ia");

module.exports = {
    nome: "personagens",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const msgPersonagens = listarPersonagens();
        
        await sock.sendMessage(remoteJid, {
            text: msgPersonagens + `\n\n🧙 *Cada personagem tem uma personalidade única!*\n` +
                  `💡 Experimente conversar com todos!\n\n` +
                  `📌 *Exemplos:*\n` +
                  `🔮 !oraculo Qual é o meu destino?\n` +
                  `⚔️ !armeiro Qual a melhor arma?\n` +
                  `🙏 !clerigo Como fazer uma poção?\n` +
                  `📜 !mestre Como funciona a gravidade?`
        });
    }
};
