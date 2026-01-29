# zeofinance (Vite + React)

## Rodar local

```bash
npm install
npm run dev
```

## Publicar no GitHub Pages (repo: zoeplatform/zeofinance)

1. Garanta que o arquivo `vite.config.js` tem `base: "/zeofinance/"`.
2. Build + deploy:

```bash
npm run build
npm run deploy
```

O comando `deploy` publica a pasta `dist/` na branch `gh-pages`.

## Observações

- `node_modules/` e `dist/` não vão para o repositório (ver `.gitignore`).
- O projeto usa `HashRouter` para evitar erro de rota/refresh no GitHub Pages.
