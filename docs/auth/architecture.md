# Authentication architecture

## Scope

MicroSift exposes a PostgreSQL-backed FastAPI authentication API under
`/api/v1/auth`. It uses `fastapi-auth-lib` for password hashing, password
strength validation, JWT creation and verification, and password-reset token
handling. The application owns its HTTP routes, configuration, and PostgreSQL
adapter.

The current frontend demo login is separate from this API. It does not call
these endpoints and must not be treated as real authentication.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Create a user with a unique username and email. |
| `POST` | `/api/v1/auth/login` | Verify credentials and return a Bearer access token. |
| `GET` | `/api/v1/auth/me` | Return the authenticated user's public profile. |
| `POST` | `/api/v1/auth/password-reset/request` | Create a one-hour password-reset token for an existing email. |
| `POST` | `/api/v1/auth/password-reset/confirm` | Replace a password using a valid password-reset token. |

`/me` requires an `Authorization: Bearer <access-token>` header. Password
hashes, reset tokens, and configuration secrets are never returned in API
responses.

## Request and response contracts

- `POST /register` accepts `username`, `email`, and `password`; returns `201`
  with `id`, `username`, `email`, `is_active`, and `created_at`.
- `POST /login` accepts `username`, `password`, and optional `totp_code`;
  returns `200` with `access_token` and `token_type`.
- `GET /me` accepts a Bearer access token and returns `200` with the public
  user profile.
- `POST /password-reset/request` accepts `email`. It returns `404` for an
  unknown email. In development it also returns a `reset_token`; production
  returns only a confirmation message.
- `POST /password-reset/confirm` accepts `token` and `new_password`, and
  returns `200` after a valid reset.

Duplicate usernames or emails return `400`; invalid credentials or tokens
return `401`; weak replacement passwords return `400`.

## Storage model

The PostgreSQL `users` table stores an application-generated UUID, username,
email, bcrypt password hash, active flag, and timestamps. Username and email
are unique. The database adapter implements the library's async
`DatabaseInterface`; routes do not execute user SQL directly.

The initial implementation creates the table at startup. Production schema
changes should move to versioned migrations before the schema evolves.

## Authentication flow

1. Registration validates password strength in `fastapi-auth-lib`, hashes the
   password with bcrypt, and stores the new user.
2. Login checks the username and bcrypt hash. A successful login returns a
   signed JWT containing the user UUID in `sub`.
3. Protected requests submit the JWT as a Bearer token. The application
   verifies it through the library, then loads the active user from PostgreSQL.
4. A password-reset request creates a short-lived JWT whose type is
   `password_reset`. The confirm endpoint accepts that token and a new strong
   password; the library validates the token and updates the bcrypt hash.

## Configuration

Configuration is read from environment variables. Do not commit values.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection URL. |
| `APP_ENVIRONMENT` | `development` or `production`; defaults to `development`. |
| `AUTH_JWT_SECRET` | Secret used to sign access and reset JWTs. |
| `AUTH_ENCRYPTION_KEY` | Encryption key required by the library. |
| `AUTH_JWT_EXPIRES_MINUTES` | Access-token lifetime; defaults to 60. |
| `AUTH_MIN_PASSWORD_ENTROPY` | Minimum password entropy; defaults to 60. |
| `AUTH_CORS_ORIGINS` | Comma-separated browser origins allowed to call the API. |

Missing required secrets fail application startup. Development and production
must use different values for every secret.

## Exclusions

Two-factor authentication is not exposed: the library needs a configured
Redis-backed two-factor service, and this project does not configure Redis.
Email delivery is also not configured. Password-reset requests return a token
only for local development; production must connect an email provider and stop
returning reset tokens in responses.
