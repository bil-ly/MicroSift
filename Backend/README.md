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
