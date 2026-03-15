"""Vectorization: create embeddings via OpenAI and store them in pgvector."""

from __future__ import annotations

import json
from decimal import Decimal

import psycopg


class _DecimalEncoder(json.JSONEncoder):
    def default(self, o: object) -> object:
        if isinstance(o, Decimal):
            return float(o)
        return super().default(o)
from openai import OpenAI

from src.config import Settings
from src.embeddings.extract import ContentChunk

INSERT_SQL = """
    INSERT INTO portfolio_embeddings
        (content, source_type, source_id, metadata, embedding)
    VALUES (%s, %s, %s, %s, %s)
"""

DELETE_SQL = "DELETE FROM portfolio_embeddings"


def create_embeddings(
    texts: list[str],
    settings: Settings,
) -> list[list[float]]:
    """Create embeddings for a list of texts using the OpenAI API.

    Args:
        texts: Text strings to embed.
        settings: Application settings containing the API key and model name.

    Returns:
        A list of embedding vectors (one per input text).
    """
    if not texts:
        return []

    client = OpenAI(api_key=settings.openai_api_key)
    response = client.embeddings.create(
        model=settings.embedding_model,
        input=texts,
    )
    return [item.embedding for item in response.data]


def store_embeddings(
    conn: psycopg.Connection,
    chunks: list[ContentChunk],
    embeddings: list[list[float]],
) -> None:
    """Store content chunks with their embeddings in the database.

    Performs a **full refresh** (DELETE all existing rows + INSERT new ones),
    not partial updates.  The DELETE and INSERT are wrapped in an explicit
    transaction so that a failed INSERT rolls back the DELETE.

    Uses parameterized queries for SQL-injection safety.

    Args:
        conn: A psycopg connection with pgvector registered.
              Expected to use ``autocommit=True``; an explicit
              ``conn.transaction()`` block is used for atomicity.
        chunks: Content chunks to store.
        embeddings: Corresponding embedding vectors (same order as chunks).

    Raises:
        psycopg.Error: If a database operation fails.
    """
    with conn.transaction():
        conn.execute(DELETE_SQL)

        params = [
            (
                chunk.content,
                chunk.source_type,
                chunk.source_id,
                json.dumps(chunk.metadata, cls=_DecimalEncoder),
                embedding,
            )
            for chunk, embedding in zip(chunks, embeddings, strict=True)
        ]

        with conn.cursor() as cur:
            cur.executemany(INSERT_SQL, params)
