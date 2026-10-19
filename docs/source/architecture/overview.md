# System overview

MicroSift is a browser application with a single local HTTP entrypoint.
Traefik receives public requests on host port `8088`, chooses a route from the
hostname and path, and forwards the request across the Compose network.

## Request path

1. A browser opens `http://app.localhost:8088`.
2. Traefik forwards ordinary application paths to Vite, which serves the React
   application.
3. React initializes `keycloak-js` in the browser and uses
   `http://auth.localhost:8088` for authentication.
4. Requests beginning with `/api` take Traefik's higher-priority API route to
   FastAPI instead of Vite.
5. FastAPI validates bearer tokens with Keycloak's signing keys before serving
   protected endpoints.

Keycloak owns credentials, login sessions, email-verification state, and realm
role mappings. It persists those records in PostgreSQL. MicroSift's React and
FastAPI code never receives an application user's password.

Mailpit is a development-only SMTP sink. Keycloak sends verification messages
to it on the internal Compose network; developers read captured mail through
the separately published Mailpit web interface.

## Security boundaries

Authentication answers who the user is. Email verification confirms control of
an address. Manual approval assigns the `approved` realm role. Authorization in
FastAPI decides whether the validated token has that role. These are separate
gates: passing one does not imply passing the next.

Continue with the [service catalog](services.md), [request routing](routing.md),
or the [authentication overview](../authentication/overview.md).
