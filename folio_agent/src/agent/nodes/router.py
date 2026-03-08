"""Router node that classifies incoming queries into portfolio, general, or off_topic."""

from __future__ import annotations

from typing import Any

import anthropic

from src.agent.state import AgentState
from src.config import get_settings

_SYSTEM_PROMPT = """\
You are a query classifier for YoungIn Jin's AI engineer portfolio chatbot.
Classify the user's query into exactly one of these categories:

- portfolio: Questions about YoungIn Jin's projects, skills, career, work experience, \
education, certifications, awards, publications, or anything related to the portfolio.
- general: General technology, AI, or programming questions that are not specific to \
the portfolio owner.
- off_topic: Irrelevant, harmful, abusive, or non-professional queries.

Respond with ONLY the category name: portfolio, general, or off_topic.
No other text, punctuation, or explanation."""

_VALID_TYPES = frozenset({"portfolio", "general", "off_topic"})


def route(state: AgentState) -> dict[str, Any]:
    """Classify the latest user message and return the query_type update.

    Extracts the last human message from the conversation, sends it to
    Claude for classification, and returns a partial state update with
    the ``query_type`` field set.
    """
    messages = state["messages"]
    last_message = _extract_last_user_text(messages)

    settings = get_settings()
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    response = client.messages.create(
        model=settings.claude_model,
        max_tokens=16,
        system=_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": last_message}],
    )

    raw = response.content[0].text.strip().lower()
    query_type = raw if raw in _VALID_TYPES else "off_topic"

    return {"query_type": query_type}


def _extract_last_user_text(messages: list) -> str:
    """Return the text content of the last user message.

    Handles both plain string messages and LangChain message objects.
    """
    for msg in reversed(messages):
        # LangChain HumanMessage or dict with role
        if hasattr(msg, "type") and msg.type == "human":
            return str(msg.content)
        if isinstance(msg, dict) and msg.get("role") == "user":
            return str(msg.get("content", ""))
    return ""
