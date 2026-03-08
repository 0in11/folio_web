"""Tests for src.config module."""

import pytest

from src.config import Settings


_REQUIRED_ENV = {
    "ANTHROPIC_API_KEY": "sk-ant-test-key",
    "OPENAI_API_KEY": "sk-openai-test-key",
    "DATABASE_URL": "postgresql://user:pass@localhost:5432/testdb",
}


@pytest.fixture()
def _set_required_env(monkeypatch: pytest.MonkeyPatch) -> None:
    """Populate the mandatory environment variables."""
    for key, value in _REQUIRED_ENV.items():
        monkeypatch.setenv(key, value)


class TestSettingsDefaults:
    """Settings should apply correct defaults when only required vars are set."""

    @pytest.mark.usefixtures("_set_required_env")
    def test_required_fields(self) -> None:
        s = Settings()
        assert s.anthropic_api_key == "sk-ant-test-key"
        assert s.openai_api_key == "sk-openai-test-key"
        assert s.database_url == "postgresql://user:pass@localhost:5432/testdb"

    @pytest.mark.usefixtures("_set_required_env")
    def test_claude_model_default(self) -> None:
        s = Settings()
        assert s.claude_model == "claude-sonnet-4-20250514"

    @pytest.mark.usefixtures("_set_required_env")
    def test_embedding_model_default(self) -> None:
        s = Settings()
        assert s.embedding_model == "text-embedding-3-small"

    @pytest.mark.usefixtures("_set_required_env")
    def test_embedding_dimensions_default(self) -> None:
        s = Settings()
        assert s.embedding_dimensions == 1536

    @pytest.mark.usefixtures("_set_required_env")
    def test_top_k_default(self) -> None:
        s = Settings()
        assert s.top_k == 5


class TestSettingsOverrides:
    """Environment variables should override every default."""

    @pytest.mark.usefixtures("_set_required_env")
    def test_override_claude_model(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("CLAUDE_MODEL", "claude-opus-4-20250514")
        s = Settings()
        assert s.claude_model == "claude-opus-4-20250514"

    @pytest.mark.usefixtures("_set_required_env")
    def test_override_embedding_model(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("EMBEDDING_MODEL", "text-embedding-3-large")
        s = Settings()
        assert s.embedding_model == "text-embedding-3-large"

    @pytest.mark.usefixtures("_set_required_env")
    def test_override_embedding_dimensions(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("EMBEDDING_DIMENSIONS", "3072")
        s = Settings()
        assert s.embedding_dimensions == 3072

    @pytest.mark.usefixtures("_set_required_env")
    def test_override_top_k(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("TOP_K", "10")
        s = Settings()
        assert s.top_k == 10


class TestSettingsMissingRequired:
    """Instantiation must fail when a required field is absent."""

    def test_missing_anthropic_key(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("OPENAI_API_KEY", "sk-openai-test-key")
        monkeypatch.setenv("DATABASE_URL", "postgresql://localhost/db")
        monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
        with pytest.raises(Exception):
            Settings()

    def test_missing_openai_key(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-test-key")
        monkeypatch.setenv("DATABASE_URL", "postgresql://localhost/db")
        monkeypatch.delenv("OPENAI_API_KEY", raising=False)
        with pytest.raises(Exception):
            Settings()

    def test_missing_database_url(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-test-key")
        monkeypatch.setenv("OPENAI_API_KEY", "sk-openai-test-key")
        monkeypatch.delenv("DATABASE_URL", raising=False)
        with pytest.raises(Exception):
            Settings()
