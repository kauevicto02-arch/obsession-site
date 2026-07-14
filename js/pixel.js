/**
 * ==========================================================
 * META PIXEL
 * ==========================================================
 *
 * Este arquivo cuida de todo o rastreamento do Meta Pixel:
 *
 *  - Carrega o script oficial do Pixel usando o ID definido
 *    em js/config.js (PAGE_CONFIG.metaPixelId).
 *  - Dispara o evento PageView quando a página carrega.
 *  - Dispara o evento ViewContent quando as informações do
 *    filme terminam de ser exibidas.
 *  - Dispara o evento InitiateCheckout quando o visitante
 *    clica em qualquer botão de compra.
 *
 * Você não precisa mexer neste arquivo. Basta preencher o
 * "metaPixelId" no js/config.js.
 * ==========================================================
 */

// Controla se o Pixel já foi inicializado, para não carregar duas vezes
let pixelReady = false;

/**
 * Mostra mensagens no console apenas quando debugMode estiver ativo.
 * Protegido contra a ausência de PAGE_CONFIG (ex: config.js não carregou).
 */
function pixelLog(mensagem) {
  if (typeof PAGE_CONFIG !== "undefined" && PAGE_CONFIG.debugMode) {
    console.log(mensagem);
  }
}

/**
 * Carrega o script oficial do Meta Pixel e inicializa com o ID
 * configurado em js/config.js.
 */
function iniciarMetaPixel() {
  // Impede que o Pixel seja inicializado mais de uma vez
  // (ex: se esta função for chamada por engano duas vezes).
  if (pixelReady) {
    pixelLog("[Pixel] Já inicializado — ignorando nova chamada");
    return;
  }

  // Se o config.js não carregou por algum motivo, a página não quebra.
  if (typeof PAGE_CONFIG === "undefined") {
    console.log("[Pixel] ID não configurado");
    return;
  }

  const pixelId = PAGE_CONFIG.metaPixelId;

  // Se o ID não foi preenchido, a página continua funcionando
  // normalmente, apenas sem enviar dados para o Meta.
  if (!pixelId || pixelId === "COLE_AQUI_O_ID_DO_PIXEL") {
    pixelLog("[Pixel] ID não configurado");
    return;
  }

  try {
    // ---- Código padrão do Meta Pixel (fbevents.js) ----
    /* eslint-disable */
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      "script",
      "https://connect.facebook.net/en_US/fbevents.js"
    );
    /* eslint-enable */

    fbq("init", pixelId);
    pixelReady = true;

    dispararPageView();
  } catch (erro) {
    // Se o script do Pixel for bloqueado (ex: adblock) ou falhar por
    // qualquer motivo, a página continua funcionando normalmente.
    console.log("[Pixel] Não foi possível inicializar o Pixel:", erro);
  }
}

/**
 * Evento: PageView
 * Disparado uma única vez, assim que a página carrega.
 */
function dispararPageView() {
  if (!pixelReady) return;
  try {
    fbq("track", "PageView");
    pixelLog("[Pixel] PageView enviado");
  } catch (erro) {
    console.log("[Pixel] Falha ao enviar PageView:", erro);
  }
}

// Controla se o ViewContent já foi disparado, para evitar duplicidade
let viewContentEnviado = false;

/**
 * Evento: ViewContent
 * Disparado uma única vez, quando as informações do filme
 * já estão visíveis na página.
 */
function dispararViewContent() {
  if (!pixelReady || viewContentEnviado) return;

  try {
    fbq("track", "ViewContent", {
      content_name: PAGE_CONFIG.movieTitle,
      content_type: "product",
      content_ids: [PAGE_CONFIG.movieTitle],
      value: Number(PAGE_CONFIG.priceValue),
      currency: "BRL",
    });

    viewContentEnviado = true;
    pixelLog("[Pixel] ViewContent enviado");
  } catch (erro) {
    console.log("[Pixel] Falha ao enviar ViewContent:", erro);
  }
}

// Controla se o InitiateCheckout já foi disparado neste clique,
// para evitar que o mesmo clique gere vários eventos.
let checkoutEmAndamento = false;

/**
 * Evento: InitiateCheckout
 * Disparado quando o visitante clica em qualquer botão de compra.
 * Depois de enviar o evento, executa o "callback" (normalmente o
 * redirecionamento para o checkout).
 */
function dispararInitiateCheckout(callback) {
  // Evita múltiplos disparos do mesmo clique (ou de cliques em
  // botões diferentes enquanto o primeiro ainda está em andamento)
  if (checkoutEmAndamento) return;
  checkoutEmAndamento = true;

  try {
    if (pixelReady) {
      fbq("track", "InitiateCheckout", {
        content_name: PAGE_CONFIG.movieTitle,
        content_type: "product",
        content_ids: [PAGE_CONFIG.movieTitle],
        value: Number(PAGE_CONFIG.priceValue),
        currency: "BRL",
      });
      pixelLog("[Pixel] InitiateCheckout enviado");
    }
  } catch (erro) {
    // Mesmo se o envio do evento falhar (Pixel bloqueado, sem internet
    // para o Meta, etc.), o checkout precisa continuar funcionando.
    console.log("[Pixel] Falha ao enviar InitiateCheckout:", erro);
  }

  // Pequeno atraso para aumentar a chance do evento ser
  // enviado antes do redirecionamento (≈250ms)
  setTimeout(() => {
    if (typeof callback === "function") {
      callback();
    }
    // Libera novamente após o redirecionamento, para o caso
    // de o redirecionamento não acontecer (ex: link inválido)
    checkoutEmAndamento = false;
  }, 250);
}

/**
 * Função auxiliar usada pelo main.js para saber se já existe um
 * checkout em andamento, e assim evitar cliques duplicados em
 * qualquer um dos botões da página.
 */
function isCheckoutEmAndamento() {
  return checkoutEmAndamento;
}
