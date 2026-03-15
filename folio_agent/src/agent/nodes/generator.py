"""Generator node that produces context-aware responses using Claude."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

import anthropic
from langchain_core.messages import AIMessage

from src.agent.utils import extract_last_user_text
from src.config import get_settings

if TYPE_CHECKING:
    from src.agent.state import AgentState

_PORTFOLIO_SYSTEM_PROMPT = """\
You are a helpful assistant for YoungIn Jin's AI engineer portfolio website.
Answer the user's question based on the following portfolio context.
Be concise, accurate, and professional. If the context does not contain \
enough information to fully answer, say so honestly.

--- Portfolio Context ---
{context}"""

_GENERAL_SYSTEM_PROMPT = """\
You are a helpful technology and AI assistant on YoungIn Jin's portfolio website.
Answer the user's general technology or AI question clearly and concisely.
Do not fabricate information about YoungIn Jin or the portfolio."""

_GENERAL_WITH_CONTEXT_PROMPT = """\
You are a helpful technology and AI assistant on YoungIn Jin's portfolio website.
Answer the user's general technology or AI question clearly and concisely.
You may reference the following related portfolio context if it adds value \
to your answer, but do not force it. Do not fabricate information.

--- Related Portfolio Context ---
{context}"""

_OFF_TOPIC_SYSTEM_PROMPT = """\
You are an assistant on YoungIn Jin's AI engineer portfolio website.
The user's message is outside the scope of this chatbot.
Politely decline and suggest they ask about YoungIn Jin's portfolio, \
projects, skills, career, or general technology and AI topics instead.
Keep your response brief and friendly."""


def _build_system_prompt(
    query_type: str | None,
    retrieved_context: str,
    retrieval_scores: list[float],
) -> str:
    """Build the system prompt based on query type, context, and scores."""
    if query_type == "portfolio":
        return _PORTFOLIO_SYSTEM_PROMPT.format(context=retrieved_context or "No context available.")
    if query_type == "general":
        has_relevant_context = (
            retrieval_scores
            and min(retrieval_scores) < 0.7
            and retrieved_context
        )
        if has_relevant_context:
            return _GENERAL_WITH_CONTEXT_PROMPT.format(context=retrieved_context)
        return _GENERAL_SYSTEM_PROMPT
    return _OFF_TOPIC_SYSTEM_PROMPT


def generate(state: AgentState) -> dict[str, Any]:
    """Generate a response using Claude based on query type and context.

    Builds a context-aware system prompt depending on the query_type,
    calls the Anthropic API with max_tokens=1024 for cost protection,
    and returns the response wrapped in an AIMessage.
    """
    query_type = state.get("query_type")
    retrieved_context = state.get("retrieved_context", "")
    retrieval_scores = state.get("retrieval_scores", [])
    messages = state.get("messages", [])
    last_message = extract_last_user_text(messages)

    system_prompt = _build_system_prompt(query_type, retrieved_context, retrieval_scores)

    settings = get_settings()
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    response = client.messages.create(
        model=settings.claude_model,
        max_tokens=1024,
        system=system_prompt,
        messages=[{"role": "user", "content": last_message}],
    )

    response_text = response.content[0].text

    return {"messages": [AIMessage(content=response_text)]}
