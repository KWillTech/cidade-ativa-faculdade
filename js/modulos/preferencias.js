/* ==========================================================
   preferencias.js - Preferências visuais salvas no navegador:
   tamanho do texto e tema de cores (automático, claro, escuro
   ou alto contraste).
   ========================================================== */
import { lerStorage, gravarStorage } from "./storage.js";
import { emitir, TEMA_ALTERADO } from "./eventos.js";

const CHAVE_FONTE = "cidadeAtiva:tamanhoTexto";
const CHAVE_TEMA = "cidadeAtiva:tema";
const TEMAS = [
  ["auto", "Automático"],
  ["claro", "Claro"],
  ["escuro", "Escuro"],
  ["alto-contraste", "Alto contraste"],
];

function aplicarTamanhoTexto(grande) {
  document.documentElement.dataset.fonte = grande ? "grande" : "normal";
  const botao = document.getElementById("alternar-fonte");
  if (botao) botao.setAttribute("aria-pressed", String(grande));
}

/* Aplica o tema no <html>. "auto" remove o atributo e deixa valer o sistema. */
function aplicarTema(tema) {
  const valido = TEMAS.some(([valor]) => valor === tema) ? tema : "auto"; /* ignora valor adulterado */
  if (valido === "auto") delete document.documentElement.dataset.tema;
  else document.documentElement.dataset.tema = valido;
  const seletor = document.getElementById("seletor-tema");
  if (seletor) seletor.value = valido;
  emitir(TEMA_ALTERADO);
  return valido;
}

function criarControles() {
  const cabecalho = document.querySelector("header");
  if (!cabecalho || document.getElementById("alternar-fonte")) return;

  const grupo = document.createElement("div");
  grupo.className = "preferencias";

  const botao = document.createElement("button");
  botao.type = "button";
  botao.id = "alternar-fonte";
  botao.className = "botao-acessibilidade";
  botao.textContent = "A+ Texto maior";

  const rotulo = document.createElement("label");
  rotulo.htmlFor = "seletor-tema";
  rotulo.className = "sr-only";
  rotulo.textContent = "Tema de cores";

  const seletor = document.createElement("select");
  seletor.id = "seletor-tema";
  seletor.className = "seletor-tema";
  TEMAS.forEach(function ([valor, texto]) {
    const opcao = document.createElement("option");
    opcao.value = valor;
    opcao.textContent = texto;
    seletor.append(opcao);
  });

  grupo.append(botao, rotulo, seletor);
  cabecalho.append(grupo);
}

export function iniciarPreferencias() {
  criarControles();
  aplicarTamanhoTexto(lerStorage(CHAVE_FONTE, "normal") === "grande"); /* restaura */
  aplicarTema(lerStorage(CHAVE_TEMA, "auto"));                         /* restaura */

  document.addEventListener("click", function (evento) {
    if (!evento.target.closest("#alternar-fonte")) return;
    const grande = document.documentElement.dataset.fonte !== "grande";
    aplicarTamanhoTexto(grande);
    gravarStorage(CHAVE_FONTE, grande ? "grande" : "normal");
  });

  document.addEventListener("change", function (evento) {
    if (evento.target.id !== "seletor-tema") return;
    gravarStorage(CHAVE_TEMA, aplicarTema(evento.target.value));
  });

  /* Modo automático: acompanha mudanças feitas no sistema operacional */
  if (window.matchMedia) {
    ["(prefers-color-scheme: dark)", "(prefers-contrast: more)"].forEach(function (consulta) {
      const lista = window.matchMedia(consulta);
      if (lista.addEventListener) lista.addEventListener("change", () => emitir(TEMA_ALTERADO));
    });
  }
}
