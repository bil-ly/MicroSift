from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import Settings
from .db.session import create_engine, create_schema, create_session_factory
from .routes.auth import router as auth_router


def create_app(
    settings: Settings | None = None, *, initialize_database: bool = True
) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        runtime_settings = settings or Settings()  # type: ignore[call-arg]
        app.state.settings = runtime_settings
        engine = create_engine(runtime_settings.database_url)
        app.state.engine = engine
        app.state.session_factory = create_session_factory(engine)
        if initialize_database:
            await create_schema(engine)
        yield
        await engine.dispose()

    app = FastAPI(title="MicroSift API", lifespan=lifespan)
    if settings and settings.cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    app.include_router(auth_router)
    return app


app = create_app()
