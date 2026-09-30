/* ==========================================================
   storage.js - Camada de persistência (Web Storage)
   Só sabe ler e gravar JSON no localStorage. Não conhece
   formulários, telas nem regras de negócio.
   ========================================================== */

/* GET: lê a string, converte com JSON.parse e devolve um padrão em caso de erro */
export function lerStorage(chave, padrao) {
  try {
    const texto = localStorage.getItem(chave);
    return texto === null ? padrao : JSON.parse(texto);
  } catch (erro) {
    return padrao; /* JSON corrompido ou storage indisponível */
  }
}

/* SET: converte o valor em string com JSON.stringify e grava */
export function gravarStorage(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch (erro) { /* modo privado ou cota excedida: ignora */ }
}

export function removerStorage(chave) {
  try {
    localStorage.removeItem(chave);
  } catch (erro) { /* ignora */ }
}
