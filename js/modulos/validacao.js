/* ==========================================================
   validacao.js - Regras de consistência e máscaras (puras)
   Não altera a tela: só calcula textos de erro e formatos.
   ========================================================== */

export const soDigitos = (valor) => valor.replace(/\D/g, "");

export function cpfValido(cpf) {
  const d = soDigitos(cpf);
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false; /* 11 dígitos, não repetidos */
  const digito = function (n) {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += Number(d[i]) * (n + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10]);
}

export const mascaras = {
  cpf: function (valor) {
    const d = soDigitos(valor).slice(0, 11);
    let saida = d.slice(0, 3);
    if (d.length > 3) saida += "." + d.slice(3, 6);
    if (d.length > 6) saida += "." + d.slice(6, 9);
    if (d.length > 9) saida += "-" + d.slice(9, 11);
    return saida;
  },
  telefone: function (valor) {
    const d = soDigitos(valor).slice(0, 11);
    if (!d) return "";
    let saida = "(" + d.slice(0, 2);
    if (d.length > 2) {
      const resto = d.slice(2);
      const corte = resto.length > 8 ? 5 : 4;
      saida += ") " + resto.slice(0, corte);
      if (resto.length > corte) saida += "-" + resto.slice(corte);
    }
    return saida;
  },
  cep: function (valor) {
    const d = soDigitos(valor).slice(0, 8);
    return d.length > 5 ? d.slice(0, 5) + "-" + d.slice(5) : d;
  },
};

/* Devolve o texto do erro do campo ou "" quando o valor é consistente */
export function mensagemDeErro(campo) {
  const form = campo.form;
  const valor = campo.value.trim();

  if (campo.type === "checkbox") {
    return campo.required && !campo.checked ? "Você precisa aceitar os termos de uso." : "";
  }
  if (campo.type === "radio") {
    const grupo = form.querySelectorAll('input[name="' + campo.name + '"]');
    const marcado = Array.from(grupo).some((r) => r.checked);
    return campo.required && !marcado ? "Escolha uma das opções." : "";
  }

  if (campo.required && !valor) {
    const rotulo = form.querySelector('label[for="' + campo.id + '"]');
    const nome = rotulo ? rotulo.textContent.trim().toLowerCase() : "este campo";
    return "Preencha o campo " + nome + ".";
  }
  if (!valor) return ""; /* campo opcional vazio */

  switch (campo.name) {
    case "nome":
      if (campo.id === "nome" && valor.split(/\s+/).length < 2) return "Informe nome e sobrenome.";
      break;
    case "email":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) return "Informe um e-mail válido, como nome@exemplo.com.";
      break;
    case "nascimento": {
      const data = new Date(valor + "T00:00:00");
      if (isNaN(data) || data.getFullYear() < 1900) return "Informe uma data válida.";
      if (data > new Date()) return "A data de nascimento não pode ser futura.";
      break;
    }
    case "cpf":
      if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(valor)) return "Use o formato 000.000.000-00.";
      if (!cpfValido(valor)) return "CPF inválido. Confira os dígitos.";
      break;
    case "telefone":
      if (!/^\(\d{2}\) \d{4,5}-\d{4}$/.test(valor)) return "Use o formato (11) 99999-9999.";
      break;
    case "cep":
      if (!/^\d{5}-\d{3}$/.test(valor)) return "Use o formato 00000-000.";
      break;
    case "mensagem":
      if (valor.length < 10) return "Escreva ao menos 10 caracteres.";
      break;
  }
  return "";
}
