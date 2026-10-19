# MicroSift

MicroSift is a React application with PostgreSQL, Keycloak, and Mailpit as its
local supporting services. UPDATING THIS LATER

## Prerequisites

- [Task](https://taskfile.dev/installation/)
- Docker with the Compose plugin (or a compatible `docker compose` command)
- Node.js `20.19+`, `22.12+`, or `24+`, with npm

## Start the app

From the repository root, create your local environment file the first time
you run the project:

```bash
cp .env.example .env
```

Replace the placeholder passwords in `.env`, then start PostgreSQL, Keycloak,
and Mailpit:

```bash
task up
```

Install the frontend dependencies and start the development server:

```bash
cd Frontend
npm install
npm run dev
```

Open the URL printed by Vite (normally <http://localhost:5173>). The demo login
is:

- Email: `test@test.com`
- Password: `12345`

The local service interfaces are available at:

- Keycloak: <http://localhost:8080> (username `admin`; password from
  `KEYCLOAK_ADMIN_PASSWORD` in `.env`)
- Mailpit: <http://localhost:8025>
- PostgreSQL: `localhost:5432` by default

## Local service commands

Run these commands from the repository root:

```bash
task status  # Show the service status
task logs    # Follow Keycloak logs
task down    # Stop services without deleting their data
```

The frontend development server runs in the foreground. Stop it with
<kbd>Ctrl</kbd>+<kbd>C</kbd>, then use `task down` to stop the supporting
services.
