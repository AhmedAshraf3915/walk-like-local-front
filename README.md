# Walk Like Local Frontend

## Deployment Readiness

The app is configured for GitHub Pages deployment under:

- `/walk-like-local-front/`

Routing and static asset paths are already aligned with this base path.

## Environment Variables

Create a local environment file from `.env.example` and set:

- `VITE_API_BASE_URL`: backend API base URL.

For GitHub Actions deployment, set repository variable:

- `VITE_API_BASE_URL` in `Settings -> Secrets and variables -> Actions -> Variables`.

## Local Validation

Run these commands before deployment:

```bash
npm ci
npm run lint
npm run build
```

## Deployment Options

Use one deployment strategy only.

### Option A: GitHub Actions (recommended)

This repository includes workflow:

- `.github/workflows/gh-pages.yml`

Deploy is triggered on push to `main` and publishes `dist` to `gh-pages` branch.

### Option B: Manual CLI deploy

```bash
npm run deploy
```

This uses `gh-pages -d dist` and also publishes to `gh-pages`.

Do not use both methods in parallel with different configs.
