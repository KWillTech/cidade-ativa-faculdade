/* ==========================================================
   templates.js - Sistema de templates (<template> + dados)
   Clona os modelos do HTML e os preenche com os dados.
   Fontes dinâmicas (como o histórico) são registradas por
   outros módulos, sem que este módulo os conheça.
   ========================================================== */
import { DADOS } from "../dados.js";
import { ouvir, PAGINA_RENDERIZADA } from "./eventos.js";

const fontesDinamicas = new Map();

export function registrarFonte(nome, funcao) {
  fontesDinamicas.set(nome, funcao);
}

function obterItens(nome) {
  return fontesDinamicas.has(nome) ? fontesDinamicas.get(nome)() : DADOS[nome];
}

function preencher(fragmento, item) {
  /* textContent (não innerHTML): insere dados como texto, sem interpretar HTML */
  fragmento.querySelectorAll("[data-campo]").forEach(function (el) {
    el.textContent = item[el.dataset.campo] || "";
  });
  fragmento.querySelectorAll("[data-href]").forEach(function (el) {
    el.setAttribute("href", item[el.dataset.href] || "#");
  });
}

export function renderizarTemplates() {
  document.querySelectorAll("[data-template]").forEach(function (container) {
    const modelo = document.getElementById(container.dataset.template);
    const itens = obterItens(container.dataset.fonte);
    if (!modelo || !itens) return;

    const fragmento = document.createDocumentFragment();
    itens.forEach(function (item) {
      const clone = modelo.content.cloneNode(true);
      preencher(clone, item);
      fragmento.appendChild(clone);
    });
    container.replaceChildren(fragmento);
  });
}

export function iniciarTemplates() {
  ouvir(PAGINA_RENDERIZADA, renderizarTemplates);
}
