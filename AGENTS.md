# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a static React 18 e-commerce demo (Google merch store). There is **no backend** — all product data lives in `src/data/products.json` and state is managed via React Context + localStorage. The only service to run is the Webpack dev server.

### Running the app

- `npm start` — starts `webpack-dev-server` on **port 3000** (the README says 8080 but `webpack.config.js` sets port 3000)
- `npm run build` — production build to `dist/`

### Testing

- **Unit tests** (`npm run test:ut`): All tests require the proprietary `@evinced/unit-tester` package hosted on a private JFrog registry (`evinced.jfrog.io`). Without registry credentials, these tests cannot run.
- **E2E tests** (`npm run test:e2e`): Require `@evinced/js-playwright-sdk` (same private registry) plus `EVINCED_SERVICE_ID` and `EVINCED_API_KEY` env vars. Also needs `npx playwright install chromium`.
- There is **no standalone lint script** (`eslint` is not configured). The `npm run build` command is the primary static check.

### Dependency installation caveat

The `@evinced/unit-tester` and `@evinced/js-playwright-sdk` packages are hosted on a private JFrog registry (`evinced.jfrog.io`). Running `npm install` directly will fail with a 404 or 401 error. The update script handles this by temporarily removing those entries, installing the remaining deps, then restoring the original files from git.

If valid JFrog credentials are provided via a `jfrog npmrc` secret, you can write them to `/workspace/.npmrc` and run `npm install` directly instead. Currently the provided token returns 401 (likely expired).
