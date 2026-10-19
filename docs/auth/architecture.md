# Authentication with Keycloak

Keycloak manages accounts and email verification in PostgreSQL. The React
frontend uses Authorization Code with PKCE through `keycloak-js`; it never
receives passwords. FastAPI validates access tokens against Keycloak's signing
keys, checks the issuer and audience, and enforces the realm role `approved`.

## Configure the local realm

1. Open <http://localhost:8080/admin/> and sign in as `admin` using the value
   of `KEYCLOAK_ADMIN_PASSWORD` from your local `.env`.
2. Create the realm `microsift` if it does not already exist. Select it in the
   realm dropdown; do not configure application users in `master`.
3. In Realm settings → Login, enable User registration and Verify email.
4. In Realm settings → Email, set From to `noreply@microsift.local`, Host to
   `mailpit`, Port to `1025`, and leave authentication, SSL and StartTLS off
   for local development. Test the SMTP connection. View emails at
   <http://localhost:8025>.
5. Create a realm role named `approved`. Do not assign it as a default role.
6. Under Clients, create an OpenID Connect client `microsift-frontend` with
   Client authentication **Off** (a public browser client), Standard flow
   **On**, and Direct access grants and Implicit flow **Off**. Set Valid
   redirect URIs to `http://localhost:5173/*` and Web origins to
   `http://localhost:5173`.
7. In this client's dedicated client scope, add an **Audience** protocol
   mapper. Set Included Custom Audience to `microsift-api` and include it in
   the access token. This makes the access token's `aud` claim match the API.
   Keep the default `roles` scope so realm roles appear under
   `realm_access.roles`.

## Request flow

1. The browser redirects to Keycloak for registration or sign-in. Keycloak
   emails a verification link through Mailpit and issues tokens after its
   required actions are complete.
2. The frontend obtains an access token with the authorization-code flow and
   calls `/api/me` through Vite's `/api` proxy.
3. FastAPI fetches Keycloak's public keys from the internal `keycloak` service.
   It validates the token's signature, expiry, issuer
   `http://localhost:8080/realms/microsift`, and audience `microsift-api`.
4. `/api/me` returns `pending` until the user has the `approved` realm role.
   The dashboard keeps its content hidden during this state.
5. An admin assigns `approved` to the verified user in Users → Role mapping.
   The user signs out and back in to obtain a token with the new role.
6. `/api/approved` returns `403` for a valid token without the role and `200`
   for a valid approved token. Protected market endpoints must use the same
   backend role check. `/api/health` remains public.

The Vite proxy is for local development. The browser uses the public
`localhost:8080` Keycloak address; the backend retrieves signing keys through
the Compose service name `keycloak`. A real SMTP provider replaces Mailpit
when deployed. The credentials, external URL, and redirect origins must be
configured for the deployed environment.
