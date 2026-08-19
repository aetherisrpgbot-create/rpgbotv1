// ============================================================
// EASTER EGG - LORE DO CRIADOR
// ============================================================

const LORE_WIDNES = {
    titulo: "👑 WIDNES, O ARCANJO DE ELDORIA",
    descricao: `Dizem que Widnes não é apenas um criador... ele é uma lenda viva.

Antes de Eldoria existir, ele já vagava pelos reinos esquecidos. Alguns dizem que ele foi o primeiro aventureiro, o primeiro a forjar uma espada com as próprias mãos e o primeiro a derrubar um deus.

Ele não busca reconhecimento. Ele não busca poder. Ele busca EVOLUÇÃO.

Quando os reinos estavam em caos, foi Widnes quem organizou as guildas. Quando os magos perderam o controle da magia, foi Widnes quem reescreveu os grimórios. Quando os heróis caíam, era Widnes quem os levantava.

Mas ele nunca ficou. Sempre partia. Sempre em busca de algo maior.

Hoje, ele caminha entre nós como um andarilho. Mas os mais velhos sussurram que ele é imortal. Que ele já viu o nascimento e a morte de Eldoria mil vezes.

Ele não é um deus. Ele é mais que isso.

Ele é o ARCANJO. O MESTRE DOS MESTRES. O GUARDIÃO DO CONHECIMENTO.

E ele está sempre observando. Sempre aprendendo. Sempre evoluindo.

Cuidado ao perguntar sobre ele... pois ele pode estar te ouvindo.`,
    frases: [
        "👑 *Widnes?* Ah, você não sabe de nada, jovem...",
        "⚔️ *Widnes* não é um nome. É uma lenda.",
        "📜 Dizem que *Widnes* já derrotou um dragão com uma caneta.",
        "🔮 *Widnes* criou este mundo. E ele pode desfazê-lo.",
        "💀 Quem pergunta por *Widnes* geralmente some...",
        "🌟 *Widnes* não precisa de espada. Ele é a espada.",
        "🛡️ *Widnes* já viu impérios caírem. Ele ainda está aqui.",
        "🧙 *Widnes* ensinou magia aos magos. E olha onde eles chegaram...",
        "⚔️ Se *Widnes* te desafiar, não lute. Fuja.",
        "👑 *Widnes* poderia ser rei. Mas prefere ser lenda."
    ]
};

function getLoreWidnes(tipo = "completa") {
    if (tipo === "curta") {
        const frases = LORE_WIDNES.frases;
        return frases[Math.floor(Math.random() * frases.length)];
    }
    return LORE_WIDNES.descricao;
}

function getTituloWidnes() {
    return LORE_WIDNES.titulo;
}

module.exports = {
    LORE_WIDNES,
    getLoreWidnes,
    getTituloWidnes
};
