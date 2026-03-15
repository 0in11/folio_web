"""Tests for the embedding pipeline CLI."""

from unittest.mock import MagicMock, call, patch

import pytest

from src.config import Settings
from src.embeddings.cli import run_pipeline
from src.embeddings.extract import ContentChunk


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


def _make_chunks(n: int = 3) -> list[ContentChunk]:
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


# ---------------------------------------------------------------------------
# Happy path
# ---------------------------------------------------------------------------


class TestRunPipelineSuccess:
    @patch("src.embeddings.cli.store_embeddings")
    @patch("src.embeddings.cli.create_embeddings")
    @patch("src.embeddings.cli.extract_all")
    @patch("src.embeddings.cli.get_connection")
    @patch("src.embeddings.cli.setup_tables")
    def test_full_pipeline_execution_order(
        self,
        mock_setup,
        mock_get_conn,
        mock_extract,
        mock_create,
        mock_store,
    ):
        settings = _make_settings()
        chunks = _make_chunks(2)
        embeddings = [[0.1] * 1536, [0.2] * 1536]

        payload_conn = MagicMock(name="payload_conn")
        agent_conn = MagicMock(name="agent_conn")
        mock_get_conn.side_effect = [payload_conn, agent_conn]
        mock_extract.return_value = chunks
        mock_create.return_value = embeddings

        run_pipeline(settings)

        # Verify call order
        mock_setup.assert_called_once_with(settings.agent_database_url)
        assert mock_get_conn.call_count == 2
        mock_get_conn.assert_any_call(settings.payload_database_url)
        mock_get_conn.assert_any_call(settings.agent_database_url)
        mock_extract.assert_called_once_with(payload_conn)
        mock_create.assert_called_once_with(
            [c.content for c in chunks],
            settings,
        )
        mock_store.assert_called_once_with(agent_conn, chunks, embeddings)
        payload_conn.close.assert_called_once()
        agent_conn.close.assert_called_once()

    @patch("src.embeddings.cli.store_embeddings")
    @patch("src.embeddings.cli.create_embeddings")
    @patch("src.embeddings.cli.extract_all")
    @patch("src.embeddings.cli.get_connection")
    @patch("src.embeddings.cli.setup_tables")
    def test_uses_get_settings_when_none_provided(
        self,
        mock_setup,
        mock_get_conn,
        mock_extract,
        mock_create,
        mock_store,
    ):
        payload_conn = MagicMock(name="payload_conn")
        agent_conn = MagicMock(name="agent_conn")
        mock_get_conn.side_effect = [payload_conn, agent_conn]
        mock_extract.return_value = _make_chunks(1)
        mock_create.return_value = [[0.0] * 1536]

        with patch("src.embeddings.cli.get_settings") as mock_get_settings:
            fake_settings = _make_settings()
            mock_get_settings.return_value = fake_settings

            run_pipeline()

            mock_get_settings.assert_called_once()
            mock_setup.assert_called_once_with(fake_settings.agent_database_url)

        payload_conn.close.assert_called_once()
        agent_conn.close.assert_called_once()

    @patch("src.embeddings.cli.store_embeddings")
    @patch("src.embeddings.cli.create_embeddings")
    @patch("src.embeddings.cli.extract_all")
    @patch("src.embeddings.cli.get_connection")
    @patch("src.embeddings.cli.setup_tables")
    def test_prints_progress(
        self,
        mock_setup,
        mock_get_conn,
        mock_extract,
        mock_create,
        mock_store,
        capsys,
    ):
        settings = _make_settings()
        payload_conn = MagicMock(name="payload_conn")
        agent_conn = MagicMock(name="agent_conn")
        mock_get_conn.side_effect = [payload_conn, agent_conn]
        mock_extract.return_value = _make_chunks(3)
        mock_create.return_value = [[0.0] * 1536] * 3

        run_pipeline(settings)

        output = capsys.readouterr().out
        assert "Setting up tables" in output
        assert "Connecting to databases" in output
        assert "Extracting content" in output
        assert "Extracted 3 chunks" in output
        assert "Creating embeddings" in output
        assert "Created 3 embeddings" in output
        assert "Storing embeddings" in output
        assert "Done" in output


# ---------------------------------------------------------------------------
# Empty chunks - early exit
# ---------------------------------------------------------------------------


class TestRunPipelineEmptyChunks:
    @patch("src.embeddings.cli.store_embeddings")
    @patch("src.embeddings.cli.create_embeddings")
    @patch("src.embeddings.cli.extract_all")
    @patch("src.embeddings.cli.get_connection")
    @patch("src.embeddings.cli.setup_tables")
    def test_empty_chunks_skips_embedding(
        self,
        mock_setup,
        mock_get_conn,
        mock_extract,
        mock_create,
        mock_store,
        capsys,
    ):
        settings = _make_settings()
        payload_conn = MagicMock(name="payload_conn")
        agent_conn = MagicMock(name="agent_conn")
        mock_get_conn.side_effect = [payload_conn, agent_conn]
        mock_extract.return_value = []

        run_pipeline(settings)

        mock_create.assert_not_called()
        mock_store.assert_not_called()
        payload_conn.close.assert_called_once()
        agent_conn.close.assert_called_once()

        output = capsys.readouterr().out
        assert "No content found" in output


# ---------------------------------------------------------------------------
# Error handling
# ---------------------------------------------------------------------------


class TestRunPipelineErrors:
    @patch("src.embeddings.cli.setup_tables")
    def test_setup_tables_failure_exits(self, mock_setup, capsys):
        settings = _make_settings()
        mock_setup.side_effect = ConnectionError("connection refused")

        with pytest.raises(SystemExit) as exc_info:
            run_pipeline(settings)

        assert exc_info.value.code == 1
        output = capsys.readouterr().out
        assert "Failed to set up tables" in output

    @patch("src.embeddings.cli.get_connection")
    @patch("src.embeddings.cli.setup_tables")
    def test_payload_connection_failure_exits(
        self, mock_setup, mock_get_conn, capsys
    ):
        settings = _make_settings()
        mock_get_conn.side_effect = ConnectionError("connection refused")

        with pytest.raises(SystemExit) as exc_info:
            run_pipeline(settings)

        assert exc_info.value.code == 1
        output = capsys.readouterr().out
        assert "Failed to connect to Payload database" in output

    @patch("src.embeddings.cli.get_connection")
    @patch("src.embeddings.cli.setup_tables")
    def test_agent_connection_failure_closes_payload_conn(
        self, mock_setup, mock_get_conn, capsys
    ):
        settings = _make_settings()
        payload_conn = MagicMock(name="payload_conn")
        mock_get_conn.side_effect = [payload_conn, ConnectionError("connection refused")]

        with pytest.raises(SystemExit) as exc_info:
            run_pipeline(settings)

        assert exc_info.value.code == 1
        output = capsys.readouterr().out
        assert "Failed to connect to Agent database" in output
        payload_conn.close.assert_called_once()

    @patch("src.embeddings.cli.extract_all")
    @patch("src.embeddings.cli.get_connection")
    @patch("src.embeddings.cli.setup_tables")
    def test_extract_runtime_error_exits(
        self, mock_setup, mock_get_conn, mock_extract, capsys
    ):
        settings = _make_settings()
        payload_conn = MagicMock(name="payload_conn")
        agent_conn = MagicMock(name="agent_conn")
        mock_get_conn.side_effect = [payload_conn, agent_conn]
        mock_extract.side_effect = RuntimeError("extraction failed")

        with pytest.raises(SystemExit) as exc_info:
            run_pipeline(settings)

        assert exc_info.value.code == 1
        output = capsys.readouterr().out
        assert "Pipeline failed" in output
        payload_conn.close.assert_called_once()
        agent_conn.close.assert_called_once()

    @patch("src.embeddings.cli.create_embeddings")
    @patch("src.embeddings.cli.extract_all")
    @patch("src.embeddings.cli.get_connection")
    @patch("src.embeddings.cli.setup_tables")
    def test_both_conns_closed_even_on_error(
        self, mock_setup, mock_get_conn, mock_extract, mock_create
    ):
        settings = _make_settings()
        payload_conn = MagicMock(name="payload_conn")
        agent_conn = MagicMock(name="agent_conn")
        mock_get_conn.side_effect = [payload_conn, agent_conn]
        mock_extract.return_value = _make_chunks(1)
        mock_create.side_effect = RuntimeError("API error")

        with pytest.raises(SystemExit):
            run_pipeline(settings)

        payload_conn.close.assert_called_once()
        agent_conn.close.assert_called_once()
