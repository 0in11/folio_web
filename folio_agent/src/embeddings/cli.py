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
        1. Ensure the portfolio_embeddings table exists (Agent DB).
        2. Connect to both databases (Payload for reading, Agent for writing).
        3. Extract content chunks from Payload CMS collections.
        4. Create embedding vectors via OpenAI.
        5. Store chunks and embeddings in Agent DB via pgvector.

    Args:
        settings: Optional Settings override (useful for testing).
    """
    settings = settings or get_settings()

    print("Setting up tables...")
    try:
        setup_tables(settings.agent_database_url)
    except (psycopg.Error, OSError) as exc:
        print(f"Failed to set up tables: {exc}")
        sys.exit(1)

    print("Connecting to databases...")
    try:
        payload_conn = get_connection(settings.payload_database_url)
    except (psycopg.Error, OSError) as exc:
        print(f"Failed to connect to Payload database: {exc}")
        sys.exit(1)

    try:
        agent_conn = get_connection(settings.agent_database_url)
    except (psycopg.Error, OSError) as exc:
        print(f"Failed to connect to Agent database: {exc}")
        payload_conn.close()
        sys.exit(1)

    try:
        print("Extracting content...")
        chunks = extract_all(payload_conn)

        if not chunks:
            print("No content found. Exiting.")
            return

        print(f"Extracted {len(chunks)} chunks.")

        texts = [chunk.content for chunk in chunks]

        print("Creating embeddings...")
        embeddings = create_embeddings(texts, settings)
        print(f"Created {len(embeddings)} embeddings.")

        print("Storing embeddings...")
        store_embeddings(agent_conn, chunks, embeddings)
        print("Done. Pipeline complete.")
    except (RuntimeError, ConnectionError, psycopg.Error) as exc:
        print(f"Pipeline failed: {exc}")
        sys.exit(1)
    finally:
        payload_conn.close()
        agent_conn.close()


if __name__ == "__main__":
    run_pipeline()
