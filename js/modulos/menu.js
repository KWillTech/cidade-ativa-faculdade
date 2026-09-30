/* ==========================================================
   menu.js - Menu hambúrguer (abrir, fechar e acessibilidade)
   ========================================================== */
import { ouvir, PAGINA_RENDERIZADA } from "./eventos.js";

export function definirMenu(aberto) {
  const botao = document.getElementById("menu-toggle");
  if (botao) botao.checked = aberto;
  document.body.classList.toggle("menu-aberto", aberto);
}

export function iniciarMenu() {
  /* change: reflete o estado do checkbox em uma classe do <body> */
  document.addEventListener("change", function (evento) {
    if (evento.target.id === "menu-toggle") definirMenu(evento.target.checked);
  });

  /* click: escolher um link fecha o menu móvel */
  document.addEventListener("click", function (evento) {
    if (evento.target.closest(".menu a")) definirMenu(false);
  });

  /* keydown: Esc fecha o menu e devolve o foco ao botão */
  document.addEventListener("keydown", function (evento) {
    const botao = document.getElementById("menu-toggle");
    if (evento.key === "Escape" && botao && botao.checked) {
      definirMenu(false);
      botao.focus();
    }
  });

  /* ao trocar de página, o menu começa fechado */
  ouvir(PAGINA_RENDERIZADA, function () { definirMenu(false); });
}
