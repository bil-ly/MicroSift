# Protected API access and logout

React sends the access token in `Authorization: Bearer <access_token>` when it
loads the dashboard profile. Traefik gives `/api` requests priority over the
frontend router and forwards them to FastAPI.

## Token validation

FastAPI selects a public signing key from Keycloak's JWKS endpoint, then
validates:

- the RS256 signature and allowed algorithm;
- expiration;
- issuer `http://auth.localhost:8088/realms/microsift`;
- audience `microsift-api`; and
- required `exp`, `iss`, `aud`, and `sub` claims.

The `PyJWKClient` is cached in-process. A missing or invalid access token yields
`401 Unauthorized`. A valid token proves authentication, but protected
operations still require authorization.

```{figure} ../_static/diagrams/detailed/04-dashboard.png
:alt: Flowchart showing the dashboard API request, token validation, and pending or approved response

Current dashboard access through `/api/me`.
```

## Current endpoints

| Endpoint | Token | Result |
| --- | --- | --- |
| `GET /api/health` | Not required | `200` with `{"status":"ok"}` |
| `GET /api/me` | Valid token | Username plus `pending` or `approved` |
| `GET /api/approved` | Valid token with `approved` role | `200`; otherwise `403 Forbidden` |

A `401` means authentication failed. A `403` means the token is valid but its
identity lacks the required authorization. The dashboard hides its content
while `/api/me` reports `pending`.

```{figure} ../_static/diagrams/detailed/06-api-outcomes-logout.png
:alt: Flowchart comparing the health endpoint, approved endpoint outcomes, and logout

Public health, role-protected access, and logout outcomes.
```

## Planned analysis boundary

The following high-level diagram includes a MongoDB-backed analysis path. That
path is **planned architecture**, not current functionality. The repository
currently implements only the three endpoints listed above, and no MongoDB
service is present in Compose.

```{figure} ../_static/diagrams/high-level/03-login-and-access.png
:alt: Sequence diagram of login, token validation, role checks, and a planned MongoDB analysis request

High-level login and protected-access design. The MongoDB analysis portion is a
future extension.
```

After approval, obtain a new token before retrying. Existing tokens do not gain
new realm roles retroactively.
