"""Database module for portfolio embeddings with pgvector support."""

import psycopg
from pgvector.psycopg import register_vector


CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS portfolio_embeddings (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    source_type TEXT NOT NULL,
    source_id TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    embedding vector(1536) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
"""

CREATE_EXTENSION_SQL = "CREATE EXTENSION IF NOT EXISTS vector;"


def get_connection(database_url: str) -> psycopg.Connection:
    """Return a psycopg connection with pgvector type registered.

    Args:
        database_url: PostgreSQL connection string.

    Returns:
        A psycopg Connection with vector type support.

    Raises:
        psycopg.Error: If the connection cannot be established.
    """
    conn = psycopg.connect(database_url, autocommit=True)
    register_vector(conn)
    return conn


def setup_tables(database_url: str) -> None:
    """Create the portfolio_embeddings table if it does not exist.

    Enables the pgvector extension and creates the table with all
    required columns for storing document embeddings.

    Args:
        database_url: PostgreSQL connection string.

    Raises:
        psycopg.Error: If table creation fails.
    """
    conn = get_connection(database_url)
    try:
        conn.execute(CREATE_EXTENSION_SQL)
        conn.execute(CREATE_TABLE_SQL)
    finally:
        conn.close()
