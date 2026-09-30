/* ==========================================================
   main.js - Orquestrador da aplicação (ES Modules)
   Apenas importa os módulos e os inicia na ordem certa.
   Não contém regras de negócio.
   ========================================================== */
import { emitir, PAGINA_RENDERIZADA } from "./modulos/eventos.js";
import { configurarDatas } from "./modulos/datas.js";
import { iniciarMenu } from "./modulos/menu.js";
import { iniciarPreferencias } from "./modulos/preferencias.js";
import { iniciarTemplates } from "./modulos/templates.js";
import { iniciarFormularios } from "./modulos/formularios.js";
import { iniciarCadastros } from "./modulos/cadastros.js";
import { iniciarGrafico } from "./modulos/grafico.js";
import { iniciarRoteador } from "./modulos/roteador.js";

configurarDatas();
iniciarMenu();
iniciarPreferencias();
iniciarTemplates();
iniciarFormularios();
iniciarCadastros();
iniciarGrafico();
iniciarRoteador();

/* Primeira renderização: os módulos reagem como em uma troca de página */
emitir(PAGINA_RENDERIZADA);
