"""Tests for the database module."""

from unittest.mock import MagicMock, patch

from src.db import CREATE_TABLE_SQL, get_connection, setup_tables


class TestGetConnection:
    """Tests for get_connection."""

    def test_get_connection_is_callable(self):
        assert callable(get_connection)

    @patch("src.db.register_vector")
    @patch("src.db.psycopg.connect")
    def test_get_connection_returns_connection(self, mock_connect, mock_register):
        mock_conn = MagicMock()
        mock_connect.return_value = mock_conn

        result = get_connection("postgresql://localhost/test")

        mock_connect.assert_called_once_with(
            "postgresql://localhost/test", autocommit=True
        )
        mock_register.assert_called_once_with(mock_conn)
        assert result is mock_conn


class TestSetupTables:
    """Tests for setup_tables."""

    def test_setup_tables_is_callable(self):
        assert callable(setup_tables)

    @patch("src.db.get_connection")
    def test_setup_tables_executes_sql(self, mock_get_conn):
        mock_conn = MagicMock()
        mock_get_conn.return_value = mock_conn

        setup_tables("postgresql://localhost/test")

        mock_get_conn.assert_called_once_with("postgresql://localhost/test")
        assert mock_conn.execute.call_count == 2
        mock_conn.close.assert_called_once()

    @patch("src.db.get_connection")
    def test_setup_tables_closes_connection_on_error(self, mock_get_conn):
        mock_conn = MagicMock()
        mock_conn.execute.side_effect = RuntimeError("db error")
        mock_get_conn.return_value = mock_conn

        try:
            setup_tables("postgresql://localhost/test")
        except RuntimeError:
            pass

        mock_conn.close.assert_called_once()


class TestCreateTableSQL:
    """Tests for the CREATE TABLE SQL statement."""

    def test_sql_contains_table_name(self):
        assert "portfolio_embeddings" in CREATE_TABLE_SQL

    def test_sql_contains_id_column(self):
        assert "id SERIAL PRIMARY KEY" in CREATE_TABLE_SQL

    def test_sql_contains_content_column(self):
        assert "content TEXT NOT NULL" in CREATE_TABLE_SQL

    def test_sql_contains_source_type_column(self):
        assert "source_type TEXT NOT NULL" in CREATE_TABLE_SQL

    def test_sql_contains_source_id_column(self):
        assert "source_id TEXT NOT NULL" in CREATE_TABLE_SQL

    def test_sql_contains_metadata_column(self):
        assert "metadata JSONB" in CREATE_TABLE_SQL

    def test_sql_contains_embedding_column(self):
        assert "vector(1536)" in CREATE_TABLE_SQL

    def test_sql_contains_created_at_column(self):
        assert "created_at TIMESTAMPTZ" in CREATE_TABLE_SQL

    def test_sql_uses_create_if_not_exists(self):
        assert "CREATE TABLE IF NOT EXISTS" in CREATE_TABLE_SQL
