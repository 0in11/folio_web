"""CLI entry point for the embedding pipeline.

Pipeline: setup_tables -> extract_all -> create_embeddings -> store_embeddings

Usage:
    uv run python -m src.embeddings.cli
"""

from __future__ import annotations

import sys

import psycopg

from src.config import Settings, get_settings
from src.db import get_connection, setup_tables
from src.embeddings.extract import extract_all
from src.embeddings.vectorize import create_embeddings, store_embeddings


def run_pipeline(settings: Settings | None = None) -> None:
    """Execute the full embedding pipeline.

    Steps:
        1. Ensure the portfolio_embeddings table exists.
        2. Connect to the database.
        3. Extract content chunks from all collections.
        4. Create embedding vectors via OpenAI.
        5. Store chunks and embeddings in pgvector.

    Args:
        settings: Optional Settings override (useful for testing).
    """
    settings = settings or get_settings()

    print("Setting up tables...")
    try:
        setup_tables(settings.database_url)
    except (psycopg.Error, OSError) as exc:
        print(f"Failed to set up tables: {exc}")
        sys.exit(1)

    print("Connecting to database...")
    try:
        conn = get_connection(settings.database_url)
    except (psycopg.Error, OSError) as exc:
        print(f"Failed to connect to database: {exc}")
        sys.exit(1)

    try:
        print("Extracting content...")
        chunks = extract_all(conn)

        if not chunks:
            print("No content found. Exiting.")
            return

        print(f"Extracted {len(chunks)} chunks.")

        texts = [chunk.content for chunk in chunks]

        print("Creating embeddings...")
        embeddings = create_embeddings(texts, settings)
        print(f"Created {len(embeddings)} embeddings.")

        print("Storing embeddings...")
        store_embeddings(conn, chunks, embeddings)
        print("Done. Pipeline complete.")
    except (RuntimeError, ConnectionError, psycopg.Error) as exc:
        print(f"Pipeline failed: {exc}")
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    run_pipeline()
