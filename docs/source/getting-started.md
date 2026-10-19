# Getting started

This guide starts the complete local MicroSift stack and identifies the
interfaces you will use during development.

## Prerequisites

Install [Task](https://taskfile.dev/installation/) and Docker with the Compose
plugin (or a compatible `docker compose` implementation).

From the repository root, create your local configuration once:

```bash
cp .env.example .env
```

Replace the placeholder values for `POSTGRES_PASSWORD` and
`KEYCLOAK_ADMIN_PASSWORD`. Keep `.env` local; never commit its values.

## Start the stack

```bash
go-task up
```

The command starts the services in the background. The first start can take
longer because the frontend and backend containers resolve their dependencies.

| Interface | Address |
| --- | --- |
| MicroSift application | <http://app.localhost:8088> |
| Keycloak administration | <http://auth.localhost:8088/admin/> |
| Mailpit web interface | <http://localhost:8025> |
| FastAPI health check | <http://app.localhost:8088/api/health> |
| PostgreSQL | `localhost:5432` by default |

Use the password named by `KEYCLOAK_ADMIN_PASSWORD` with the Keycloak admin
username `admin`. Application accounts belong in the `microsift` realm, not
the `master` realm.

## Work with local services

```bash
go-task status  # Show container state
go-task logs    # Follow service logs
go-task check   # Run backend and frontend checks
go-task down    # Stop services without deleting their data
```

`go-task down` preserves the named volumes, so Keycloak configuration and local
accounts remain available on the next start.

## Build these docs

The documentation build is independent of the running Compose services. From
`docs/`, install the locked environment and run the checks:

```bash
uv sync
make check
```

The HTML site is written to `docs/build/html/`.

Next, read the [system overview](architecture/overview.md) or configure
[Keycloak](operations/keycloak.md).
