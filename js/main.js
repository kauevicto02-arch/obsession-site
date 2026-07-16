/**
 * ==========================================================
 * MAIN.JS
 * ==========================================================
 *
 * Este arquivo é responsável por:
 *  - Preencher a página com as informações do js/config.js
 *  - Configurar os botões de compra (com estado de carregamento
 *    e bloqueio contra cliques repetidos)
 *  - Controlar o botão fixo (sticky) que aparece ao rolar
 *  - Controlar o fallback do vídeo (erro de carregamento e
 *    autoplay bloqueado pelo navegador)
 *  - Iniciar o Meta Pixel
 *
 * Você normalmente NÃO precisa editar este arquivo.
 * ==========================================================
 */

document.addEventListener("DOMContentLoaded", function () {
  // Tudo dentro de um try/catch: se algo inesperado der errado,
  // o erro fica registrado no console, mas o HTML já renderizado
  // continua visível — a página nunca fica em branco por causa
  // de um erro de JavaScript.
  try {
    preencherInformacoesDoFilme();
    preencherSEO();
    configurarVideo();
    configurarBotoesDeCompra();
    configurarBotaoFixo();

    // Inicia o Pixel e, em seguida, o ViewContent
    iniciarMetaPixel();
    dispararViewContent();
  } catch (erro) {
    console.log("[Página] Erro ao inicializar:", erro);
  }
});

/**
 * Preenche todos os textos visíveis da página com base no
 * objeto PAGE_CONFIG (vindo de js/config.js). O HTML já traz um
 * texto padrão em cada campo, então mesmo que este script demore
 * um instante para rodar, o título, o preço e o botão principal
 * já aparecem imediatamente na tela.
 */
function preencherInformacoesDoFilme() {
  definirTexto("movie-title", PAGE_CONFIG.movieTitle);
  definirTexto("movie-rating", PAGE_CONFIG.movieRating);
  definirTexto("movie-year", PAGE_CONFIG.movieYear);
  definirTexto("movie-genre", PAGE_CONFIG.movieGenre);
  definirTexto("movie-duration", PAGE_CONFIG.movieDuration);
  definirTexto("movie-language", PAGE_CONFIG.movieLanguage);
  definirTexto("movie-price", PAGE_CONFIG.price);
  definirTexto("movie-synopsis", PAGE_CONFIG.synopsis);
  definirTexto("sticky-price", PAGE_CONFIG.price);
}

/**
 * Atualiza o <title>, meta description, Open Graph e Twitter Card
 * com as informações do filme.
 */
function preencherSEO() {
  const titulo = `Assistir ${PAGE_CONFIG.movieTitle} — ${PAGE_CONFIG.movieQuality}`;
  const descricao = `Assista a ${PAGE_CONFIG.movieTitle} hoje mesmo em ${PAGE_CONFIG.movieQuality}, ${PAGE_CONFIG.movieLanguage.toLowerCase()}, por ${PAGE_CONFIG.price}. Pagamento seguro via Pix.`;

  document.title = titulo;
  definirAtributo("page-description", "content", descricao);
  definirAtributo("og-title", "content", titulo);
  definirAtributo("og-description", "content", descricao);
  definirAtributo("twitter-title", "content", titulo);
  definirAtributo("twitter-description", "content", descricao);
}

/**
 * Função auxiliar: define o texto de um elemento pelo ID,
 * apenas se o elemento existir (evita erros no console).
 */
function definirTexto(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento && valor) {
    elemento.textContent = valor;
  }
}

/**
 * Função auxiliar: define um atributo de um elemento pelo ID.
 */
function definirAtributo(id, atributo, valor) {
  const elemento = document.getElementById(id);
  if (elemento && valor) {
    elemento.setAttribute(atributo, valor);
  }
}

/**
 * Controla o comportamento do vídeo:
 * - Se o vídeo falhar ao carregar, mostra a imagem de fallback.
 * - Se o autoplay for bloqueado pelo navegador (comum em alguns
 *   navegadores internos, como o do Instagram/Facebook, ou em
 *   modo de economia de dados), o poster do vídeo já fica visível
 *   automaticamente — então a tela nunca fica vazia.
 */
function configurarVideo() {
  const video = document.getElementById("trailer-video");
  const fallback = null;

  if (!video) return;

  // Erro real de carregamento do arquivo de vídeo (ex: caminho
  // errado, arquivo corrompido, formato não suportado)
  

  // Tenta iniciar o vídeo manualmente. Em alguns navegadores o
  // atributo "autoplay" sozinho não é suficiente (ex: navegador
  // interno do Instagram/Facebook em certas situações).
  const tentativaDeReproducao = video.play();

  if (tentativaDeReproducao !== undefined) {
    tentativaDeReproducao.catch(function () {
      // Autoplay bloqueado pelo navegador: como o vídeo já tem o
      // atributo "poster" apontando para a imagem de fallback,
      // a pessoa continua vendo uma imagem, nunca uma tela vazia.
      if (typeof PAGE_CONFIG !== "undefined" && PAGE_CONFIG.debugMode) {
        console.log("[Vídeo] Autoplay bloqueado pelo navegador — exibindo poster.");
      }
    });
  }
}

/**
 * Configura todos os botões que possuem a classe "checkout-button".
 * Ao clicar em qualquer um deles:
 *  1. Ativa o estado de carregamento em todos os botões (evita
 *     cliques repetidos, inclusive em outro botão da página).
 *  2. Dispara o evento InitiateCheckout no Pixel.
 *  3. Redireciona (uma única vez) para o checkout configurado.
 */
function configurarBotoesDeCompra() {
  const botoes = document.querySelectorAll(".checkout-button");

  botoes.forEach(function (botao) {
    botao.addEventListener("click", function () {
      // Se já existe um checkout em andamento (clique neste botão
      // ou em outro), ignora o novo clique.
      if (typeof isCheckoutEmAndamento === "function" && isCheckoutEmAndamento()) {
        return;
      }

      ativarEstadoDeCarregamento(botoes);

      dispararInitiateCheckout(function () {
        redirecionarParaCheckout(botoes);
      });
    });
  });
}

/**
 * Ativa o estado visual de carregamento (opacidade reduzida +
 * desabilitado) em todos os botões de compra da página.
 */
function ativarEstadoDeCarregamento(botoes) {
  botoes.forEach(function (botao) {
    botao.classList.add("is-loading");
    botao.disabled = true;
  });
}

/**
 * Reverte o estado de carregamento, usado apenas quando o
 * redirecionamento não pôde acontecer (ex: link não configurado).
 */
function desativarEstadoDeCarregamento(botoes) {
  botoes.forEach(function (botao) {
    botao.classList.remove("is-loading");
    botao.disabled = false;
  });
}

/**
 * Redireciona o visitante para o link de checkout definido em
 * PAGE_CONFIG.checkoutUrl (única fonte do link — nenhum botão do
 * HTML tem um link escrito diretamente).
 * Se o link ainda não tiver sido configurado, mostra um aviso
 * amigável em vez de redirecionar para um link inválido, e
 * libera os botões novamente.
 */
function redirecionarParaCheckout(botoes) {
  const link = PAGE_CONFIG.checkoutUrl;

  if (!link || link === "COLE_AQUI_O_LINK_DO_CHECKOUT") {
    alert("O link de pagamento ainda não foi configurado.");
    if (botoes) desativarEstadoDeCarregamento(botoes);
    return;
  }

  // Redirecionamento único: a partir daqui a página começa a
  // navegar para o checkout, então não é necessário (nem desejável)
  // reverter o estado dos botões.
  window.location.href = link;
}

/**
 * Controla o botão fixo (sticky) na parte inferior da tela:
 * - Aparece depois que o visitante rola a página.
 * - Some quando o botão final (dentro da seção .details) está visível.
 * - Usa IntersectionObserver quando disponível; em navegadores muito
 *   antigos que não suportam essa API, usa apenas a posição de
 *   rolagem como alternativa simples.
 */
function configurarBotaoFixo() {
  const stickyBar = document.getElementById("sticky-bar");
  const ctaFinal = document.getElementById("cta-final");

  if (!stickyBar || !ctaFinal) return;

  function atualizarVisibilidade(ctaFinalVisivel) {
    if (ctaFinalVisivel) {
      stickyBar.classList.remove("is-visible");
    } else if (window.scrollY > 80) {
      stickyBar.classList.add("is-visible");
    } else {
      stickyBar.classList.remove("is-visible");
    }
  }

  if ("IntersectionObserver" in window) {
    let ctaFinalVisivel = false;

    const observer = new IntersectionObserver(
      function (entradas) {
        ctaFinalVisivel = entradas[0].isIntersecting;
        atualizarVisibilidade(ctaFinalVisivel);
      },
      { threshold: 0.2 }
    );

    observer.observe(ctaFinal);

    window.addEventListener(
      "scroll",
      function () {
        atualizarVisibilidade(ctaFinalVisivel);
      },
      { passive: true }
    );
  } else {
    // Alternativa simples para navegadores sem IntersectionObserver
    window.addEventListener(
      "scroll",
      function () {
        const distanciaParaFinal = ctaFinal.getBoundingClientRect().top;
        const finalVisivel = distanciaParaFinal < window.innerHeight;
        atualizarVisibilidade(finalVisivel);
      },
      { passive: true }
    );
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const synopsis = document.getElementById("movie-synopsis");
  const readMoreButton = document.getElementById("read-more-btn");

  if (!synopsis || !readMoreButton) {
    console.log("Botão Ler mais ou sinopse não encontrados.");
    return;
  }

  readMoreButton.addEventListener("click", () => {
    synopsis.classList.toggle("collapsed");

    const isCollapsed = synopsis.classList.contains("collapsed");

    readMoreButton.textContent = isCollapsed
      ? "Ler mais ▼"
      : "Ler menos ▲";
  });
});
window.addEventListener("pageshow", function () {
  const botoes = document.querySelectorAll(".checkout-button");
  const video = document.getElementById("trailer-video");

  botoes.forEach(function (botao) {
    botao.disabled = false;
    botao.classList.remove("is-loading");
  });

  if (video) {
    video.muted = true;
    video.play().catch(function () {});
  }
});

document.addEventListener(
  "touchstart",
  function iniciarVideoNoPrimeiroToque() {
    const video = document.getElementById("trailer-video");

    if (video) {
      video.muted = true;
      video.play().catch(function () {});
    }

    document.removeEventListener("touchstart", iniciarVideoNoPrimeiroToque);
  },
  { passive: true }
);

