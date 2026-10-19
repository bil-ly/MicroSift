# Authentication and access

MicroSift delegates identity to Keycloak. The React application starts browser
flows through `keycloak-js`; FastAPI accepts access tokens and makes the final
authorization decision for protected API routes.

## Ownership boundaries

| Component | Owns |
| --- | --- |
| Keycloak | Credentials, accounts, email verification, sessions, token issuance, realm roles |
| PostgreSQL | Persistent Keycloak data |
| React | Login/register redirects, token refresh, authenticated UI state |
| FastAPI | Token validation and endpoint authorization |
| Mailpit | Local-only capture of verification mail |

Neither React nor FastAPI receives the user's Keycloak password.

## Account states

An account moves through distinct gates:

1. **Unregistered:** no Keycloak account exists.
2. **Email unverified:** Keycloak has the account, but its required verification
   action is incomplete.
3. **Verified and pending:** the address is verified, but no administrator has
   granted the `approved` realm role.
4. **Approved:** a newly issued access token contains `approved` in
   `realm_access.roles`.

Email verification and admin approval are not interchangeable. Authentication
establishes identity; authorization determines whether that identity may use a
protected operation.

Follow the flow through [registration](registration.md),
[admin approval](admin-approval.md), [login](login.md), and
[protected API access](api-access.md).
