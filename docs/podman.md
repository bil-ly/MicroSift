# Local development with Podman

The canonical setup and service addresses are maintained in
[Getting started](source/getting-started.md). The repository root
`compose.yaml` can also run through Podman's Docker Compose compatibility.

Start the socket once on a systemd host:

```bash
systemctl --user enable --now podman.socket
```

After the socket is available, use the normal `go-task` commands from the
getting-started guide. The application and API are exposed through Traefik at
<http://app.localhost:8088>; the current Compose file does not publish direct
host ports for Vite or FastAPI.

`go-task down` stops services without removing PostgreSQL data. The
`backend-venv` and `frontend-node-modules` volumes hold local dependencies.
