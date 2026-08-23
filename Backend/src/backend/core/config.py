from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    app_environment: str = "development"
    auth_jwt_secret: SecretStr
    auth_encryption_key: SecretStr
    auth_jwt_expires_minutes: int = 60
    auth_min_password_entropy: float = 60.0
    auth_cors_origins: str = ""

    model_config = SettingsConfigDict(env_file=None, extra="ignore")

    @property
    def is_development(self) -> bool:
        return self.app_environment == "development"

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.auth_cors_origins.split(",")
            if origin.strip()
        ]
