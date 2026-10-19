import os
from functools import lru_cache

import jwt
from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient
from jwt.exceptions import PyJWKClientError

issuer = os.getenv("KEYCLOAK_ISSUER", "http://auth.localhost:8088/realms/microsift")
jwks_url = os.getenv(
    "KEYCLOAK_JWKS_URL",
    "http://keycloak:8080/realms/microsift/protocol/openid-connect/certs",
)
audience = os.getenv("KEYCLOAK_AUDIENCE", "microsift-api")
bearer = HTTPBearer()


@lru_cache(maxsize=1)
def signing_keys() -> PyJWKClient:
    return PyJWKClient(jwks_url, timeout=5)


def current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> dict:
    try:
        key = signing_keys().get_signing_key_from_jwt(credentials.credentials)
        return jwt.decode(
            credentials.credentials,
            key.key,
            algorithms=["RS256"],
            audience=audience,
            issuer=issuer,
            options={"require": ["exp", "iss", "aud", "sub"]},
        )
    except (jwt.PyJWTError, PyJWKClientError) as error:
        raise HTTPException(status_code=401, detail="Invalid access token") from error

app = FastAPI(title="MicroSift API")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/me")
def me(user: dict = Depends(current_user)) -> dict[str, str]:
    roles = user.get("realm_access", {}).get("roles", [])
    return {
        "username": user.get("preferred_username", user["sub"]),
        "approval": "approved" if "approved" in roles else "pending",
    }


@app.get("/api/approved")
def approved(user: dict = Depends(current_user)) -> dict[str, str]:
    if "approved" not in user.get("realm_access", {}).get("roles", []):
        raise HTTPException(status_code=403, detail="Awaiting admin approval")
    return {"status": "approved"}
