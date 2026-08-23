from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.exc import IntegrityError

from ..core.config import Settings
from ..dependencies.auth import AuthServiceDependency, get_current_user
from ..schemas.auth import (
    LoginRequest,
    MessageResponse,
    PasswordResetConfirmRequest,
    PasswordResetRequest,
    PasswordResetRequestResponse,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def to_user_response(user: dict[str, Any]) -> UserResponse:
    return UserResponse(
        id=str(user["_id"]),
        username=str(user["username"]),
        email=str(user["email"]),
        is_active=bool(user["is_active"]),
        created_at=user["created_at"],
    )


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
async def register(
    payload: RegisterRequest, auth_service: AuthServiceDependency
) -> UserResponse:
    try:
        user = await auth_service.register_user(**payload.model_dump())
    except IntegrityError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered",
        ) from error
    return to_user_response(user)


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest, auth_service: AuthServiceDependency
) -> TokenResponse:
    return TokenResponse(**await auth_service.login_user(**payload.model_dump()))


@router.get("/me", response_model=UserResponse)
async def me(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> UserResponse:
    return to_user_response(current_user)


@router.post("/password-reset/request", response_model=PasswordResetRequestResponse)
async def password_reset_request(
    payload: PasswordResetRequest, request: Request, auth_service: AuthServiceDependency
) -> PasswordResetRequestResponse:
    token = await auth_service.reset_password_request(payload.email)
    settings: Settings = request.app.state.settings
    return PasswordResetRequestResponse(
        message="Password reset requested",
        reset_token=token if settings.is_development else None,
    )


@router.post("/password-reset/confirm", response_model=MessageResponse)
async def password_reset_confirm(
    payload: PasswordResetConfirmRequest, auth_service: AuthServiceDependency
) -> MessageResponse:
    await auth_service.reset_password(payload.token, payload.new_password)
    return MessageResponse(message="Password updated")
