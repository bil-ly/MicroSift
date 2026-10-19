# Keycloak configuration

Open <http://auth.localhost:8088/admin/> and sign in as `admin` using the local
value named by `KEYCLOAK_ADMIN_PASSWORD`.

## Realm and client

Select or create the realm `microsift`. All following settings belong in that
realm—not `master`.

Create the OpenID Connect client `microsift-frontend` with:

| Setting | Value |
| --- | --- |
| Client authentication | Off (public browser client) |
| Standard flow | On |
| Direct access grants | Off |
| Implicit flow | Off |
| Valid redirect URIs | `http://app.localhost:8088/*` |
| Web origins | `http://app.localhost:8088` |

In the client's dedicated client scope, add an **Audience** mapper with Included
Custom Audience `microsift-api` and **Add to access token** enabled. Keep the
default `roles` scope so realm roles appear under `realm_access.roles`.

## Verification mail

Under **Realm settings → Login**, enable **User registration** and
**Verify email**. Under **Realm settings → Email**, configure:

| Setting | Local value |
| --- | --- |
| From | `noreply@microsift.local` |
| SMTP host | `mailpit` |
| SMTP port | `1025` |
| Authentication, SSL, StartTLS | Off |

Test the connection, then read local messages at <http://localhost:8025>.

## Approval role

Create the realm role `approved`, but do not make it a default role. An
administrator assigns it after reviewing a verified user. The user then needs a
newly issued token before the backend can observe the role.

See [manual admin approval](../authentication/admin-approval.md) for the user
workflow.
