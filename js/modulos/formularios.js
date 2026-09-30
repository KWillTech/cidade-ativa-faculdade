/* ==========================================================
   formularios.js - Comportamento e feedback visual dos formulários
   Usa as regras de validacao.js e avisa os demais módulos por
   evento (FORMULARIO_VALIDO); não conhece storage nem histórico.
   ========================================================== */
import { mensagemDeErro, mascaras } from "./validacao.js";
import { emitir, ouvir, FORMULARIO_VALIDO, PAGINA_RENDERIZADA } from "./eventos.js";

function mostrarMensagem(form, tipo, texto) {
  let aviso = form.querySelector(".mensagem-form");
  if (!aviso) {
    aviso = document.createElement("p");
    aviso.setAttribute("role", "status");
    form.append(aviso);
  }
  aviso.className = "mensagem-form " + tipo;
  aviso.textContent = texto;
}

/* Notificação visual: classes, aria e mensagem injetada no DOM */
function validarCampo(campo) {
  const erro = mensagemDeErro(campo);
  campo.setCustomValidity(erro);

  const grupo = campo.type === "radio"
    ? Array.from(campo.form.querySelectorAll('input[name="' + campo.name + '"]'))
    : [campo];
  const chave = campo.type === "radio" ? campo.name : campo.id;
  const idAviso = "erro-" + chave;
  let aviso = document.getElementById(idAviso);

  if (erro) {
    if (!aviso) {
      aviso = document.createElement("small");
      aviso.id = idAviso;
      aviso.className = "erro-campo";
      const ancora = campo.type === "radio"
        ? grupo[grupo.length - 1].closest(".opcao")
        : campo.type === "checkbox" ? campo.closest(".opcao") : campo;
      ancora.insertAdjacentElement("afterend", aviso);
    }
    aviso.textContent = erro;
  } else if (aviso) {
    aviso.remove();
  }

  grupo.forEach(function (c) {
    c.classList.toggle("campo-invalido", Boolean(erro));
    c.classList.toggle("campo-valido", !erro);
    if (erro) {
      c.setAttribute("aria-invalid", "true");
      c.setAttribute("aria-describedby", idAviso);
    } else {
      c.removeAttribute("aria-invalid");
      c.removeAttribute("aria-describedby");
    }
  });
  return erro;
}

function camposDoFormulario(form) {
  return Array.from(form.querySelectorAll("input, select, textarea")).filter(function (c, i, todos) {
    if (c.type === "submit" || c.type === "button") return false;
    return c.type !== "radio" || todos.findIndex((o) => o.type === "radio" && o.name === c.name) === i;
  });
}

function validarFormulario(form) {
  return camposDoFormulario(form).filter((campo) => validarCampo(campo) !== "");
}

function limparValidacao(form) {
  form.querySelectorAll(".erro-campo").forEach((el) => el.remove());
  form.querySelectorAll(".campo-invalido, .campo-valido").forEach(function (c) {
    c.classList.remove("campo-invalido", "campo-valido");
    c.removeAttribute("aria-invalid");
    c.removeAttribute("aria-describedby");
    c.setCustomValidity("");
  });
}

/* Desliga os balões nativos: o script passa a exibir as mensagens */
function prepararFormularios() {
  document.querySelectorAll("form").forEach((f) => { f.noValidate = true; });
}

export function iniciarFormularios() {
  /* submit: impede o envio/recarregamento e valida todos os campos */
  document.addEventListener("submit", function (evento) {
    const form = evento.target;
    evento.preventDefault();
    const invalidos = validarFormulario(form);
    if (invalidos.length > 0) {
      mostrarMensagem(form, "erro", "Corrija " + invalidos.length + " campo(s) antes de enviar.");
      invalidos[0].focus();
      return;
    }
    emitir(FORMULARIO_VALIDO, { form }); /* ouvintes leem os valores antes da limpeza */
    form.reset();
    limparValidacao(form);
    mostrarMensagem(form, "sucesso", "Dados enviados com sucesso! (simulação: nenhuma informação saiu do seu navegador)");
  });

  /* focusout: valida o campo assim que o usuário sai dele */
  document.addEventListener("focusout", function (evento) {
    const campo = evento.target;
    if (!campo.form || !campo.matches("input, select, textarea")) return;
    if (["submit", "button", "radio", "checkbox"].includes(campo.type)) return;
    validarCampo(campo);
  });

  /* input: máscara em CPF, telefone e CEP e revalidação em tempo real */
  document.addEventListener("input", function (evento) {
    const campo = evento.target;
    if (!campo.form) return;
    const aviso = campo.form.querySelector(".mensagem-form");
    if (aviso) aviso.remove();
    const mascara = mascaras[campo.name];
    if (mascara) campo.value = mascara(campo.value);
    if (campo.classList.contains("campo-invalido") || campo.classList.contains("campo-valido")) {
      validarCampo(campo);
    }
  });

  /* change: valida select, checkbox, radio e data */
  document.addEventListener("change", function (evento) {
    if (evento.target.form) validarCampo(evento.target);
  });

  ouvir(PAGINA_RENDERIZADA, prepararFormularios);
}
