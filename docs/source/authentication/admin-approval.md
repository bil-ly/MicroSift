# Manual admin approval

Approval is a deliberate administrative action after email verification. It is
implemented as the Keycloak realm role `approved`.

1. Open <http://auth.localhost:8088/admin/> and sign in as `admin`.
2. Select the `microsift` realm. Do not manage application users in `master`.
3. Open **Users**, select the account, and confirm its email is verified.
4. Open **Role mapping** and assign the realm role `approved`.

```{figure} ../_static/diagrams/high-level/02-admin-approval.png
:alt: Sequence diagram showing an administrator assigning the approved realm role in Keycloak

The approval decision is stored with Keycloak's user-to-role mappings in
PostgreSQL.
```

Role assignment does not rewrite access tokens that have already been issued.
The user must sign out and sign in again, or otherwise obtain a freshly issued
token, before FastAPI can observe the new role.

Do not make `approved` a default realm role: doing so would collapse manual
approval into registration and remove the authorization gate.
