# Request routing

Traefik reads its dynamic configuration from
`Infrastructure/traefik/dynamic.yaml`. Compose publishes Traefik's internal
port 80 as `127.0.0.1:8088`.

| Incoming request | Router | Destination |
| --- | --- | --- |
| `Host(app.localhost)` and `PathPrefix(/api)` | `api` | `http://backend:8000` |
| `Host(app.localhost)` | `frontend` | `http://frontend:5173` |
| `Host(auth.localhost)` | `keycloak` | `http://keycloak:8080` |

The API router has priority `100`. Therefore
`http://app.localhost:8088/api/me` reaches FastAPI even though it also matches
the broader frontend host rule. Browser routes such as `/dashboard` go to Vite,
which returns the React application.

## Public and internal Keycloak addresses

Browser redirects and token issuers use `http://auth.localhost:8088`, the
public address routed by Traefik. FastAPI retrieves signing keys directly at
`http://keycloak:8080/.../certs` because both containers share the Compose
network. This internal request bypasses Traefik, while the token issuer remains
the public URL and must match exactly during validation.

Mailpit's web interface at `http://localhost:8025` also bypasses Traefik. SMTP
delivery from Keycloak uses the internal address `mailpit:1025`.
