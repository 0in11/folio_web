# ---------- build stage ----------
FROM python:3.12-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:0.6 /uv /uvx /bin/

WORKDIR /app

# Copy dependency files first for layer caching
COPY pyproject.toml uv.lock ./

# Install production dependencies only (no dev group)
RUN uv sync --frozen --no-dev --no-install-project

# Copy source code
COPY src/ src/

# ---------- runtime stage ----------
FROM python:3.12-slim

# Security: run as non-root user
RUN groupadd --system app && useradd --system --gid app app

COPY --from=ghcr.io/astral-sh/uv:0.6 /uv /uvx /bin/

WORKDIR /app

# Copy virtual environment and project files from builder
COPY --from=builder /app /app

# Own files by app user
RUN chown -R app:app /app

USER app

EXPOSE 8000

CMD ["sh", "-c", "uv run --frozen --no-dev uvicorn src.api:app --host 0.0.0.0 --port ${PORT:-8000}"]
