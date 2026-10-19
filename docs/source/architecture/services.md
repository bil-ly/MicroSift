# Service catalog

All six services share the default Compose network. Only interfaces needed by
the host are published; service-to-service traffic uses Compose DNS names.

| Service | Responsibility | Internal port | Host interface |
| --- | --- | ---: | --- |
| `traefik` | HTTP reverse proxy and routing | 80 | `127.0.0.1:8088` |
| `frontend` | Vite development server for React | 5173 | Through Traefik |
| `backend` | FastAPI application | 8000 | Through Traefik at `/api` |
| `keycloak` | OIDC identity, sessions, users, and roles | 8080 | Through Traefik at `auth.localhost` |
| `postgres` | Keycloak persistence | 5432 | `127.0.0.1:${POSTGRES_PORT}` |
| `mailpit` | Development SMTP capture and message viewer | 1025 / 8025 | `127.0.0.1:8025` for the UI |

## Data and dependency flow

The `keycloak` container waits for PostgreSQL's health check. The frontend and
backend source directories are mounted into their containers for development.
Named volumes preserve PostgreSQL data and dependency installations between
starts.

The backend fetches JSON Web Key Sets (JWKS) from `keycloak:8080` and caches the
key client in-process. It still validates the public issuer
`http://auth.localhost:8088/realms/microsift`, because that is the issuer found
in browser-facing tokens.

See [request routing](routing.md) for the host and path rules.
