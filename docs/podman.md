# Local PostgreSQL with Podman

The repository root contains `compose.yaml`, which starts only PostgreSQL for
local backend development. It does not start the FastAPI application.

## Prerequisites

Install Podman, then verify that it has a Compose provider:

```bash
podman --version
podman compose version
```

`podman compose` delegates Compose operations to an external provider. If the
second command reports that no provider is available, install and configure a
provider before continuing.

## Start PostgreSQL

From the repository root, create a local environment file:

```bash
cp .env.example .env
```

Set a local-only `POSTGRES_PASSWORD` in `.env`. Do not commit that file.

Start the database and check its status:

```bash
podman compose up -d postgres
podman compose ps
podman compose logs -f postgres
```

The PostgreSQL healthcheck runs `pg_isready`. Wait for the service to report
healthy before starting the backend.

## Connect the backend

Set `DATABASE_URL` from the values in `.env` before running the API:

```bash
export DATABASE_URL='postgresql+psycopg://<POSTGRES_USER>:<POSTGRES_PASSWORD>@localhost:<POSTGRES_PORT>/<POSTGRES_DB>'
cd Backend
uv run uvicorn backend.main:app --reload
```

The backend creates its initial `users` table on startup.

## Stop or reset PostgreSQL

Stop the container while preserving data:

```bash
podman compose down
```

Delete the container and the named PostgreSQL data volume:

```bash
podman compose down -v
```

The second command permanently removes local database data.
