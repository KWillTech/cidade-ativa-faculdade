/* ==========================================================
   grafico.js - Integração com a biblioteca Chart.js (CDN)
   Carregamento sob demanda: só baixa a biblioteca quando a
   página tem o <canvas> do gráfico.
   ========================================================== */
import { DADOS } from "../dados.js";
import { ouvir, PAGINA_RENDERIZADA } from "./eventos.js";

const URL_CHART = "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js";
let instancia = null;
let carregamento = null;
let idRender = 0;

function carregarBiblioteca() {
  if (window.Chart) return Promise.resolve();
  if (!carregamento) {
    carregamento = new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      script.src = URL_CHART;
      script.onload = resolve;
      script.onerror = function () {
        carregamento = null; /* permite nova tentativa */
        script.remove();
        reject(new Error("Chart.js indisponível"));
      };
      document.head.append(script);
    });
  }
  return carregamento;
}

/* Lê as cores do design system (variáveis CSS) */
function cor(variavel) {
  return getComputedStyle(document.documentElement).getPropertyValue(variavel).trim();
}

function destruir() {
  if (instancia) {
    instancia.destroy(); /* libera o canvas e os ouvintes da biblioteca */
    instancia = null;
  }
}

async function renderizar() {
  const meuId = ++idRender;
  destruir();

  const canvas = document.getElementById("grafico-campanhas");
  if (!canvas) return;

  const nomes = DADOS.campanhas.map((c) => c.titulo);
  const percentuais = DADOS.campanhas.map((c) =>
    Math.min(100, Math.round((c.arrecadado / c.metaValor) * 100))
  );

  /* Alternativa em texto: permanece mesmo se a biblioteca falhar */
  const texto = nomes.map((n, i) => n + ": " + percentuais[i] + "% da meta").join(" | ");
  const resumo = document.getElementById("resumo-grafico");
  if (resumo) resumo.textContent = texto;
  canvas.setAttribute("aria-label", "Gráfico de barras. " + texto);

  try {
    await carregarBiblioteca();
  } catch (erro) {
    return;
  }
  /* O usuário pode ter navegado durante o carregamento */
  if (meuId !== idRender || !canvas.isConnected || !window.Chart) return;

  const reduzirMovimento = Boolean(window.matchMedia) &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  instancia = new window.Chart(canvas, {
    type: "bar",
    data: {
      labels: nomes,
      datasets: [{
        label: "% da meta atingido",
        data: percentuais,
        backgroundColor: cor("--cor-primaria"),
        borderColor: cor("--cor-primaria-escura"),
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: reduzirMovimento ? false : { duration: 800 },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { callback: (valor) => valor + "%" },
          title: { display: true, text: "% da meta" },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (contexto) => contexto.parsed.y + "% da meta" } },
      },
    },
  });
}

export function iniciarGrafico() {
  ouvir(PAGINA_RENDERIZADA, renderizar);
}
