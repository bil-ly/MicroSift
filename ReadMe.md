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

Configure the `microsift` realm and `microsift-frontend` client following
[`docs/auth/architecture.md`](docs/auth/architecture.md), then open
<http://localhost:5173>. The login and signup buttons redirect to Keycloak.

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
