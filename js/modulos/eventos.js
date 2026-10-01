/* ==========================================================
   eventos.js - Canal de comunicação entre os módulos
   Os módulos não se chamam diretamente: eles emitem e ouvem
   eventos do documento. Isso mantém o baixo acoplamento.
   ========================================================== */

/* Nomes dos eventos da aplicação */
export const PAGINA_RENDERIZADA = "pagina:renderizada"; /* conteúdo do <main> foi (re)inserido */
export const FORMULARIO_VALIDO = "formulario:valido";   /* formulário passou na validação */

export const TEMA_ALTERADO = "tema:alterado";       /* o tema de cores mudou */

export function emitir(nome, detalhe = {}) {
  document.dispatchEvent(new CustomEvent(nome, { detail: detalhe }));
}

export function ouvir(nome, funcao) {
  document.addEventListener(nome, funcao);
}
