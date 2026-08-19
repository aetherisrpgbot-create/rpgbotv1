// !lore - MOSTRA A CRÔNICA DE AETHERIS
const fs = require("fs");
const path = require("path");

module.exports = {
    nome: "lore",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const parte = args[0]?.toLowerCase() || "completa";
        
        const lore = `
🌍 *A CRÔNICA DE AETHERIS*

📜 *Prólogo*
Muito antes do primeiro reino ser erguido, existia apenas um continente conhecido como Aetheris.
Seu equilíbrio era mantido pelo Coração do Mundo, uma fonte de poder criada pelos deuses.

💀 *A Grande Ruptura*
O Devorador surgiu do vazio e guerreou contra os deuses.
O Coração se partiu em centenas de fragmentos.
Começou a Era do Caos.

⚔️ *O Surgimento da Ordem*
A Ordem do RPGBOT foi fundada para recuperar os fragmentos.
Todo aventureiro começa sem fama, sem ouro, sem poder.
Apenas com coragem.

🏰 *O Mundo Atual*
Aetheris é dividido entre reinos, ruínas, masmorras e territórios dominados por monstros.
Dragões, necromantes, guildas e bandidos disputam poder.

🔮 *Os Fragmentos*
Cada fragmento concede um poder extraordinário.
Recuperá-los significa aproximar o mundo da paz.
Mas também desperta forças adormecidas.

📜 *A Profecia*
"Quando o último fragmento for encontrado, nascerá aquele que decidirá o destino de Aetheris."

✨ *Sua Jornada*
Você acaba de ingressar na Ordem.
Treine. Lute. Explore. Conquiste.
O futuro de Aetheris pode depender das suas escolhas.

Bem-vindo ao RPGBOT. Sua história começa agora.
`;

        await sock.sendMessage(remoteJid, {
            text: lore
        });
    }
};
