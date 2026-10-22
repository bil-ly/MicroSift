# --- STAGE 1: The Builder (gets thrown away at the end!) ---
FROM python:3.14-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:0.13.1 /uv /bin/
WORKDIR /app
COPY pyproject.toml uv.lock README.md ./
COPY src/ ./src/
RUN uv sync --locked --no-dev --no-editable


# --- STAGE 2: The Final Runtime Image (clean & small) ---
FROM python:3.14-slim
WORKDIR /app

# Copy ONLY the finished virtual environment from Stage 1!
# (No uv binary, no uv cache, no build junk makes it into this image)
COPY --from=builder /app/.venv /app/.venv

ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 8000
CMD ["uvicorn", "backend.api:app", "--host", "0.0.0.0", "--port", "8000"]