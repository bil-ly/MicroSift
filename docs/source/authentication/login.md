# Login and token exchange

On startup, React calls `keycloak.init()` with `check-sso`, PKCE method `S256`,
and the login-status iframe disabled. The adapter checks for an existing
Keycloak session; without one, the application remains signed out.

```{figure} ../_static/diagrams/detailed/01-opening.png
:alt: Flowchart showing MicroSift loading through Traefik and checking for a Keycloak session

Opening the application and checking for an existing single-sign-on session.
```

## Authorization Code with PKCE

When the user chooses **Continue with Keycloak**, `keycloak-js` creates a PKCE
verifier and S256 challenge, plus state and nonce values, before redirecting the
browser to Keycloak. Keycloak authenticates the user and completes any required
actions. It returns an authorization code to the registered dashboard URL.

The browser adapter validates the response and exchanges the code plus verifier
at Keycloak's token endpoint. Tokens are returned to the adapter; the redirect
does not contain tokens or the user's password.

```{figure} ../_static/diagrams/detailed/03-login.png
:alt: Flowchart showing Authorization Code with PKCE from React to Keycloak and back

Login, callback validation, and the PKCE-protected token exchange.
```

Before an API call, `accessToken()` asks the adapter to refresh a token that is
within 30 seconds of expiry. If no token remains, the call fails as an expired
session.

Logout calls `keycloak.logout()` and asks Keycloak to return the browser to the
application origin. Keycloak ends its session before React shows the signed-out
state.
