# Troubleshooting

## Keycloak reports an invalid redirect URI

**Likely cause:** `microsift-frontend` still has an old Vite origin or lacks the
Traefik address.

**Check:** In the `microsift` realm, set Valid redirect URIs to
`http://app.localhost:8088/*` and Web origins to
`http://app.localhost:8088`. Remove obsolete `localhost:5173` entries.

## Users or clients appear to be missing

**Likely cause:** the admin console is showing the `master` realm.

**Check:** Use the realm selector at the upper left and choose `microsift`.

## No verification email appears

**Likely cause:** email verification or SMTP is not configured, or Mailpit is
unavailable.

**Check:** enable **Verify email**, test the Keycloak SMTP connection to
`mailpit:1025`, run `go-task status`, and open <http://localhost:8025>.

## The dashboard says “Awaiting admin approval”

**Likely cause:** verification succeeded, but the user does not have the
`approved` realm role.

**Check:** inspect the user under **Users → Role mapping** in the `microsift`
realm and assign the role only after review.

## Approval was assigned but access remains pending

**Likely cause:** the browser still holds a token issued before the role change.

**Check:** sign out and sign in again so Keycloak issues a new access token.

## The API returns 401 or 403

`401 Unauthorized` means the bearer token is missing or failed signature,
expiry, issuer, audience, or required-claim validation. `403 Forbidden` means
the token is valid but lacks `approved`. Inspect the response and the token's
realm roles before changing application code.

## Token validation cannot fetch signing keys

**Likely cause:** Keycloak is unavailable on the Compose network or
`KEYCLOAK_JWKS_URL` uses the wrong address.

**Check:** verify Keycloak is healthy and the backend uses
`http://keycloak:8080/realms/microsift/protocol/openid-connect/certs`. The issuer
must remain the public `http://auth.localhost:8088/realms/microsift` value.

## Local hostnames do not open

**Likely cause:** Traefik is stopped, port `8088` is occupied, or the browser is
not resolving `.localhost` names normally.

**Check:** run `go-task status`, inspect `go-task logs`, and confirm
`127.0.0.1:8088` is available. Both `app.localhost` and `auth.localhost` use the
same listener.

## The documentation build fails

**Likely cause:** Sphinx found a broken link, missing image, malformed directive,
or page omitted from navigation.

**Check:** from `docs/`, run `make clean` followed by `make check`. Because the
build uses `-W --keep-going`, review every warning in the output before retrying.
