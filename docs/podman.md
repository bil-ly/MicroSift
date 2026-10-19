# Local development with Podman

The repository root `compose.yaml` starts PostgreSQL, Keycloak, Mailpit,
FastAPI, and the Vite frontend. The `docker compose` compatibility command
uses Podman's user socket.

Start the socket once on a systemd host:

```bash
systemctl --user enable --now podman.socket
```

Create `.env` from `.env.example`, replace the local passwords, then run
`go-task up` from the repository root. Use `go-task status` and `go-task logs`
to inspect the services. Open the frontend at <http://localhost:5173> and
check the API directly at <http://localhost:8000/api/health>.

`go-task down` stops services without removing PostgreSQL data. The
`backend-venv` and `frontend-node-modules` volumes hold local dependencies.
