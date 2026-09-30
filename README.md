# Cidade Ativa

Site institucional da ONG **Cidade Ativa**, dedicada ao registro e à resolução colaborativa de problemas urbanos.
Projeto de front-end desenvolvido como atividade prática de faculdade, com foco em semântica, acessibilidade, responsividade e JavaScript modular.

## Visão geral

- **Três páginas:** início (apresentação e contato), projetos (voluntariado e campanhas de doação) e cadastro.
- **Navegação SPA:** troca de página sem recarregar o documento.
- **Formulários com validação em tempo real:** CPF, telefone, CEP, e-mail e data, com mensagens junto aos campos.
- **Persistência no navegador:** tamanho do texto, rascunho do cadastro e histórico de envios (`localStorage`).
- **Gráfico do andamento das campanhas** e datas relativas em português.
- **Acessibilidade:** HTML semântico, `alt` nas imagens, foco visível, menu acessível por teclado e suporte a leitores de tela.

## Tecnologias utilizadas

| Camada | Tecnologia |
|---|---|
| Estrutura | HTML5 semântico |
| Estilo | CSS3: variáveis (design system), Grid de 12 colunas, Flexbox e media queries |
| Comportamento | JavaScript puro (ES Modules), sem framework |
| Build de produção | esbuild (bundle e minificação de JS e CSS) e html-minifier-terser (HTML) |
| Bibliotecas (via CDN) | Chart.js 4.4.1 (gráfico) e Day.js 1.11.10 (datas) |
| Versionamento | Git, GitHub, GitFlow, Conventional Commits e Versionamento Semântico |

## Pré-requisitos

- Navegador moderno (Chrome, Edge, Firefox ou Safari atualizados).
- [Git](https://git-scm.com/) para clonar o repositório.
- [VS Code](https://code.visualstudio.com/) com a extensão **Live Server** (ou Python 3, como alternativa).
- Conexão com a internet, pois Chart.js e Day.js são carregados por CDN.

Para **executar o site** não é necessário instalar Node.js nem pacotes. O [Node.js](https://nodejs.org/) 18 ou superior só é preciso para gerar o build de produção.

## Instalação e execução local

1. Clone o repositório:
   ```bash
   git clone https://github.com/KWillTech/cidade-ativa-faculdade.git
   cd cidade-ativa-faculdade
   ```
2. Abra a pasta no VS Code.
3. Instale a extensão **Live Server** (Ritwick Dey).
4. Clique com o botão direito em `html/index.html` e escolha **Open with Live Server**.

Alternativa sem VS Code, com Python 3, na raiz do projeto:
```bash
python -m http.server 8000
```
Depois acesse `http://localhost:8000/html/index.html`.

> O projeto precisa ser servido por HTTP. Abrir o arquivo com duplo clique não funciona, pois os ES Modules e o `fetch` do roteador exigem um servidor.

## Build e testes

### Build de produção

O build junta os módulos JavaScript em um único arquivo e minifica JS, CSS e HTML, usando **esbuild** e **html-minifier-terser**. A saída vai para `dist/`, com a mesma estrutura de pastas do projeto (`dist/html`, `dist/css`, `dist/js` e `dist/imagens`), então os caminhos relativos continuam válidos.

```bash
npm install
npm run build
```

Para visualizar a versão de produção, sirva a pasta `dist/` por HTTP, por exemplo:

```bash
python -m http.server 8000 --directory dist
```

Depois acesse `http://localhost:8000/html/index.html`. O comando `npm run build` imprime um relatório com os tamanhos antes e depois. Na medição feita no projeto, os 13 arquivos JavaScript viraram 1, e o total passou de 66,5 KB para 39,8 KB (redução de cerca de 40%; 58% no JavaScript com gzip). A versão minificada foi comparada com a de desenvolvimento em um navegador real: as três páginas, nos três temas, ficaram idênticas pixel a pixel.

> A pasta `dist/` é gerada e não é versionada (está no `.gitignore`).

### Testes

Não há suíte de testes automatizados no repositório. A qualidade é verificada com o [W3C Markup Validator](https://validator.w3.org/) (as três páginas sem erros nem avisos) e com testes manuais de navegação, formulários, armazenamento, temas e falhas de rede.

## Estrutura de pastas

```
cidade-ativa-faculdade/
├── html/        páginas (index, projetos e cadastro)
├── css/         folha de estilos e design system
├── imagens/     imagens e logos (SVG, PNG, JPG e WebP)
├── build.mjs    script do build de produção
├── package.json dependências e scripts do build
├── dist/        saída do build (gerada, não versionada)
└── js/
    ├── main.js      orquestrador
    ├── dados.js     fonte de dados
    └── modulos/     roteador, formulários, validação, storage, templates, menu, gráfico e datas
```

## Versionamento

- **GitFlow:** `main` (versões de lançamento, com tags), `develop` (integração), `feature/*` (novas funcionalidades), `release/*` (preparação de versões) e `hotfix/*` (correções urgentes a partir de `main`).
- **Conventional Commits:** mensagens padronizadas, como `feat:`, `fix:`, `docs:` e `chore:`, por exemplo `feat: roteador SPA e sistema de templates`.
- **Versionamento Semântico (MAJOR.MINOR.PATCH):** correção compatível aumenta o PATCH (`1.0.1`), funcionalidade nova compatível aumenta o MINOR (`1.1.0`) e mudança incompatível aumenta o MAJOR. Cada versão é marcada com uma tag anotada, como `v1.0.0`.
- **Pull requests:** as integrações entre branches são feitas por PR, com descrição do motivo e da implementação, vinculadas a issues e milestones.
