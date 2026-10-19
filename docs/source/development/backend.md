# Backend development

The backend is a Python package managed by `uv`. Its implementation lives in
`Backend/src/backend/`, and its tests live in `Backend/tests/`.

`backend.api` creates the FastAPI application and currently exposes:

- `GET /api/health` without authentication;
- `GET /api/me` for any valid MicroSift access token; and
- `GET /api/approved` for tokens containing the `approved` realm role.

From `Backend/`, install dependencies and run the test suite:

```bash
uv sync
uv run python -m unittest discover -s tests
```

In Compose, the backend starts Uvicorn with reload enabled. The source directory
is mounted at `/app`, while the environment is stored in a named volume.

## Authentication configuration

The backend reads `KEYCLOAK_ISSUER`, `KEYCLOAK_JWKS_URL`, and
`KEYCLOAK_AUDIENCE`. Public token claims use the browser-facing issuer, while
JWKS retrieval uses Keycloak's internal Compose address. See
[protected API access](../authentication/api-access.md) before adding a new
protected endpoint.
