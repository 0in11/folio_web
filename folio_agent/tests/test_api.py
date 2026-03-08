"""Tests for src.api FastAPI server."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from src.api import app


def _make_mock_graph() -> MagicMock:
    """Create a mock LangGraph compiled graph."""
    graph = MagicMock()

    ai_message = MagicMock()
    ai_message.content = "Hello! I can help with portfolio questions."
    graph.invoke.return_value = {
        "messages": [ai_message],
        "source_documents": [{"title": "About", "url": "/about"}],
    }

    stream_msg = MagicMock()
    stream_msg.content = "Streamed token"
    graph.stream.return_value = [(stream_msg, {"langgraph_node": "generate"})]

    return graph


_mock_graph = _make_mock_graph()


@pytest.fixture(autouse=True)
def _patch_graph() -> None:
    """Inject the mock graph into the api module."""
    with patch("src.api._graph", _mock_graph):
        yield


class TestHealthEndpoint:
    """GET /api/health should return status ok."""

    @pytest.mark.asyncio
    async def test_health_returns_200(self) -> None:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get("/api/health")
            assert resp.status_code == 200
            assert resp.json() == {"status": "ok"}


class TestChatEndpoint:
    """POST /api/chat should return a valid ChatResponse."""

    @pytest.mark.asyncio
    async def test_chat_returns_valid_structure(self) -> None:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/api/chat",
                json={"message": "Tell me about Jin's projects"},
            )
            assert resp.status_code == 200
            data = resp.json()
            assert "response" in data
            assert "sources" in data
            assert "thread_id" in data
            assert data["response"] == "Hello! I can help with portfolio questions."
            assert isinstance(data["sources"], list)

    @pytest.mark.asyncio
    async def test_chat_generates_thread_id_when_missing(self) -> None:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/api/chat",
                json={"message": "Hello"},
            )
            data = resp.json()
            assert data["thread_id"]
            assert len(data["thread_id"]) == 36  # UUID4 format

    @pytest.mark.asyncio
    async def test_chat_preserves_provided_thread_id(self) -> None:
        custom_id = "my-custom-thread-id-123"
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/api/chat",
                json={"message": "Hello", "thread_id": custom_id},
            )
            data = resp.json()
            assert data["thread_id"] == custom_id

    @pytest.mark.asyncio
    async def test_chat_invokes_graph_with_correct_args(self) -> None:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            await client.post(
                "/api/chat",
                json={"message": "What skills does Jin have?", "thread_id": "t1"},
            )
            _mock_graph.invoke.assert_called()
            call_args = _mock_graph.invoke.call_args
            assert call_args[0][0] == {"messages": [("user", "What skills does Jin have?")]}
            assert call_args[1]["config"]["configurable"]["thread_id"] == "t1"

    @pytest.mark.asyncio
    async def test_chat_returns_sources(self) -> None:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/api/chat",
                json={"message": "Projects?"},
            )
            data = resp.json()
            assert len(data["sources"]) == 1
            assert data["sources"][0]["title"] == "About"


class TestChatStreamEndpoint:
    """POST /api/chat/stream should return an SSE response."""

    @pytest.mark.asyncio
    async def test_stream_returns_200(self) -> None:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/api/chat/stream",
                json={"message": "Tell me about Jin"},
            )
            assert resp.status_code == 200
            assert "text/event-stream" in resp.headers.get("content-type", "")


class TestRateLimitHeaders:
    """Rate limit headers should be present on chat responses."""

    @pytest.mark.asyncio
    async def test_rate_limit_headers_present(self) -> None:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/api/chat",
                json={"message": "Hello"},
            )
            headers_lower = {k.lower(): v for k, v in resp.headers.items()}
            assert "x-ratelimit-limit" in headers_lower
            assert "x-ratelimit-remaining" in headers_lower
