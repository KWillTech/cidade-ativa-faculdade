/* ==========================================================
   preferencias.js - Preferência visual: tamanho do texto
   ========================================================== */
import { lerStorage, gravarStorage } from "./storage.js";

const CHAVE_FONTE = "cidadeAtiva:tamanhoTexto";

function aplicarTamanhoTexto(grande) {
  document.documentElement.dataset.fonte = grande ? "grande" : "normal";
  const botao = document.getElementById("alternar-fonte");
  if (botao) botao.setAttribute("aria-pressed", String(grande));
}

function criarBotao() {
  const cabecalho = document.querySelector("header");
  if (!cabecalho || document.getElementById("alternar-fonte")) return;
  const botao = document.createElement("button");
  botao.type = "button";
  botao.id = "alternar-fonte";
  botao.className = "botao-acessibilidade";
  botao.textContent = "A+ Texto maior";
  cabecalho.append(botao);
}

export function iniciarPreferencias() {
  criarBotao();
  aplicarTamanhoTexto(lerStorage(CHAVE_FONTE, "normal") === "grande"); /* restaura */

  document.addEventListener("click", function (evento) {
    if (!evento.target.closest("#alternar-fonte")) return;
    const grande = document.documentElement.dataset.fonte !== "grande";
    aplicarTamanhoTexto(grande);
    gravarStorage(CHAVE_FONTE, grande ? "grande" : "normal");
  });
}
