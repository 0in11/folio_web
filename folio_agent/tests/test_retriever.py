"""Tests for the RAG retrieval node."""

from unittest.mock import MagicMock, patch

from src.config import Settings


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


def _make_settings(**overrides) -> Settings:
    """Create a Settings instance with test defaults."""
    defaults = {
        "anthropic_api_key": "test-anthropic-key",
        "openai_api_key": "test-openai-key",
        "payload_database_url": "postgresql://localhost/payload",
        "agent_database_url": "postgresql://localhost/agent",
    }
    return Settings(**{**defaults, **overrides})


def _fake_embedding(dim: int = 1536) -> list[float]:
    """Return a zero-filled embedding vector of given dimension."""
    return [0.0] * dim


def _make_state(user_message: str) -> dict:
    """Create a minimal agent state dict with a human message."""
    msg = MagicMock()
    msg.type = "human"
    msg.content = user_message
    return {"messages": [msg]}


# ---------------------------------------------------------------------------
# retrieve – successful retrieval
# ---------------------------------------------------------------------------


class TestRetrieveSuccess:
    @patch("src.agent.nodes.retriever.get_settings")
    @patch("src.agent.nodes.retriever.get_connection")
    @patch("src.agent.nodes.retriever.OpenAI")
    def test_returns_context_sources_and_scores(
        self, mock_openai_cls, mock_get_conn, mock_get_settings
    ):
        settings = _make_settings()
        mock_get_settings.return_value = settings

        # Mock OpenAI embedding response
        embed_item = MagicMock()
        embed_item.embedding = _fake_embedding()
        mock_client = MagicMock()
        mock_openai_cls.return_value = mock_client
        mock_client.embeddings.create.return_value = MagicMock(
            data=[embed_item],
        )

        # Mock DB connection and query results (now includes distance column)
        mock_conn = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.execute.return_value.fetchall.return_value = [
            ("Project A description", "project", "1", {"title": "Project A"}, 0.25),
            ("Skill B description", "skill", "2", {"name": "Python"}, 0.45),
        ]

        from src.agent.nodes.retriever import retrieve

        state = _make_state("Tell me about your projects")
        result = retrieve(state)

        assert "Project A description" in result["retrieved_context"]
        assert "Skill B description" in result["retrieved_context"]
        assert len(result["source_documents"]) == 2
        assert result["source_documents"][0]["source_type"] == "project"
        assert result["source_documents"][0]["source_id"] == "1"
        assert result["source_documents"][0]["metadata"] == {"title": "Project A"}
        assert result["source_documents"][1]["source_type"] == "skill"

        # Verify retrieval_scores
        assert result["retrieval_scores"] == [0.25, 0.45]

        # Verify DB connection was closed
        mock_conn.close.assert_called_once()

    @patch("src.agent.nodes.retriever.get_settings")
    @patch("src.agent.nodes.retriever.get_connection")
    @patch("src.agent.nodes.retriever.OpenAI")
    def test_calls_openai_with_correct_model(
        self, mock_openai_cls, mock_get_conn, mock_get_settings
    ):
        settings = _make_settings()
        mock_get_settings.return_value = settings

        embed_item = MagicMock()
        embed_item.embedding = _fake_embedding()
        mock_client = MagicMock()
        mock_openai_cls.return_value = mock_client
        mock_client.embeddings.create.return_value = MagicMock(data=[embed_item])

        mock_conn = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.execute.return_value.fetchall.return_value = []

        from src.agent.nodes.retriever import retrieve

        state = _make_state("query text")
        retrieve(state)

        mock_openai_cls.assert_called_once_with(api_key="test-openai-key")
        mock_client.embeddings.create.assert_called_once_with(
            model="text-embedding-3-small",
            input="query text",
        )


# ---------------------------------------------------------------------------
# retrieve – empty results
# ---------------------------------------------------------------------------


class TestRetrieveEmpty:
    @patch("src.agent.nodes.retriever.get_settings")
    @patch("src.agent.nodes.retriever.get_connection")
    @patch("src.agent.nodes.retriever.OpenAI")
    def test_empty_db_results(
        self, mock_openai_cls, mock_get_conn, mock_get_settings
    ):
        settings = _make_settings()
        mock_get_settings.return_value = settings

        embed_item = MagicMock()
        embed_item.embedding = _fake_embedding()
        mock_client = MagicMock()
        mock_openai_cls.return_value = mock_client
        mock_client.embeddings.create.return_value = MagicMock(data=[embed_item])

        mock_conn = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.execute.return_value.fetchall.return_value = []

        from src.agent.nodes.retriever import retrieve

        state = _make_state("something unknown")
        result = retrieve(state)

        assert result["retrieved_context"] == ""
        assert result["source_documents"] == []
        assert result["retrieval_scores"] == []

    @patch("src.agent.nodes.retriever.get_settings")
    def test_no_user_message(self, mock_get_settings):
        settings = _make_settings()
        mock_get_settings.return_value = settings

        from src.agent.nodes.retriever import retrieve

        result = retrieve({"messages": []})

        assert result["retrieved_context"] == ""
        assert result["source_documents"] == []
        assert result["retrieval_scores"] == []


# ---------------------------------------------------------------------------
# retrieve – embedding dimension
# ---------------------------------------------------------------------------


class TestRetrieveEmbeddingDimension:
    @patch("src.agent.nodes.retriever.get_settings")
    @patch("src.agent.nodes.retriever.get_connection")
    @patch("src.agent.nodes.retriever.OpenAI")
    def test_uses_correct_embedding_from_openai(
        self, mock_openai_cls, mock_get_conn, mock_get_settings
    ):
        """Verify the embedding returned by OpenAI is passed to the DB query."""
        settings = _make_settings()
        mock_get_settings.return_value = settings

        expected_embedding = [0.1] * 1536
        embed_item = MagicMock()
        embed_item.embedding = expected_embedding
        mock_client = MagicMock()
        mock_openai_cls.return_value = mock_client
        mock_client.embeddings.create.return_value = MagicMock(data=[embed_item])

        mock_conn = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.execute.return_value.fetchall.return_value = []

        from src.agent.nodes.retriever import retrieve

        state = _make_state("test query")
        retrieve(state)

        # Verify the embedding was passed to the SQL query
        call_args = mock_conn.execute.call_args
        sql = call_args[0][0]
        params = call_args[0][1]

        assert "<=>" in sql
        assert "AS distance" in sql
        assert "LIMIT" in sql
        # The numpy array should contain our embedding values
        import numpy as np

        np.testing.assert_array_equal(params[0], np.array(expected_embedding))
        assert params[1] == 5  # default top_k

    @patch("src.agent.nodes.retriever.get_settings")
    @patch("src.agent.nodes.retriever.get_connection")
    @patch("src.agent.nodes.retriever.OpenAI")
    def test_respects_custom_top_k(
        self, mock_openai_cls, mock_get_conn, mock_get_settings
    ):
        settings = _make_settings(top_k=3)
        mock_get_settings.return_value = settings

        embed_item = MagicMock()
        embed_item.embedding = _fake_embedding()
        mock_client = MagicMock()
        mock_openai_cls.return_value = mock_client
        mock_client.embeddings.create.return_value = MagicMock(data=[embed_item])

        mock_conn = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.execute.return_value.fetchall.return_value = []

        from src.agent.nodes.retriever import retrieve

        state = _make_state("test")
        retrieve(state)

        call_args = mock_conn.execute.call_args
        params = call_args[0][1]
        assert params[1] == 3  # custom top_k


# ---------------------------------------------------------------------------
# retrieve – null metadata handling
# ---------------------------------------------------------------------------


class TestRetrieveNullMetadata:
    @patch("src.agent.nodes.retriever.get_settings")
    @patch("src.agent.nodes.retriever.get_connection")
    @patch("src.agent.nodes.retriever.OpenAI")
    def test_null_metadata_becomes_empty_dict(
        self, mock_openai_cls, mock_get_conn, mock_get_settings
    ):
        settings = _make_settings()
        mock_get_settings.return_value = settings

        embed_item = MagicMock()
        embed_item.embedding = _fake_embedding()
        mock_client = MagicMock()
        mock_openai_cls.return_value = mock_client
        mock_client.embeddings.create.return_value = MagicMock(data=[embed_item])

        mock_conn = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.execute.return_value.fetchall.return_value = [
            ("content", "type", "id", None, 0.3),
        ]

        from src.agent.nodes.retriever import retrieve

        state = _make_state("query")
        result = retrieve(state)

        assert result["source_documents"][0]["metadata"] == {}
        assert result["retrieval_scores"] == [0.3]
