/* ==========================================================
   otimizar-imagens.mjs - Otimização das imagens do site
   Lê as fotos originais em imagens/originais/ e gera, em imagens/,
   versões em WebP (mais leve) e JPEG (reserva), em várias larguras,
   para o navegador escolher a mais adequada com srcset e sizes.
   Regras:
   - nunca amplia: só gera larguras menores ou iguais à original;
   - corrige a orientação do EXIF e remove metadados (menos bytes);
   - comprime os logos em PNG (reserva do SVG) sem perda visível.
   Uso: npm run imagens
   ========================================================== */
import sharp from "sharp";
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ORIGENS = "imagens/originais";
const DESTINO = "imagens";
const LARGURAS = [480, 800, 1200, 1600];
const QUALIDADE = 78; /* bom equilíbrio entre nitidez e peso para fotos */

const kb = (n) => (n / 1024).toFixed(1).padStart(7) + " KB";
const pct = (antes, depois) => (((antes - depois) / antes) * 100).toFixed(1).padStart(5) + "%";

await mkdir(DESTINO, { recursive: true });

/* 1) Fotos: várias larguras em WebP e JPEG */
const fotos = (await readdir(ORIGENS)).filter((n) => /\.(jpe?g)$/i.test(n));
for (const nome of fotos) {
  const origem = path.join(ORIGENS, nome);
  const base = path.parse(nome).name;
  const meta = await sharp(origem).metadata();
  const tamOriginal = (await stat(origem)).size;
  const larguras = LARGURAS.filter((l) => l <= meta.width);
  if (larguras.length === 0) larguras.push(meta.width); /* original menor que 480px */

  console.log(`\n${nome}: ${meta.width}x${meta.height}, ${kb(tamOriginal)} (original)`);
  console.log("variante               tamanho    economia vs original");
  for (const largura of larguras) {
    const imagem = () => sharp(origem).rotate().resize({ width: largura, withoutEnlargement: true });
    const webp = await imagem().webp({ quality: QUALIDADE, effort: 6 }).toBuffer();
    const jpg = await imagem().jpeg({ quality: QUALIDADE, mozjpeg: true, progressive: true }).toBuffer();
    await writeFile(path.join(DESTINO, `${base}-${largura}.webp`), webp);
    await writeFile(path.join(DESTINO, `${base}-${largura}.jpg`), jpg);
    console.log(`${base}-${largura}.webp`.padEnd(22), kb(webp.length), "  ", pct(tamOriginal, webp.length));
    console.log(`${base}-${largura}.jpg`.padEnd(22), kb(jpg.length), "  ", pct(tamOriginal, jpg.length));
  }

  /* trecho pronto para colar no HTML */
  const altura = Math.round((larguras.at(-1) / meta.width) * meta.height);
  const lista = (ext) => larguras.map((l) => `../imagens/${base}-${l}.${ext} ${l}w`).join(", ");
  console.log(`\nTrecho para o HTML (ajuste o alt e o sizes ao layout):
<picture>
  <source type="image/webp" srcset="${lista("webp")}" sizes="100vw">
  <img src="../imagens/${base}-${larguras.at(-1)}.jpg" srcset="${lista("jpg")}" sizes="100vw"
       alt="DESCREVA A IMAGEM" width="${larguras.at(-1)}" height="${altura}" decoding="async">
</picture>`);
}

/* 2) Logos em PNG (reserva do SVG): paleta de cores, sem perda visível */
const pastaLogos = path.join(DESTINO, "logos");
console.log("\nLogos PNG (reserva do SVG)");
for (const nome of (await readdir(pastaLogos)).filter((n) => n.endsWith(".png"))) {
  const arquivo = path.join(pastaLogos, nome);
  const antes = (await stat(arquivo)).size;
  const otimizado = await sharp(arquivo).png({ palette: true, quality: 90, compressionLevel: 9, effort: 10 }).toBuffer();
  if (otimizado.length < antes) await writeFile(arquivo, otimizado);
  console.log(nome.padEnd(48), kb(antes), "->", kb(Math.min(antes, otimizado.length)), pct(antes, Math.min(antes, otimizado.length)));
}
