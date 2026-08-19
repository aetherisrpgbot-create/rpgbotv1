// comandos/uteis/listarmodelos.js
const Groq = require('groq-sdk');

module.exports = {
    nome: "listarmodelos",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            // Verifica se tem API key
            if (!process.env.GROQ_API_KEY) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ GROQ_API_KEY não configurada no .env"
                });
            }

            await sock.sendMessage(remoteJid, {
                text: "⏳ Buscando modelos disponíveis..."
            });

            const groq = new Groq({ 
                apiKey: process.env.GROQ_API_KEY 
            });

            const modelos = await groq.models.list();

            // Organiza os modelos por data (mais recentes primeiro)
            const modelosOrdenados = modelos.data.sort((a, b) => b.created - a.created);

            let texto = "╭━━━ 🤖 *MODELOS GROQ* ━━━╮\n\n";
            texto += `📊 *Total:* ${modelos.data.length} modelos\n\n`;
            texto += "━━━━━━━━━━━━━━━━━━━━━━━\n\n";

            modelosOrdenados.forEach((modelo, index) => {
                const data = new Date(modelo.created * 1000).toLocaleDateString('pt-BR');
                const nome = modelo.id;
                
                // Destaca os recomendados
                let icone = "🔹";
                if (nome.includes('llama-3.3')) icone = "⭐";
                else if (nome.includes('llama-3.2')) icone = "🆕";
                else if (nome.includes('mixtral')) icone = "🔮";
                else if (nome.includes('gemma')) icone = "🧠";
                else if (nome.includes('llama-3.1')) icone = "⚡";

                texto += `${icone} *${nome}*\n`;
                texto += `   📅 ${data}\n`;
                
                // Adiciona tags especiais
                if (nome.includes('vision')) texto += "   👁️ Visão\n";
                if (nome.includes('instant')) texto += "   🚀 Rápido\n";
                if (nome.includes('70b')) texto += "   💪 70B\n";
                if (nome.includes('8b')) texto += "   ⚡ 8B\n";
                
                texto += "\n";
            });

            texto += "━━━━━━━━━━━━━━━━━━━━━━━\n\n";
            texto += "⭐ *Recomendado:* llama-3.3-70b-versatile\n";
            texto += "🚀 *Rápido:* llama-3.1-8b-instant\n";
            texto += "📌 Digite !menu para voltar.";

            // Divide em partes se for muito grande
            if (texto.length > 4096) {
                const partes = texto.match(/.{1,4000}/g) || [];
                for (const parte of partes) {
                    await sock.sendMessage(remoteJid, { text: parte });
                }
            } else {
                await sock.sendMessage(remoteJid, { text: texto });
            }

        } catch (err) {
            console.error("❌ ERRO listarmodelos:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao listar modelos.\n\n${err.message?.substring(0, 100)}`
            });
        }
    }
};
