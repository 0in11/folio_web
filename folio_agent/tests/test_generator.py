"""Tests for the generator node response generation."""

from __future__ import annotations

import pytest
import respx
from httpx import Response

from src.agent.nodes.generator import generate

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
    from src.config import get_settings

    get_settings.cache_clear()


def _mock_generation_response(text: str) -> Response:
    """Build a fake Anthropic API response for a generation result."""
    body = {
        "id": "msg_test456",
        "type": "message",
        "role": "assistant",
        "content": [{"type": "text", "text": text}],
        "model": "claude-sonnet-4-20250514",
        "stop_reason": "end_turn",
        "stop_sequence": None,
        "usage": {"input_tokens": 100, "output_tokens": 50},
    }
    return Response(200, json=body)


def _make_state(
    user_text: str,
    query_type: str | None,
    retrieved_context: str = "",
    retrieval_scores: list[float] | None = None,
) -> dict:
    """Build a minimal AgentState-compatible dict."""
    return {
        "messages": [{"role": "user", "content": user_text}],
        "query_type": query_type,
        "retrieved_context": retrieved_context,
        "source_documents": [],
        "retrieval_scores": retrieval_scores or [],
    }


class TestGeneratorPortfolio:
    """Generator should include retrieved context for portfolio queries."""

    @respx.mock
    def test_portfolio_includes_context_in_prompt(self) -> None:
        context = "YoungIn Jin has 5 years of AI engineering experience."
        route = respx.post(_ANTHROPIC_MESSAGES_URL).mock(
            return_value=_mock_generation_response(
                "YoungIn Jin has extensive AI experience.",
            ),
        )

        state = _make_state(
            "Tell me about Jin's experience",
            query_type="portfolio",
            retrieved_context=context,
            retrieval_scores=[0.2],
        )
        result = generate(state)

        # Verify the response is wrapped in AIMessage
        assert len(result["messages"]) == 1
        assert result["messages"][0].content == "YoungIn Jin has extensive AI experience."

        # Verify the system prompt included the retrieved context
        request_body = route.calls[0].request.read()
        assert context.encode() in request_body

    @respx.mock
    def test_portfolio_max_tokens_is_1024(self) -> None:
        respx.post(_ANTHROPIC_MESSAGES_URL).mock(
            return_value=_mock_generation_response("Response text."),
        )
        state = _make_state(
            "What are Jin's skills?",
            query_type="portfolio",
            retrieved_context="Skills: Python, ML",
            retrieval_scores=[0.15],
        )
        generate(state)

        request_body = respx.calls[0].request.read()
        assert b'"max_tokens":1024' in request_body or b'"max_tokens": 1024' in request_body


class TestGeneratorGeneral:
    """Generator should not include portfolio context for general queries."""

    @respx.mock
    def test_general_no_portfolio_context_high_distance(self) -> None:
        route = respx.post(_ANTHROPIC_MESSAGES_URL).mock(
            return_value=_mock_generation_response(
                "A transformer uses self-attention mechanisms.",
            ),
        )

        state = _make_state(
            "How does a transformer work?",
            query_type="general",
            retrieved_context="Some portfolio context that should not appear.",
            retrieval_scores=[0.9],  # high distance = low relevance
        )
        result = generate(state)

        assert result["messages"][0].content == "A transformer uses self-attention mechanisms."

        # Verify portfolio context is NOT in the system prompt
        request_body = route.calls[0].request.read()
        assert b"Some portfolio context that should not appear" not in request_body

    @respx.mock
    def test_general_with_relevant_context(self) -> None:
        """When general query has low-distance retrieval, include context."""
        route = respx.post(_ANTHROPIC_MESSAGES_URL).mock(
            return_value=_mock_generation_response(
                "Domain-specific LLMs are fine-tuned for specific tasks.",
            ),
        )

        state = _make_state(
            "Tell me about domain-specific LLMs",
            query_type="general",
            retrieved_context="YoungIn Jin's domain-specific LLM fine-tuning project.",
            retrieval_scores=[0.3],  # low distance = high relevance
        )
        result = generate(state)

        assert result["messages"][0].content == "Domain-specific LLMs are fine-tuned for specific tasks."

        # Verify the related context IS included in the system prompt
        request_body = route.calls[0].request.read()
        assert b"Related Portfolio Context" in request_body
        assert b"domain-specific LLM fine-tuning project" in request_body

    @respx.mock
    def test_general_no_scores_uses_default_prompt(self) -> None:
        route = respx.post(_ANTHROPIC_MESSAGES_URL).mock(
            return_value=_mock_generation_response("Response."),
        )
        state = _make_state("Explain neural networks", query_type="general")
        generate(state)

        request_body = route.calls[0].request.read()
        assert b"technology" in request_body.lower() or b"Technology" in request_body

    @respx.mock
    def test_general_max_tokens_is_1024(self) -> None:
        respx.post(_ANTHROPIC_MESSAGES_URL).mock(
            return_value=_mock_generation_response("Response."),
        )
        state = _make_state("Explain neural networks", query_type="general")
        generate(state)

        request_body = respx.calls[0].request.read()
        assert b'"max_tokens":1024' in request_body or b'"max_tokens": 1024' in request_body


class TestGeneratorOffTopic:
    """Generator should politely decline off-topic queries."""

    @respx.mock
    def test_off_topic_polite_decline(self) -> None:
        route = respx.post(_ANTHROPIC_MESSAGES_URL).mock(
            return_value=_mock_generation_response(
                "I appreciate your question, but I'm designed to help with "
                "portfolio and technology topics. Feel free to ask about "
                "YoungIn Jin's projects or skills!",
            ),
        )

        state = _make_state("What is the best pizza?", query_type="off_topic")
        result = generate(state)

        assert "portfolio" in result["messages"][0].content.lower() or \
               "YoungIn Jin" in result["messages"][0].content

        # Verify the system prompt instructs polite decline
        request_body = route.calls[0].request.read()
        assert b"polite" in request_body.lower() or b"Politely" in request_body

    @respx.mock
    def test_off_topic_max_tokens_is_1024(self) -> None:
        respx.post(_ANTHROPIC_MESSAGES_URL).mock(
            return_value=_mock_generation_response("Sorry, can't help with that."),
        )
        state = _make_state("Tell me a joke", query_type="off_topic")
        generate(state)

        request_body = respx.calls[0].request.read()
        assert b'"max_tokens":1024' in request_body or b'"max_tokens": 1024' in request_body


class TestGeneratorEdgeCases:
    """Generator should handle edge cases gracefully."""

    @respx.mock
    def test_none_query_type_uses_off_topic(self) -> None:
        route = respx.post(_ANTHROPIC_MESSAGES_URL).mock(
            return_value=_mock_generation_response("Please ask about the portfolio."),
        )

        state = _make_state("random input", query_type=None)
        generate(state)

        # When query_type is None, should fall back to off_topic prompt
        request_body = route.calls[0].request.read()
        assert b"Politely" in request_body or b"politely" in request_body.lower()

    @respx.mock
    def test_empty_messages_still_calls_api(self) -> None:
        respx.post(_ANTHROPIC_MESSAGES_URL).mock(
            return_value=_mock_generation_response("How can I help?"),
        )

        state = {
            "messages": [],
            "query_type": "general",
            "retrieved_context": "",
            "source_documents": [],
            "retrieval_scores": [],
        }
        result = generate(state)

        assert result["messages"][0].content == "How can I help?"
