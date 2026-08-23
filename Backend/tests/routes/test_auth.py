from collections.abc import AsyncIterator
from copy import deepcopy
from types import SimpleNamespace
from uuid import uuid4

from auth_lib.auth_service import AuthService
from fastapi.testclient import TestClient

from backend.dependencies.auth import get_auth_service
from backend.main import create_app


class FakeUserRepository:
    def __init__(self) -> None:
        self.users: dict[str, dict[str, object]] = {}

    async def get_user_by_id(self, user_id: str) -> dict[str, object] | None:
        return deepcopy(self.users.get(user_id))

    async def get_user_by_username(self, username: str) -> dict[str, object] | None:
        return next(
            (
                deepcopy(user)
                for user in self.users.values()
                if user["username"] == username
            ),
            None,
        )

    async def get_user_by_email(self, email: str) -> dict[str, object] | None:
        return next(
            (deepcopy(user) for user in self.users.values() if user["email"] == email),
            None,
        )

    async def create_user(self, user_data: dict[str, object]) -> dict[str, object]:
        user = {"_id": str(uuid4()), **user_data}
        self.users[user["_id"]] = user
        return deepcopy(user)

    async def update_user(
        self, user_id: str, update_data: dict[str, object]
    ) -> dict[str, object] | None:
        user = self.users.get(user_id)
        if user is None:
            return None
        user.update(update_data)
        return deepcopy(user)

    async def delete_user(self, user_id: str) -> bool:
        return self.users.pop(user_id, None) is not None


def make_client() -> TestClient:
    repository = FakeUserRepository()
    service = AuthService(
        database=repository,
        jwt_secret="test-jwt-secret-that-is-long-enough-for-hs256",
        encryption_key="test-encryption-key",
        min_password_entropy=60,
    )
    app = create_app()
    app.state.settings = SimpleNamespace(is_development=True)

    async def override_auth_service() -> AsyncIterator[AuthService]:
        yield service

    app.dependency_overrides[get_auth_service] = override_auth_service
    return TestClient(app)


def test_register_login_and_get_current_user() -> None:
    client = make_client()

    register = client.post(
        "/api/v1/auth/register",
        json={
            "username": "alexa",
            "email": "alexa@example.com",
            "password": "StrongPassword1!",
        },
    )

    assert register.status_code == 201
    assert register.json()["email"] == "alexa@example.com"
    assert "hashed_password" not in register.json()

    login = client.post(
        "/api/v1/auth/login",
        json={"username": "alexa", "password": "StrongPassword1!"},
    )

    assert login.status_code == 200
    token = login.json()["access_token"]

    current_user = client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}
    )

    assert current_user.status_code == 200
    assert current_user.json()["username"] == "alexa"


def test_rejects_duplicate_and_invalid_credentials() -> None:
    client = make_client()
    credentials = {
        "username": "alexa",
        "email": "alexa@example.com",
        "password": "StrongPassword1!",
    }
    assert client.post("/api/v1/auth/register", json=credentials).status_code == 201

    assert client.post("/api/v1/auth/register", json=credentials).status_code == 400
    assert (
        client.post(
            "/api/v1/auth/login",
            json={"username": "alexa", "password": "wrong-password"},
        ).status_code
        == 401
    )


def test_password_reset_changes_the_login_password() -> None:
    client = make_client()
    assert (
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "alexa",
                "email": "alexa@example.com",
                "password": "StrongPassword1!",
            },
        ).status_code
        == 201
    )

    request = client.post(
        "/api/v1/auth/password-reset/request", json={"email": "alexa@example.com"}
    )
    assert request.status_code == 200
    reset_token = request.json()["reset_token"]

    confirm = client.post(
        "/api/v1/auth/password-reset/confirm",
        json={"token": reset_token, "new_password": "NewStrongPassword2!"},
    )
    assert confirm.status_code == 200

    assert (
        client.post(
            "/api/v1/auth/login",
            json={"username": "alexa", "password": "NewStrongPassword2!"},
        ).status_code
        == 200
    )
