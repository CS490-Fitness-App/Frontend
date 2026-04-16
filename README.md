## CS490 Fitness App Frontend

## Local Auth0 + Backend Setup

1. Copy `.env.example` to `.env`.
2. Fill in your Auth0 values:
	- `VITE_AUTH0_DOMAIN`
	- `VITE_AUTH0_CLIENT_ID`
	- `VITE_AUTH0_AUDIENCE`
3. Keep backend running at `http://127.0.0.1:8000` (or update `VITE_API_BASE_URL`).

When a user logs in or signs up, frontend now:

1. Authenticates with Auth0.
2. Gets an Auth0 access token.
3. Calls backend `/auth/login` with Bearer token.
4. Backend creates or returns local user and role entity.

Run frontend:

```bash
npm install
npm run dev
```

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
