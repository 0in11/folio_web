"""Application configuration using pydantic-settings.

LLM inference uses Anthropic Claude (ANTHROPIC_API_KEY).
Embeddings use OpenAI (OPENAI_API_KEY).
Vector storage uses PostgreSQL with pgvector (AGENT_DATABASE_URL).
Content is read from Payload CMS database (PAYLOAD_DATABASE_URL).
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration loaded from environment variables and .env file."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- Required keys ---
    anthropic_api_key: str
    openai_api_key: str
    payload_database_url: str   # Payload CMS DB (읽기 전용)
    agent_database_url: str     # Agent 전용 DB (임베딩 저장)

    # --- LLM defaults ---
    claude_model: str = "claude-sonnet-4-20250514"

    # --- Embedding defaults ---
    embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536

    # --- Retrieval defaults ---
    top_k: int = 5


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached Settings singleton.

    Using a function (instead of module-level instantiation) allows
    tests to import the class without triggering validation when
    required env vars are not yet set.
    """
    return Settings()
