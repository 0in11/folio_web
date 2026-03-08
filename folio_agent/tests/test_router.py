"""Tests for the router node query classification."""

from __future__ import annotations

import pytest
import respx
from httpx import Response

from src.agent.nodes.router import route

_REQUIRED_ENV = {
    "ANTHROPIC_API_KEY": "sk-ant-test-key",
    "OPENAI_API_KEY": "sk-openai-test-key",
    "DATABASE_URL": "postgresql://user:pass@localhost:5432/testdb",
}

_ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages"


@pytest.fixture(autouse=True)
def _set_required_env(monkeypatch: pytest.MonkeyPatch) -> None:
    """Populate mandatory environment variables and clear settings cache."""
    for key, value in _REQUIRED_ENV.items():
        monkeypatch.setenv(key, value)
    # Clear the lru_cache so each test gets fresh Settings
    from src.config import get_settings

    get_settings.cache_clear()


def _mock_classification_response(category: str) -> Response:
    """Build a fake Anthropic API response for a classification result."""
    body = {
        "id": "msg_test123",
        "type": "message",
        "role": "assistant",
        "content": [{"type": "text", "text": category}],
        "model": "claude-sonnet-4-20250514",
        "stop_reason": "end_turn",
        "stop_sequence": None,
        "usage": {"input_tokens": 50, "output_tokens": 1},
    }
    return Response(200, json=body)


def _make_state(user_text: str) -> dict:
    """Build a minimal AgentState-compatible dict with a single user message."""
    return {
        "messages": [{"role": "user", "content": user_text}],
        "query_type": None,
        "retrieved_context": "",
        "source_documents": [],
    }


class TestRouterPortfolio:
    """Router should classify portfolio-related queries correctly."""

    @respx.mock
    def test_portfolio_query(self) -> None:
        respx.post(_ANTHROPIC_MESSAGES_URL).mock(
            return_value=_mock_classification_response("portfolio"),
        )
        state = _make_state("What projects has YoungIn Jin worked on?")
        result = route(state)
        assert result == {"query_type": "portfolio"}

    @respx.mock
    def test_portfolio_skills_query(self) -> None:
        respx.post(_ANTHROPIC_MESSAGES_URL).mock(
            return_value=_mock_classification_response("portfolio"),
        )
        state = _make_state("What are Jin's technical skills?")
        result = route(state)
        assert result == {"query_type": "portfolio"}


class TestRouterGeneral:
    """Router should classify general tech questions correctly."""

    @respx.mock
    def test_general_query(self) -> None:
        respx.post(_ANTHROPIC_MESSAGES_URL).mock(
            return_value=_mock_classification_response("general"),
        )
        state = _make_state("How does a transformer architecture work?")
        result = route(state)
        assert result == {"query_type": "general"}


class TestRouterOffTopic:
    """Router should classify off-topic queries correctly."""

    @respx.mock
    def test_off_topic_query(self) -> None:
        respx.post(_ANTHROPIC_MESSAGES_URL).mock(
            return_value=_mock_classification_response("off_topic"),
        )
        state = _make_state("What is the best pizza topping?")
        result = route(state)
        assert result == {"query_type": "off_topic"}


class TestRouterEdgeCases:
    """Router should handle unexpected API responses gracefully."""

    @respx.mock
    def test_invalid_category_falls_back_to_off_topic(self) -> None:
        respx.post(_ANTHROPIC_MESSAGES_URL).mock(
            return_value=_mock_classification_response("unknown_category"),
        )
        state = _make_state("Some random input")
        result = route(state)
        assert result == {"query_type": "off_topic"}

    @respx.mock
    def test_whitespace_in_response_is_trimmed(self) -> None:
        respx.post(_ANTHROPIC_MESSAGES_URL).mock(
            return_value=_mock_classification_response("  general  "),
        )
        state = _make_state("Explain neural networks")
        result = route(state)
        assert result == {"query_type": "general"}

    @respx.mock
    def test_uppercase_response_is_normalized(self) -> None:
        respx.post(_ANTHROPIC_MESSAGES_URL).mock(
            return_value=_mock_classification_response("PORTFOLIO"),
        )
        state = _make_state("Tell me about Jin's career")
        result = route(state)
        assert result == {"query_type": "portfolio"}

    @respx.mock
    def test_empty_messages_returns_classification(self) -> None:
        """When no user message is found, it still calls the API and returns a type."""
        respx.post(_ANTHROPIC_MESSAGES_URL).mock(
            return_value=_mock_classification_response("off_topic"),
        )
        state = {
            "messages": [],
            "query_type": None,
            "retrieved_context": "",
            "source_documents": [],
        }
        result = route(state)
        assert result == {"query_type": "off_topic"}
