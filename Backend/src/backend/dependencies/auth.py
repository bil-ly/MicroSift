from collections.abc import AsyncIterator
from typing import Annotated, Any

from auth_lib.auth_service import AuthService
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from ..core.config import Settings
from ..db.session import get_session
from ..repositories.users import UserRepository

bearer_scheme = HTTPBearer(auto_error=False)


async def get_auth_service(request: Request) -> AsyncIterator[AuthService]:
    settings: Settings = request.app.state.settings
    session_factory = request.app.state.session_factory
    async for session in get_session(session_factory):
        yield AuthService(
            database=UserRepository(session),
            jwt_secret=settings.auth_jwt_secret.get_secret_value(),
            encryption_key=settings.auth_encryption_key.get_secret_value(),
            jwt_expires_minutes=settings.auth_jwt_expires_minutes,
            min_password_entropy=settings.auth_min_password_entropy,
        )


AuthServiceDependency = Annotated[AuthService, Depends(get_auth_service)]


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    auth_service: AuthServiceDependency,
) -> dict[str, Any]:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )
    return await auth_service.get_current_user_from_token(credentials.credentials)
