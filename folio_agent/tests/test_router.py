"""Tests for the router node query classification."""

from __future__ import annotations

import pytest
import respx
from httpx import Response

from src.agent.nodes.router import _build_context_summary, route

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


def _make_state(
    user_text: str,
    source_documents: list[dict] | None = None,
    retrieval_scores: list[float] | None = None,
    retrieved_context: str = "",
) -> dict:
    """Build a minimal AgentState-compatible dict with retrieval fields."""
    return {
        "messages": [{"role": "user", "content": user_text}],
        "query_type": None,
        "retrieved_context": retrieved_context,
        "source_documents": source_documents or [],
        "retrieval_scores": retrieval_scores or [],
    }


class TestRouterPortfolio:
    """Router should classify portfolio-related queries correctly."""

    @respx.mock
    def test_portfolio_query(self) -> None:
        respx.post(_ANTHROPIC_MESSAGES_URL).mock(
            return_value=_mock_classification_response("portfolio"),
        )
        state = _make_state(
            "What projects has YoungIn Jin worked on?",
            source_documents=[{"source_type": "project", "source_id": "1", "metadata": {}}],
            retrieval_scores=[0.2],
            retrieved_context="Project A description",
        )
        result = route(state)
        assert result == {"query_type": "portfolio"}

    @respx.mock
    def test_portfolio_skills_query(self) -> None:
        respx.post(_ANTHROPIC_MESSAGES_URL).mock(
            return_value=_mock_classification_response("portfolio"),
        )
        state = _make_state(
            "What are Jin's technical skills?",
            source_documents=[{"source_type": "skill", "source_id": "2", "metadata": {}}],
            retrieval_scores=[0.15],
            retrieved_context="Python, ML, LLM",
        )
        result = route(state)
        assert result == {"query_type": "portfolio"}


class TestRouterGeneral:
    """Router should classify general tech questions correctly."""

    @respx.mock
    def test_general_query(self) -> None:
        respx.post(_ANTHROPIC_MESSAGES_URL).mock(
            return_value=_mock_classification_response("general"),
        )
        state = _make_state(
            "How does a transformer architecture work?",
            retrieval_scores=[0.9, 0.95],
            source_documents=[
                {"source_type": "project", "source_id": "1", "metadata": {}},
                {"source_type": "skill", "source_id": "2", "metadata": {}},
            ],
            retrieved_context="Unrelated content",
        )
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
            "retrieval_scores": [],
        }
        result = route(state)
        assert result == {"query_type": "off_topic"}


class TestRouterIncludesRetrievalContext:
    """Router should include retrieval context in the classification request."""

    @respx.mock
    def test_classification_input_contains_retrieval_summary(self) -> None:
        api_route = respx.post(_ANTHROPIC_MESSAGES_URL).mock(
            return_value=_mock_classification_response("portfolio"),
        )
        state = _make_state(
            "Tell me about domain-specific LLMs",
            source_documents=[
                {"source_type": "project", "source_id": "1", "metadata": {}},
            ],
            retrieval_scores=[0.25],
            retrieved_context="Domain-specific LLM fine-tuning project",
        )
        route(state)

        # Verify the request body contains retrieval context
        request_body = api_route.calls[0].request.read()
        assert b"distance=0.2500" in request_body
        assert b"type=project" in request_body
        assert b"User query:" in request_body
        assert b"Retrieval results:" in request_body

    @respx.mock
    def test_no_retrieval_results_sends_empty_summary(self) -> None:
        api_route = respx.post(_ANTHROPIC_MESSAGES_URL).mock(
            return_value=_mock_classification_response("general"),
        )
        state = _make_state("How does attention work?")
        route(state)

        request_body = api_route.calls[0].request.read()
        assert b"No retrieval results found" in request_body


class TestBuildContextSummary:
    """Unit tests for the _build_context_summary helper."""

    def test_empty_documents_returns_no_results_message(self) -> None:
        result = _build_context_summary([], [], "")
        assert result == "No retrieval results found."

    def test_formats_documents_with_scores(self) -> None:
        docs = [
            {"source_type": "project", "source_id": "1", "metadata": {}},
            {"source_type": "skill", "source_id": "2", "metadata": {}},
        ]
        scores = [0.25, 0.45]
        result = _build_context_summary(docs, scores, "Some context here")

        assert "Result 1: [type=project, distance=0.2500]" in result
        assert "Result 2: [type=skill, distance=0.4500]" in result
        assert "Top result snippet: Some context here" in result

    def test_snippet_truncated_to_200_chars(self) -> None:
        docs = [{"source_type": "project", "source_id": "1", "metadata": {}}]
        scores = [0.1]
        long_context = "x" * 300
        result = _build_context_summary(docs, scores, long_context)

        snippet_line = [line for line in result.split("\n") if "snippet" in line][0]
        # "Top result snippet: " is 20 chars, so snippet content is 200
        snippet_content = snippet_line.split("Top result snippet: ")[1]
        assert len(snippet_content) == 200
