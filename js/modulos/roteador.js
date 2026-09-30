/* ==========================================================
   roteador.js - Roteamento SPA
   Intercepta links internos, busca a página, troca o <main>
   e avisa os demais módulos com o evento PAGINA_RENDERIZADA.
   ========================================================== */
import { emitir, PAGINA_RENDERIZADA } from "./eventos.js";

const cache = new Map();
let idNavegacao = 0;          /* identifica a navegação mais recente (evita corrida) */
let caminhoRenderizado = "";  /* caminho da página que está na tela */

/* Só intercepta links internos para páginas .html */
function ehLinkInterno(link) {
  return (
    link.origin === location.origin &&
    link.pathname.endsWith(".html") &&
    !link.hasAttribute("download") &&
    !link.target
  );
}

/* Busca a página, extrai título e <main> (com cache) */
async function carregarPagina(caminho) {
  if (cache.has(caminho)) return cache.get(caminho);

  const resposta = await fetch(caminho);
  if (!resposta.ok) throw new Error("Falha ao carregar " + caminho);

  const texto = await resposta.text();
  const doc = new DOMParser().parseFromString(texto, "text/html");
  const dados = { titulo: doc.title, principal: doc.querySelector("main") };
  if (!dados.principal) throw new Error("Página sem <main>");

  cache.set(caminho, dados);
  return dados;
}

/* Renderização: troca o conteúdo do <main> e o título */
function renderizar(dados) {
  const conteudo = document.querySelector("main");
  const novo = document.importNode(dados.principal, true);
  conteudo.replaceChildren(...novo.childNodes);
  document.title = dados.titulo;
}

/* Posiciona a tela e move o foco (acessibilidade) */
function posicionar(hash) {
  const conteudo = document.querySelector("main");
  const alvo = hash ? document.getElementById(hash.slice(1)) : null;
  if (alvo) {
    alvo.scrollIntoView();
  } else {
    window.scrollTo(0, 0);
    conteudo.setAttribute("tabindex", "-1");
    conteudo.focus({ preventScroll: true });
  }
}

/* Aviso não bloqueante quando a rede falha: a página atual permanece na tela */
function mostrarAvisoRede() {
  const anterior = document.getElementById("aviso-rede");
  if (anterior) anterior.remove();
  const aviso = document.createElement("p");
  aviso.id = "aviso-rede";
  aviso.className = "mensagem-form erro";
  aviso.setAttribute("role", "alert");
  aviso.textContent = "Não foi possível carregar a página. Verifique sua conexão e tente novamente.";
  document.querySelector("main").prepend(aviso);
}

async function navegar(url, empilhar) {
  const destino = new URL(url, location.href);
  const meuId = ++idNavegacao;
  try {
    const dados = await carregarPagina(destino.pathname);
    if (meuId !== idNavegacao) return; /* uma navegação mais nova já começou: descarta esta */
    renderizar(dados);
    caminhoRenderizado = destino.pathname;
    if (empilhar) history.pushState({}, "", destino.href);
    emitir(PAGINA_RENDERIZADA); /* templates, formulários, gráfico etc. reagem */
    posicionar(destino.hash);
  } catch (erro) {
    if (meuId !== idNavegacao) return;
    const falhaDeRede = erro.name === "TypeError" || navigator.onLine === false;
    if (falhaDeRede && location.protocol.startsWith("http")) {
      mostrarAvisoRede(); /* sem conexão: mantém a página e informa o usuário */
    } else {
      location.href = destino.href; /* outros erros: navegação tradicional */
    }
  }
}

export function iniciarRoteador() {
  caminhoRenderizado = location.pathname;

  /* click: intercepta links internos (delegação de eventos) */
  document.addEventListener("click", function (evento) {
    if (evento.defaultPrevented || evento.button !== 0) return;
    if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;

    const link = evento.target.closest("a[href]");
    if (!link || !ehLinkInterno(link)) return;
    if (link.pathname === location.pathname) {
      /* mesma página: âncora segue o padrão; link sem âncora só volta ao topo, sem recarregar */
      if (!link.hash) {
        evento.preventDefault();
        posicionar("");
      }
      return;
    }

    evento.preventDefault();
    navegar(link.href, true);
  });

  /* popstate: botões Voltar/Avançar do navegador */
  window.addEventListener("popstate", function () {
    if (location.pathname === caminhoRenderizado) {
      posicionar(location.hash); /* só mudou a âncora: não recarrega o conteúdo */
      return;
    }
    navegar(location.href, false);
  });
}
