"""LangGraph agent state definition for the portfolio chatbot."""

from __future__ import annotations

from typing import Literal

from langgraph.graph import MessagesState


class AgentState(MessagesState):
    """State schema for the portfolio chatbot graph.

    Extends MessagesState (which provides a ``messages`` field with the
    ``add_messages`` reducer) with fields for query classification,
    retrieved context, and source document references.
    """

    query_type: Literal["portfolio", "general", "off_topic"] | None
    retrieved_context: str
    source_documents: list[dict]
