# Registration and email verification

The login page's **Create account** button calls `keycloak.register()` with
`http://app.localhost:8088/dashboard` as the return URL. The browser—not
React—then opens Keycloak. Keycloak rejects the request if that return URL is
not allowed for the `microsift-frontend` client.

The user submits credentials directly to Keycloak. Keycloak hashes the password
and persists the account in PostgreSQL; neither React nor FastAPI sees the
password.

```{figure} ../_static/diagrams/high-level/01-registration.png
:alt: Sequence diagram showing registration, SMTP delivery, email verification, and invalid-link handling

High-level registration and email-verification sequence. Verification changes
the email state but does not grant the `approved` role.
```

## Local verification mail

With **Verify email** enabled, Keycloak sends SMTP mail to `mailpit:1025` on the
Compose network. Open <http://localhost:8025> on the host and follow the link in
the captured message. A deployed environment replaces Mailpit with a real SMTP
provider.

An expired or invalid link leaves verification incomplete. Request another
message in Keycloak and retry; do not bypass the required action by assigning
the approval role.

```{figure} ../_static/diagrams/detailed/02-registration.png
:alt: Flowchart tracing registration from React through Keycloak and Mailpit

Detailed local registration flow, including redirect validation and Mailpit's
separate host interface.
```

After a valid link, the account is verified but remains pending until an
administrator completes [manual approval](admin-approval.md).
