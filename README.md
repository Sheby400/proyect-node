# E-Commerce Monorepo

Monorepo evolutivo para el backend de las sesiones y el frontend en Nuxt 4.

## Estructura

```text
apps/
├── api/  # Backend Node.js + Express + Firebase descrito en los MD
└── web/  # Frontend Nuxt 4 + Vue 3 + TypeScript + Pinia + Tailwind CSS
```

## Ejecutar frontend

```bash
npm install
cp apps/web/.env.example apps/web/.env
npm run dev:web
```

Por defecto el frontend consume:

```text
http://localhost:4050/api/v1
```

Si tu backend usa otro puerto, cambia `NUXT_PUBLIC_API_BASE_URL` en `apps/web/.env`.

## Scripts principales

```bash
npm run dev:web
npm run typecheck:web
npm run lint:web
npm run build:web
npm run test:e2e:web
```
