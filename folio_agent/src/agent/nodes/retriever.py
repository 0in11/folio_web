"""RAG retrieval node for portfolio similarity search.

Embeds the user query via OpenAI and performs pgvector cosine similarity
search against the portfolio_embeddings table.
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

import numpy as np
from openai import OpenAI

from src.agent.utils import extract_last_user_text
from src.config import get_settings
from src.db import get_connection

if TYPE_CHECKING:
    from src.agent.state import AgentState


def _embed_query(query: str, api_key: str, model: str) -> list[float]:
    """Create an embedding vector for a single query string.

    Args:
        query: The text to embed.
        api_key: OpenAI API key.
        model: Embedding model name.

    Returns:
        A list of floats representing the embedding vector.
    """
    client = OpenAI(api_key=api_key)
    response = client.embeddings.create(model=model, input=query)
    return response.data[0].embedding


def _search_similar(
    database_url: str,
    query_embedding: list[float],
    top_k: int,
) -> list[dict[str, Any]]:
    """Perform cosine similarity search on portfolio_embeddings.

    Args:
        database_url: PostgreSQL connection string.
        query_embedding: The query embedding vector.
        top_k: Number of results to return.

    Returns:
        A list of dicts with content, source_type, source_id, and metadata.
    """
    conn = get_connection(database_url)
    try:
        rows = conn.execute(
            "SELECT content, source_type, source_id, metadata "
            "FROM portfolio_embeddings "
            "ORDER BY embedding <=> %s "
            "LIMIT %s",
            (np.array(query_embedding), top_k),
        ).fetchall()
    finally:
        conn.close()

    return [
        {
            "content": row[0],
            "source_type": row[1],
            "source_id": row[2],
            "metadata": row[3] if row[3] is not None else {},
        }
        for row in rows
    ]


def retrieve(state: AgentState) -> dict[str, Any]:
    """RAG retrieval node for LangGraph.

    Extracts the last user message, creates a query embedding, and
    performs cosine similarity search against portfolio_embeddings.

    Args:
        state: The current agent state containing messages.

    Returns:
        A dict with retrieved_context (joined text) and
        source_documents (list of source metadata dicts).
    """
    settings = get_settings()

    # Extract last user message text
    messages = state.get("messages", [])
    query = extract_last_user_text(messages)

    if not query:
        return {
            "retrieved_context": "",
            "source_documents": [],
        }

    # Embed the query
    query_embedding = _embed_query(
        query=query,
        api_key=settings.openai_api_key,
        model=settings.embedding_model,
    )

    # Search for similar documents
    results = _search_similar(
        database_url=settings.database_url,
        query_embedding=query_embedding,
        top_k=settings.top_k,
    )

    # Build context string and source documents list
    context_parts = [doc["content"] for doc in results]
    source_documents = [
        {
            "source_type": doc["source_type"],
            "source_id": doc["source_id"],
            "metadata": doc["metadata"],
        }
        for doc in results
    ]

    return {
        "retrieved_context": "\n\n".join(context_parts),
        "source_documents": source_documents,
    }
