# MicroSift backend

## Run locally

Set `DATABASE_URL`, `AUTH_JWT_SECRET`, and `AUTH_ENCRYPTION_KEY` in your shell,
then run:

```bash
cd Backend
uv run uvicorn backend.main:app --reload
```

The application creates the initial `users` table in PostgreSQL at startup.
See `../docs/auth/architecture.md` for the authentication API and security
rules.

## Local pre-push checks

Run this once after cloning:

```bash
./scripts/setup-git-hooks.sh
```

The pre-push hook runs the same backend checks as CI: Ruff lint, Ruff format,
MyPy, and pytest. A failing check blocks the push.
