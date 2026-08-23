from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.models import User


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    @staticmethod
    def _to_dict(user: User) -> dict[str, Any]:
        return {
            "_id": str(user.id),
            "username": user.username,
            "email": user.email,
            "hashed_password": user.hashed_password,
            "is_active": user.is_active,
            "two_factor_enabled": user.two_factor_enabled,
            "created_at": user.created_at,
        }

    async def _get_user(self, statement: object) -> dict[str, Any] | None:
        result = await self.session.execute(statement)
        user = result.scalar_one_or_none()
        return self._to_dict(user) if user else None

    async def get_user_by_id(self, user_id: str) -> dict[str, Any] | None:
        try:
            identifier = UUID(user_id)
        except ValueError:
            return None
        return await self._get_user(select(User).where(User.id == identifier))

    async def get_user_by_username(self, username: str) -> dict[str, Any] | None:
        return await self._get_user(select(User).where(User.username == username))

    async def get_user_by_email(self, email: str) -> dict[str, Any] | None:
        return await self._get_user(select(User).where(User.email == email))

    async def create_user(self, user_data: dict[str, Any]) -> dict[str, Any]:
        user = User(**user_data)
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return self._to_dict(user)

    async def update_user(
        self, user_id: str, update_data: dict[str, Any]
    ) -> dict[str, Any] | None:
        try:
            identifier = UUID(user_id)
        except ValueError:
            return None
        user = await self.session.get(User, identifier)
        if user is None:
            return None
        for field, value in update_data.items():
            setattr(user, field, value)
        await self.session.commit()
        await self.session.refresh(user)
        return self._to_dict(user)

    async def delete_user(self, user_id: str) -> bool:
        try:
            identifier = UUID(user_id)
        except ValueError:
            return False
        user = await self.session.get(User, identifier)
        if user is None:
            return False
        await self.session.delete(user)
        await self.session.commit()
        return True
