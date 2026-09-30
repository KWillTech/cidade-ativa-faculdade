/* ==========================================================
   datas.js - Integração com a biblioteca Day.js (CDN)
   Com alternativa nativa caso a biblioteca não carregue.
   ========================================================== */

export function configurarDatas() {
  if (typeof dayjs === "undefined") return;
  if (window.dayjs_plugin_relativeTime) dayjs.extend(window.dayjs_plugin_relativeTime);
  dayjs.locale("pt-br");
}

export function formatarData(iso) {
  if (typeof dayjs === "undefined") return new Date(iso).toLocaleString("pt-BR");
  const data = dayjs(iso);
  const absoluta = data.format("DD/MM/YYYY HH:mm");
  return typeof data.fromNow === "function" ? data.fromNow() + ", " + absoluta : absoluta;
}
