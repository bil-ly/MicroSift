# MicroSift

MicroSift is a React application with a FastAPI backend. PostgreSQL, Keycloak,
and Mailpit run locally alongside it.

## Prerequisites

- [Task](https://taskfile.dev/installation/)
- Docker with the Compose plugin (or a compatible `docker compose` command)

## Start the app

From the repository root, create your local environment file the first time
you run the project:

```bash
cp .env.example .env
```

Replace the placeholder passwords in `.env`, then start all local services:

```bash
go-task up
```

## First-time Keycloak setup

Keycloak starts with only the `master` realm. Before using the app's login or
signup buttons, open <http://localhost:8080/admin/> and sign in as `admin`
with `KEYCLOAK_ADMIN_PASSWORD` from `.env`.

1. In the realm dropdown, select **Create realm** and name it exactly
   `microsift`. Make sure the `microsift` realm is selected for the remaining
   steps. A missing realm makes the app's login redirect show **Page not found**.
2. Go to **Clients → Create client**. Choose **OpenID Connect**, set Client ID
   to `microsift-frontend`, set Client authentication **Off**, and keep Standard
   flow **On**. Set Valid redirect URIs to `http://localhost:5173/*` and Web
   origins to `http://localhost:5173`.
3. Go to **Realm settings → Login** and enable **User registration** and
   **Verify email**.
4. Go to **Realm settings → Email**. Set From to
   `noreply@microsift.local`, SMTP host to `mailpit`, and port to `1025`.
   Leave authentication, SSL, and StartTLS off; save and test the connection.
5. Go to **Realm roles** and create `approved`. Do not make it a default role.
6. In the `microsift-frontend` client's dedicated client scope, add an
   **Audience** mapper with Included Custom Audience `microsift-api` and
   **Add to access token** enabled. Keep the default `roles` scope.

Now open <http://localhost:5173>, register a user, and open the verification
message at <http://localhost:8025>. The user remains pending until an admin
assigns the `approved` realm role under **Users → Role mapping**. Sign out and
back in after approval to obtain a token with the new role.

For the full authentication flow, see
[`docs/auth/architecture.md`](docs/auth/architecture.md).

The local service interfaces are available at:

- Keycloak: <http://localhost:8080> (username `admin`; password from
  `KEYCLOAK_ADMIN_PASSWORD` in `.env`)
- Mailpit: <http://localhost:8025>
- FastAPI: <http://localhost:8000/api/health>
- PostgreSQL: `localhost:5432` by default

Vite proxies `/api` requests to FastAPI. `/api/health` is public; `/api/me`
requires a valid Keycloak token and `/api/approved` additionally requires the
`approved` realm role. On the first startup the containers resolve dependencies
and update `Frontend/package-lock.json` and `Backend/uv.lock`; commit those
lockfile changes with the authentication code.

## Local service commands

Run these commands from the repository root:

```bash
go-task status  # Show service status
go-task logs    # Follow service logs
go-task down    # Stop services without deleting their data
go-task check   # Run backend and frontend checks
```

`go-task up` starts the containers in the background. `go-task down` stops
them without deleting data volumes.
