/* ==========================================================
   cadastros.js - Dados do cadastro: rascunho e histórico
   Usa storage.js para persistir e templates.js para exibir.
   Recebe o aviso de envio pelo evento FORMULARIO_VALIDO.
   ========================================================== */
import { lerStorage, gravarStorage, removerStorage } from "./storage.js";
import { registrarFonte, renderizarTemplates } from "./templates.js";
import { formatarData } from "./datas.js";
import { ouvir, FORMULARIO_VALIDO, PAGINA_RENDERIZADA } from "./eventos.js";

const CHAVE_RASCUNHO = "cidadeAtiva:rascunhoCadastro";
const CHAVE_HISTORICO = "cidadeAtiva:historicoCadastros";

/* Campos não sensíveis que podem ficar no rascunho (sem CPF, telefone, CEP, endereço e nascimento) */
const CAMPOS_RASCUNHO = ["nome", "email", "cidade", "estado", "interesse"];
const ROTULO_INTERESSE = { voluntariado: "Voluntariado", doacao: "Doação" };

function ehFormCadastro(form) {
  return Boolean(form && form.querySelector("#cpf"));
}

/* --- Rascunho (objeto) --- */
function salvarRascunho(form) {
  const rascunho = {};
  CAMPOS_RASCUNHO.forEach(function (nome) {
    const campos = form.querySelectorAll('[name="' + nome + '"]');
    if (campos.length === 0) return;
    if (campos[0].type === "radio") {
      const marcado = Array.from(campos).find((r) => r.checked);
      rascunho[nome] = marcado ? marcado.value : "";
    } else {
      rascunho[nome] = campos[0].value;
    }
  });
  gravarStorage(CHAVE_RASCUNHO, rascunho);
}

function restaurarRascunho() {
  const form = document.querySelector("form");
  if (!ehFormCadastro(form)) return;
  const rascunho = lerStorage(CHAVE_RASCUNHO, null);
  if (!rascunho || typeof rascunho !== "object") return;

  CAMPOS_RASCUNHO.forEach(function (nome) {
    const valor = rascunho[nome];
    if (typeof valor !== "string" || !valor) return; /* ignora tipos inesperados */
    const campos = form.querySelectorAll('[name="' + nome + '"]');
    if (campos.length && campos[0].type === "radio") {
      const alvo = Array.from(campos).find((r) => r.value === valor);
      if (alvo) alvo.checked = true;
    } else if (campos.length) {
      campos[0].value = valor;
    }
  });
}

/* --- Histórico (array) --- */
function registrarCadastro(form) {
  const interesse = form.querySelector('[name="interesse"]:checked');
  const atual = lerStorage(CHAVE_HISTORICO, []);
  const historico = Array.isArray(atual) ? atual : []; /* dado corrompido vira lista vazia */
  historico.unshift({
    nome: form.querySelector('[name="nome"]').value.trim(),
    interesse: interesse ? interesse.value : "",
    data: new Date().toISOString(),
  });
  gravarStorage(CHAVE_HISTORICO, historico.slice(0, 5)); /* guarda os 5 mais recentes */
  removerStorage(CHAVE_RASCUNHO); /* cadastro concluído: descarta o rascunho */
}

/* Converte o array salvo em itens prontos para o template (ignora itens inválidos) */
function historicoParaExibir() {
  const salvo = lerStorage(CHAVE_HISTORICO, []);
  if (!Array.isArray(salvo)) return [];
  return salvo
    .filter((item) => item && typeof item === "object" && typeof item.nome === "string")
    .map(function (item) {
      const dataValida = typeof item.data === "string" && !isNaN(Date.parse(item.data));
      return {
        nome: item.nome,
        interesse: ROTULO_INTERESSE[item.interesse] || "Sem interesse informado",
        data: dataValida ? formatarData(item.data) : "data não registrada",
      };
    });
}

function atualizarBlocoHistorico() {
  const bloco = document.getElementById("historico");
  if (bloco) bloco.hidden = historicoParaExibir().length === 0;
}

export function iniciarCadastros() {
  registrarFonte("historico", historicoParaExibir);

  /* input e change: mantêm o rascunho atualizado */
  ["input", "change"].forEach(function (tipo) {
    document.addEventListener(tipo, function (evento) {
      const form = evento.target.form;
      if (ehFormCadastro(form)) salvarRascunho(form);
    });
  });

  /* envio válido: registra no histórico e atualiza a lista */
  ouvir(FORMULARIO_VALIDO, function (evento) {
    const form = evento.detail.form;
    if (!ehFormCadastro(form)) return;
    registrarCadastro(form);
    renderizarTemplates();
    atualizarBlocoHistorico();
  });

  /* botão "Limpar histórico" */
  document.addEventListener("click", function (evento) {
    if (!evento.target.closest("#limpar-historico")) return;
    removerStorage(CHAVE_HISTORICO);
    renderizarTemplates();
    atualizarBlocoHistorico();
  });

  /* nova página: restaura o rascunho e mostra/oculta o histórico */
  ouvir(PAGINA_RENDERIZADA, function () {
    restaurarRascunho();
    atualizarBlocoHistorico();
  });
}
