// !menumidia - MENU MÍDIA (VERSÃO ATUALIZADA)
module.exports = {
    nome: "menumidia",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const texto = `
╭━━━ 🎨 *MÍDIA 2.0* ━━━╮

📜 *Comandos Disponíveis*

━━━━━━━━━━━━━━━━━━━━━━━
🖼️ *FIGURINHAS*
━━━━━━━━━━━━━━━━━━━━━━━
!sticker       → Cria figurinha (img/vídeo)
!figurinha     → Figurinha com qualidade máxima
!foto          → Converte figurinha em imagem
!gif           → Converte figurinha animada em GIF

━━━━━━━━━━━━━━━━━━━━━━━
✏️ *EDIÇÃO E TEXTO*
━━━━━━━━━━━━━━━━━━━━━━━
!stickertext   → Figurinha com texto
!stickermeme   → Meme (texto cima/baixo)
!stickermeme2  → Meme estilo Mouljack
!rename        → Renomeia figurinha

━━━━━━━━━━━━━━━━━━━━━━━
🎨 *EDIÇÃO DE IMAGEM*
━━━━━━━━━━━━━━━━━━━━━━━
!imgeditar     → Editor com IA 
!revelar       → Revela imagem borrada

━━━━━━━━━━━━━━━━━━━━━━━
📥 *BAIXAR CONTEÚDO*
━━━━━━━━━━━━━━━━━━━━━━━
!baixar video  → Baixa vídeos 
!baixar audio  → Baixa áudio 
!baixar gif    → Baixa GIFs 

📌 *Funciona com Links e Buscas*
📌 *NÃO SUPORTA:* Instagram

━━━━━━━━━━━━━━━━━━━━━━━
🎵 *MÚSICA*
━━━━━━━━━━━━━━━━━━━━━━━
!play <música> → Baixa e toca música
!playlist      → Ver fila de músicas
!skip          → Pular música
!stop          → Parar música

━━━━━━━━━━━━━━━━━━━━━━━
🛠️ *CONVERSORES*
━━━━━━━━━━━━━━━━━━━━━━━
!converter     → Cria figurinha de texto
!converterbranco → Texto fundo branco
!converterpreto  → Texto fundo preto

━━━━━━━━━━━━━━━━━━━━━━━
📌 Digite !menu para voltar.
`;

        await sock.sendMessage(remoteJid, { text: texto });
    }
};
