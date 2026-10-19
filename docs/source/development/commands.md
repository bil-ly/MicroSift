# Development commands

Run application lifecycle commands from the repository root.

| Command | Purpose |
| --- | --- |
| `go-task up` | Start the Compose stack in the background |
| `go-task status` | Show service state |
| `go-task logs` | Follow logs for all services |
| `go-task check` | Run backend tests plus frontend lint, tests, and build |
| `go-task down` | Stop services without deleting named volumes |

## Component checks

The Taskfile runs checks inside the development containers. For focused local
work, use each component's package manager:

```bash
# Backend
cd Backend
uv sync
uv run python -m unittest discover -s tests

# Frontend
cd Frontend
npm install
npm run lint
npm test -- --run
npm run build
```

## Documentation checks

From `docs/`:

```bash
uv sync
make check
```

`make check` runs the documentation tests and the strict build
`uv run sphinx-build -W --keep-going -b html source build/html`. Use
`make clean` to remove generated output and `make html` to rebuild it.

The documentation build does not require the Compose stack to be running.
