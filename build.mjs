/* ==========================================================
   build.mjs - Build de produção do Cidade Ativa
   - JS: o esbuild junta os módulos ES em um único arquivo e minifica
   - CSS: o esbuild minifica a folha de estilos
   - HTML: o html-minifier-terser remove comentários e espaços extras
   - imagens: copiadas sem alteração
   A saída vai para a pasta dist/, com a mesma estrutura do projeto
   (dist/html, dist/css, dist/js, dist/imagens), então os caminhos
   relativos das páginas continuam valendo.
   Uso: npm run build
   ========================================================== */
import { build } from "esbuild";
import { minify } from "html-minifier-terser";
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";

const SAIDA = "dist";

/* Tudo o que é gerado aqui precisa ser seguro para este projeto:
   - o JS usa ES Modules, então o formato de saída continua "esm";
   - Chart.js e Day.js vêm por CDN (variáveis globais), logo não entram no bundle;
   - no HTML NÃO se removem aspas nem atributos "redundantes" (type="text"),
     porque o CSS e o JS selecionam campos por input[type="text"]. */
const OPCOES_HTML = {
  collapseWhitespace: true,
  removeComments: true,
  minifyCSS: true,
  minifyJS: true,
};

async function arquivosDe(pasta, extensao) {
  const nomes = await readdir(pasta, { recursive: true });
  return nomes.filter((n) => n.endsWith(extensao)).map((n) => path.join(pasta, n));
}

async function tamanho(arquivos) {
  let bruto = 0;
  let gzip = 0;
  for (const arquivo of arquivos) {
    const conteudo = await readFile(arquivo);
    bruto += conteudo.length;
    gzip += gzipSync(conteudo).length;
  }
  return { bruto, gzip };
}

const fmt = (n) => (n / 1024).toFixed(1).padStart(6) + " KB";
const reducao = (antes, depois) => (((antes - depois) / antes) * 100).toFixed(1).padStart(5) + "%";

await rm(SAIDA, { recursive: true, force: true });
await mkdir(SAIDA, { recursive: true });

/* 1) JavaScript: bundle + minificação */
await build({
  entryPoints: ["js/main.js"],
  bundle: true,
  minify: true,
  format: "esm",
  target: "es2020",
  legalComments: "none",
  outfile: `${SAIDA}/js/main.js`,
  logLevel: "warning",
});

/* 2) CSS: minificação */
await build({
  entryPoints: ["css/style.css"],
  minify: true,
  outfile: `${SAIDA}/css/style.css`,
  logLevel: "warning",
});

/* 3) HTML: minificação de cada página */
await mkdir(`${SAIDA}/html`, { recursive: true });
for (const pagina of await arquivosDe("html", ".html")) {
  const origem = await readFile(pagina, "utf-8");
  await writeFile(path.join(SAIDA, pagina), await minify(origem, OPCOES_HTML));
}

/* 4) Imagens: cópia direta */
await cp("imagens", `${SAIDA}/imagens`, { recursive: true });

/* 5) Relatório de tamanhos (antes x depois) */
const relatorio = [
  ["HTML", await arquivosDe("html", ".html"), await arquivosDe(`${SAIDA}/html`, ".html")],
  ["CSS", ["css/style.css"], [`${SAIDA}/css/style.css`]],
  ["JS", await arquivosDe("js", ".js"), [`${SAIDA}/js/main.js`]],
];
console.log("\nRelatório do build (tamanho bruto e com gzip)\n");
console.log("tipo  arquivos   antes      depois     redução |  gzip antes  gzip depois  redução");
let totalAntes = 0;
let totalDepois = 0;
for (const [tipo, antes, depois] of relatorio) {
  const a = await tamanho(antes);
  const d = await tamanho(depois);
  totalAntes += a.bruto;
  totalDepois += d.bruto;
  console.log(
    `${tipo.padEnd(5)} ${String(antes.length).padStart(2)} -> ${depois.length}  ${fmt(a.bruto)}  ${fmt(d.bruto)}  ${reducao(a.bruto, d.bruto)} | ${fmt(a.gzip)}   ${fmt(d.gzip)}   ${reducao(a.gzip, d.gzip)}`
  );
}
console.log(`TOTAL        ${fmt(totalAntes)}  ${fmt(totalDepois)}  ${reducao(totalAntes, totalDepois)}`);
const pasta = await stat(SAIDA);
console.log(`\nBuild concluído em ${SAIDA}/ (${pasta.isDirectory() ? "ok" : "erro"}).`);
