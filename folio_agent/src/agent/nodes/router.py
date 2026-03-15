"""Router node that classifies incoming queries using retrieval context."""

from __future__ import annotations

import logging
from typing import Any

import anthropic

logger = logging.getLogger(__name__)

from src.agent.state import AgentState
from src.agent.utils import extract_last_user_text
from src.config import get_settings

_SYSTEM_PROMPT = """\
You are a query classifier for YoungIn Jin's AI engineer portfolio chatbot.
Classify the user's query into exactly one of these categories:

- portfolio: Questions about YoungIn Jin's projects, skills, career, work experience, \
education, certifications, awards, publications, or anything related to the portfolio. \
Also classify as portfolio when the retrieval results show high relevance \
(low distance scores) to the user's query, even if the query is phrased generally.
- general: General technology, AI, or programming questions that are not specific to \
the portfolio owner AND have no highly relevant retrieval results.
- off_topic: Irrelevant, harmful, abusive, or non-professional queries.

You will be given the user's query along with retrieval results from the portfolio \
knowledge base, including distance scores (lower = more relevant). Use both the query \
intent and the retrieval relevance to make your classification.

Respond with ONLY the category name: portfolio, general, or off_topic.
No other text, punctuation, or explanation."""

_VALID_TYPES = frozenset({"portfolio", "general", "off_topic"})


def _build_context_summary(
    source_documents: list[dict],
    retrieval_scores: list[float],
    retrieved_context: str,
) -> str:
    """Summarize retrieval results for the classification prompt.

    Produces a compact text block listing each result's type and distance,
    plus a snippet of the top result for additional signal.
    """
    if not source_documents:
        return "No retrieval results found."

    lines = []
    for i, (doc, score) in enumerate(zip(source_documents, retrieval_scores), 1):
        source_type = doc.get("source_type", "unknown")
        lines.append(f"Result {i}: [type={source_type}, distance={score:.4f}]")

    summary = "\n".join(lines)

    # Add a snippet of the top result (first 200 chars)
    if retrieved_context:
        snippet = retrieved_context[:200]
        summary += f"\nTop result snippet: {snippet}"

    return summary


def route(state: AgentState) -> dict[str, Any]:
    """Classify the latest user message using retrieval context.

    Extracts the last human message, builds a summary of retrieval results,
    sends both to Claude for classification, and returns a partial state
    update with the ``query_type`` field set.
    """
    messages = state["messages"]
    last_message = extract_last_user_text(messages)

    source_documents = state.get("source_documents", [])
    retrieval_scores = state.get("retrieval_scores", [])
    retrieved_context = state.get("retrieved_context", "")

    context_summary = _build_context_summary(
        source_documents, retrieval_scores, retrieved_context,
    )

    classification_input = (
        f"User query: {last_message}\n\n"
        f"Retrieval results:\n{context_summary}"
    )

    settings = get_settings()
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    response = client.messages.create(
        model=settings.claude_model,
        max_tokens=16,
        system=_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": classification_input}],
    )

    raw = response.content[0].text.strip().lower()
    query_type = raw if raw in _VALID_TYPES else "off_topic"

    logger.info("── router  | query=%r | type=%s (raw=%r)", last_message, query_type, raw)

    return {"query_type": query_type}
