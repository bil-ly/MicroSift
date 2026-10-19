# Frontend development

The frontend is a React and TypeScript application built with Vite. Application
source lives in `Frontend/src/`; Vitest and Testing Library cover browser-facing
behavior.

From `Frontend/`:

```bash
npm install
npm run dev
npm run lint
npm test -- --run
npm run build
```

`src/auth.ts` owns the `keycloak-js` adapter, initialization, and token refresh.
`src/App.tsx` owns the home, login, and dashboard UI states. Keep credentials
out of React: registration and login must continue to redirect to Keycloak.

The Compose development server listens internally on port `5173`; open it
through Traefik at <http://app.localhost:8088>. Direct host ports for Vite are
not part of the current Compose configuration.
