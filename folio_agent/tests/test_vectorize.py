"""Tests for vectorization: embedding creation and storage."""

from unittest.mock import MagicMock, patch

from src.config import Settings
from src.embeddings.extract import ContentChunk
from src.embeddings.vectorize import create_embeddings, store_embeddings


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


def _make_settings(**overrides) -> Settings:
    """Create a Settings instance with test defaults."""
    defaults = {
        "anthropic_api_key": "test-anthropic-key",
        "openai_api_key": "test-openai-key",
        "database_url": "postgresql://localhost/test",
    }
    return Settings(**{**defaults, **overrides})


def _make_chunks(n: int = 2) -> list[ContentChunk]:
    """Create *n* sample ContentChunk instances."""
    return [
        ContentChunk(
            content=f"content-{i}",
            source_type="test",
            source_id=str(i),
            metadata={"index": i},
        )
        for i in range(n)
    ]


def _fake_embedding(dim: int = 1536) -> list[float]:
    """Return a zero-filled embedding vector of given dimension."""
    return [0.0] * dim


# ---------------------------------------------------------------------------
# create_embeddings
# ---------------------------------------------------------------------------


class TestCreateEmbeddings:
    def test_empty_texts_returns_empty(self):
        settings = _make_settings()
        result = create_embeddings([], settings)
        assert result == []

    @patch("src.embeddings.vectorize.OpenAI")
    def test_calls_openai_with_correct_params(self, mock_openai_cls):
        settings = _make_settings()
        texts = ["hello", "world"]

        # Set up mock response
        item_a = MagicMock()
        item_a.embedding = [1.0, 2.0]
        item_b = MagicMock()
        item_b.embedding = [3.0, 4.0]

        mock_client = MagicMock()
        mock_openai_cls.return_value = mock_client
        mock_client.embeddings.create.return_value = MagicMock(
            data=[item_a, item_b],
        )

        result = create_embeddings(texts, settings)

        mock_openai_cls.assert_called_once_with(api_key="test-openai-key")
        mock_client.embeddings.create.assert_called_once_with(
            model="text-embedding-3-small",
            input=texts,
        )
        assert result == [[1.0, 2.0], [3.0, 4.0]]

    @patch("src.embeddings.vectorize.OpenAI")
    def test_single_text(self, mock_openai_cls):
        settings = _make_settings()

        item = MagicMock()
        item.embedding = [0.5] * 1536

        mock_client = MagicMock()
        mock_openai_cls.return_value = mock_client
        mock_client.embeddings.create.return_value = MagicMock(data=[item])

        result = create_embeddings(["single text"], settings)

        assert len(result) == 1
        assert result[0] == [0.5] * 1536

    @patch("src.embeddings.vectorize.OpenAI")
    def test_uses_custom_model(self, mock_openai_cls):
        settings = _make_settings(embedding_model="text-embedding-3-large")

        mock_client = MagicMock()
        mock_openai_cls.return_value = mock_client
        mock_client.embeddings.create.return_value = MagicMock(data=[])

        create_embeddings(["text"], settings)

        mock_client.embeddings.create.assert_called_once_with(
            model="text-embedding-3-large",
            input=["text"],
        )


# ---------------------------------------------------------------------------
# store_embeddings
# ---------------------------------------------------------------------------


class TestStoreEmbeddings:
    def test_deletes_existing_then_inserts(self):
        conn = MagicMock()
        cur = MagicMock()
        ctx = MagicMock()
        ctx.__enter__ = MagicMock(return_value=cur)
        ctx.__exit__ = MagicMock(return_value=False)
        conn.cursor.return_value = ctx

        chunks = _make_chunks(2)
        embeddings = [_fake_embedding(), _fake_embedding()]

        store_embeddings(conn, chunks, embeddings)

        # DELETE is called first via conn.execute
        conn.execute.assert_called_once_with("DELETE FROM portfolio_embeddings")

        # INSERT is called via cursor.executemany
        cur.executemany.assert_called_once()
        call_args = cur.executemany.call_args
        sql = call_args[0][0]
        params = call_args[0][1]

        assert "INSERT INTO portfolio_embeddings" in sql
        assert len(params) == 2

        # Verify first row params
        content, source_type, source_id, metadata_json, embedding = params[0]
        assert content == "content-0"
        assert source_type == "test"
        assert source_id == "0"
        assert '"index": 0' in metadata_json
        assert embedding == _fake_embedding()

    def test_empty_chunks(self):
        conn = MagicMock()
        cur = MagicMock()
        ctx = MagicMock()
        ctx.__enter__ = MagicMock(return_value=cur)
        ctx.__exit__ = MagicMock(return_value=False)
        conn.cursor.return_value = ctx

        store_embeddings(conn, [], [])

        conn.execute.assert_called_once_with("DELETE FROM portfolio_embeddings")
        cur.executemany.assert_called_once()
        params = cur.executemany.call_args[0][1]
        assert params == []

    def test_metadata_serialized_as_json(self):
        conn = MagicMock()
        cur = MagicMock()
        ctx = MagicMock()
        ctx.__enter__ = MagicMock(return_value=cur)
        ctx.__exit__ = MagicMock(return_value=False)
        conn.cursor.return_value = ctx

        chunks = [
            ContentChunk(
                content="test",
                source_type="projects",
                source_id="1",
                metadata={"title": "ML Pipeline", "technologies": ["Python"]},
            ),
        ]
        embeddings = [_fake_embedding()]

        store_embeddings(conn, chunks, embeddings)

        params = cur.executemany.call_args[0][1]
        metadata_json = params[0][3]
        import json
        parsed = json.loads(metadata_json)
        assert parsed == {"title": "ML Pipeline", "technologies": ["Python"]}
