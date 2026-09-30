# Cidade Ativa

Site institucional da ONG **Cidade Ativa**, dedicada ao registro e à resolução colaborativa de problemas urbanos.
Projeto de front-end com HTML5 semântico, CSS (Grid, Flexbox e design system com variáveis) e JavaScript modular (ES Modules).

## Como executar

Abra a pasta no VS Code e use a extensão **Live Server** em `html/index.html`.
É necessário servir por HTTP (não abrir o arquivo com duplo clique), pois o projeto usa ES Modules e `fetch`.

## Estrutura

```
cidade-ativa/
├── html/        páginas (index, projetos e cadastro)
├── css/         folha de estilos e design system
├── imagens/     imagens e logos (SVG, PNG, JPG e WebP)
└── js/          main.js, dados.js e módulos em js/modulos/
```

## Fluxo de branches (GitFlow)

| Branch | Uso |
|---|---|
| `main` | versões de lançamento, marcadas com tags |
| `develop` | integração do desenvolvimento contínuo |
| `feature/*` | novas funcionalidades, criadas a partir de `develop` |
| `release/*` | preparação de versões, integradas a `main` e `develop` |
| `hotfix/*` | correções urgentes criadas a partir de `main` |
