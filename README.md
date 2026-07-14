# Página de Venda — Filme (Guia Passo a Passo)

Este guia foi escrito para quem tem pouca familiaridade com VS Code.
Siga os passos na ordem.

---

## 1. Como abrir a pasta no VS Code

1. Abra o VS Code.
2. Vá em **Arquivo → Abrir Pasta** (ou "File → Open Folder").
3. Selecione a pasta `pagina-filme`.
4. No painel esquerdo, você verá esta estrutura:

```text
pagina-filme/
├── index.html
├── css/style.css
├── js/config.js
├── js/pixel.js
├── js/main.js
├── assets/images/poster.jpg
├── assets/images/fallback.jpg
├── assets/videos/trailer.mp4
└── README.md
```

---

## 2. Qual arquivo alterar

**Na maioria das vezes você só vai mexer em um arquivo:**

```text
js/config.js
```

É nele que ficam o nome do filme, preço, sinopse, link de checkout e ID do Pixel.

---

## 3. Como trocar o nome do filme

Abra `js/config.js` e altere a linha:

```javascript
movieTitle: "NOME DO FILME",
```

Troque o texto entre aspas pelo nome real do filme. Faça o mesmo para:

```javascript
movieYear: "2026",
movieGenre: "Ação • Suspense",
movieDuration: "1h 58min",
movieRating: "8.7",
movieLanguage: "Dublado + Legendado",
movieQuality: "Full HD",
```

---

## 4. Como trocar o preço

Ainda em `js/config.js`, altere as duas linhas de preço (as duas precisam
ficar de acordo uma com a outra):

```javascript
price: "R$ 9,90",       // texto exibido na página
priceValue: 9.90,        // valor numérico, usado no Meta Pixel
```

Exemplo: se o preço for R$ 14,90, use:

```javascript
price: "R$ 14,90",
priceValue: 14.90,
```

---

## 5. Como trocar a sinopse

Altere a linha:

```javascript
synopsis: "Sinopse curta do filme em no máximo três linhas.",
```

Escreva um texto curto (recomendado: até 3 linhas visuais).

---

## 6. Como colocar o trailer

1. Pegue o arquivo de vídeo do trailer (formato `.mp4`, de preferência
   vertical, no formato de "story", ex: 1080x1920).
2. Renomeie o arquivo para `trailer.mp4`.
3. Substitua o arquivo que já existe em:

```text
assets/videos/trailer.mp4
```

> O arquivo que já está nessa pasta é apenas um vídeo de exemplo
> (placeholder). Substitua pelo trailer real antes de publicar.

---

## 7. Como colocar o pôster

1. Pegue a imagem do pôster do filme (formato `.jpg`, de preferência vertical).
2. Substitua os arquivos:

```text
assets/images/poster.jpg
assets/images/fallback.jpg
```

`poster.jpg` é usado para compartilhamento em redes sociais (Open Graph).
`fallback.jpg` aparece se o vídeo não conseguir carregar — pode ser a
mesma imagem do pôster.

---

## 8. Como inserir o checkout

Abra `js/config.js` e altere:

```javascript
checkoutUrl: "COLE_AQUI_O_LINK_DO_CHECKOUT",
```

Troque pelo link real da sua página de pagamento. Exemplo:

```javascript
checkoutUrl: "https://pay.exemplo.com/meu-produto",
```

Enquanto esse campo não for preenchido, os botões de compra mostram um
aviso: *"O link de pagamento ainda não foi configurado."*

---

## 9. Como inserir o ID do Meta Pixel

1. No Gerenciador de Eventos do Meta, copie o número do seu Pixel
   (exemplo: `1234567890123456`).
2. Abra `js/config.js` e altere:

```javascript
metaPixelId: "COLE_AQUI_O_ID_DO_PIXEL",
```

para:

```javascript
metaPixelId: "1234567890123456",
```

3. **Passo extra (opcional, mas recomendado):** abra `index.html`, procure
   pelo texto `COLE_AQUI_O_ID_DO_PIXEL_NO_NOSCRIPT` (perto do topo do
   arquivo) e troque pelo mesmo número do Pixel. Esse é o único lugar do
   HTML que precisa ser alterado manualmente — ele garante que o Pixel
   funcione mesmo se o visitante estiver com o JavaScript desativado no
   navegador (caso raro).

---

## 10. Como testar usando Live Server

1. No VS Code, instale a extensão **"Live Server"** (ícone de extensões
   na barra lateral esquerda → pesquise "Live Server" → Instalar).
2. Clique com o botão direito no arquivo `index.html`.
3. Escolha **"Open with Live Server"**.
4. Seu navegador vai abrir a página automaticamente, geralmente em
   `http://127.0.0.1:5500`.

---

## 11. Como testar o Pixel com Meta Pixel Helper

1. Instale a extensão **"Meta Pixel Helper"** na Chrome Web Store.
2. Abra sua página (via Live Server ou já publicada).
3. Clique no ícone da extensão na barra do navegador.
4. Se tudo estiver certo, o ícone fica verde e mostra os eventos
   detectados na página.

---

## 12. Como verificar PageView

1. Abra a página com o Console do navegador aberto (tecla **F12** →
   aba "Console").
2. Assim que a página carregar, você deve ver:

```text
[Pixel] PageView enviado
```

3. No Meta Pixel Helper, o evento **PageView** deve aparecer na lista.

---

## 13. Como verificar ViewContent

Logo após o PageView, o console também deve mostrar:

```text
[Pixel] ViewContent enviado
```

Esse evento é enviado automaticamente quando as informações do filme
terminam de carregar na tela.

---

## 14. Como verificar InitiateCheckout

1. Clique em qualquer botão "ASSISTIR AGORA" da página.
2. O console deve mostrar:

```text
[Pixel] InitiateCheckout enviado
```

3. Depois de cerca de 250ms, você será redirecionado para o link
   configurado em `checkoutUrl`.

> Dica: se `checkoutUrl` ainda estiver como `COLE_AQUI_O_LINK_DO_CHECKOUT`,
> vai aparecer um aviso na tela em vez do redirecionamento.

---

## 15. Como publicar na Vercel

1. Crie uma conta gratuita em [vercel.com](https://vercel.com).
2. Instale o Node.js, se ainda não tiver: [nodejs.org](https://nodejs.org).
3. Abra o terminal do VS Code (**Terminal → Novo Terminal**).
4. Instale a ferramenta da Vercel:

```bash
npm install -g vercel
```

5. Dentro da pasta `pagina-filme`, rode:

```bash
vercel
```

6. Siga as perguntas no terminal (login, nome do projeto, etc.). Ao final,
   você receberá um link público, algo como:

```text
https://pagina-filme.vercel.app
```

---

## 16. Como atualizar a página depois de publicada

Sempre que você alterar algum arquivo (como `js/config.js`):

1. Salve o arquivo.
2. No terminal, dentro da pasta `pagina-filme`, rode novamente:

```bash
vercel --prod
```

3. Aguarde a mensagem de sucesso com o novo link.

---

## ERROS COMUNS

**Vídeo não carrega**
- Verifique se o arquivo está exatamente em `assets/videos/trailer.mp4`.
- Verifique se o nome do arquivo está sem espaços ou acentos.
- Formatos recomendados: `.mp4` (codec H.264).
- Se o vídeo não carregar, a imagem de `fallback.jpg` aparece
  automaticamente no lugar.

**Caminho da imagem incorreto**
- Confirme se os arquivos estão dentro de `assets/images/`.
- Os nomes precisam ser exatamente `poster.jpg` e `fallback.jpg`
  (respeitando maiúsculas/minúsculas).

**Pixel não aparece no Meta Pixel Helper**
- Confirme se `metaPixelId` foi preenchido em `js/config.js`.
- Abra o Console (F12) e veja se aparece `[Pixel] ID não configurado`
  — se aparecer, o ID ainda não foi preenchido.
- Verifique se você não está com um bloqueador de anúncios (AdBlock)
  ativado, pois ele pode bloquear o Pixel.

**Evento aparece duplicado**
- Isso não deve acontecer no código entregue, pois já existe proteção
  contra cliques duplicados. Se acontecer, verifique se você não
  colou o script do Pixel em outro lugar do HTML manualmente.

**Checkout não abre**
- Verifique se `checkoutUrl` foi preenchido corretamente em
  `js/config.js`, com um link completo (começando com `https://`).

**Página abre em branco**
- Verifique se todos os arquivos `.js` estão dentro da pasta `js/`.
- Abra o Console (F12) e veja se há alguma mensagem de erro em vermelho.

**Alterações não aparecem na Vercel**
- Lembre-se de rodar `vercel --prod` novamente após cada alteração.
- Verifique se você salvou o arquivo antes de publicar.

**Cache do navegador**
- Se as alterações não aparecerem mesmo depois de publicar, force
  a atualização da página com **Ctrl + Shift + R** (Windows/Linux) ou
  **Cmd + Shift + R** (Mac).

---

## CHECKLIST ANTES DE PUBLICAR

```text
[ ] Troquei o nome do filme
[ ] Troquei a sinopse
[ ] Adicionei o trailer
[ ] Adicionei o pôster
[ ] Coloquei o link do checkout
[ ] Coloquei o ID do Pixel
[ ] Testei o PageView
[ ] Testei o ViewContent
[ ] Testei o InitiateCheckout
[ ] Testei no celular
[ ] Publiquei na Vercel
```
