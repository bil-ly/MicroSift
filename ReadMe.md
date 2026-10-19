# MicroSift

MicroSift is a React application with a FastAPI backend. Traefik routes local
traffic to the app, API, and Keycloak. PostgreSQL and Mailpit run alongside it.

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

Open <http://auth.localhost:8088/admin/> and sign in as `admin` with the value
of `KEYCLOAK_ADMIN_PASSWORD` in `.env`. The admin console often opens in the
`master` realm. Use the **Current realm** selector at the top left to select
`microsift`. If it does not exist yet, choose **Create realm** and name it
exactly `microsift`. Keep `microsift` selected for every step below. The
`microsift-realm` client visible in `master` is not the frontend client.

1. Go to **Clients** in the `microsift` realm. If `microsift-frontend` already
   exists, open it and select **Settings**. Otherwise choose **Create client**,
   select **OpenID Connect**, set Client ID to `microsift-frontend`, set Client
   authentication **Off**, and keep Standard flow **On**.
2. In the client's **Settings**, set Valid redirect URIs to
   `http://app.localhost:8088/*` and Web origins to
   `http://app.localhost:8088`. Click **Save**. Remove the previous
   `http://localhost:5173/*` redirect and `http://localhost:5173` origin if
   this client existed before Traefik. An old redirect causes **Invalid
   parameter: redirect_uri** during login.
3. Go to **Realm settings → Login** and enable **User registration** and
   **Verify email**.
4. Go to **Realm settings → Email**. Set From to
   `noreply@microsift.local`, SMTP host to `mailpit`, and port to `1025`.
   Leave authentication, SSL, and StartTLS off; save and test the connection.
5. Go to **Realm roles** and create `approved` if it does not already exist.
   Do not make it a default role.
6. In the `microsift-frontend` client's dedicated client scope, add an
   **Audience** mapper with Included Custom Audience `microsift-api` and
   **Add to access token** enabled. Keep the default `roles` scope.

Now open <http://app.localhost:8088>, register a user, and open the verification
message at <http://localhost:8025>. The user remains pending until an admin
assigns the `approved` realm role under **Users → Role mapping**. Sign out and
back in after approval to obtain a token with the new role.

For the full authentication flow, see
[`docs/auth/architecture.md`](docs/auth/architecture.md).

The local service interfaces are available at:

- Keycloak: <http://auth.localhost:8088> (username `admin`; password from
  `KEYCLOAK_ADMIN_PASSWORD` in `.env`)
- Mailpit: <http://localhost:8025>
- FastAPI: <http://app.localhost:8088/api/health>
- PostgreSQL: `localhost:5432` by default

Traefik routes `/api` requests to FastAPI. `/api/health` is public; `/api/me`
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

Existing users, realm roles, and Mailpit SMTP settings remain in PostgreSQL
when you add Traefik.
