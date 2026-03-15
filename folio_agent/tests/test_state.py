"""Tests for src.agent.state module."""

from __future__ import annotations

import typing

from langchain_core.messages import HumanMessage

from src.agent.state import AgentState


class TestAgentStateFields:
    """AgentState must declare the expected fields with correct types."""

    def test_has_messages_field(self) -> None:
        hints = typing.get_type_hints(AgentState, include_extras=True)
        assert "messages" in hints

    def test_has_query_type_field(self) -> None:
        hints = typing.get_type_hints(AgentState)
        assert "query_type" in hints

    def test_has_retrieved_context_field(self) -> None:
        hints = typing.get_type_hints(AgentState)
        assert "retrieved_context" in hints

    def test_has_source_documents_field(self) -> None:
        hints = typing.get_type_hints(AgentState)
        assert "source_documents" in hints

    def test_has_retrieval_scores_field(self) -> None:
        hints = typing.get_type_hints(AgentState)
        assert "retrieval_scores" in hints


class TestAgentStateDefaults:
    """AgentState should be instantiable with sensible defaults."""

    def test_minimal_instantiation(self) -> None:
        state: AgentState = {
            "messages": [],
            "query_type": None,
            "retrieved_context": "",
            "source_documents": [],
            "retrieval_scores": [],
        }
        assert state["messages"] == []
        assert state["query_type"] is None
        assert state["retrieved_context"] == ""
        assert state["source_documents"] == []
        assert state["retrieval_scores"] == []

    def test_with_messages(self) -> None:
        msg = HumanMessage(content="Hello")
        state: AgentState = {
            "messages": [msg],
            "query_type": "portfolio",
            "retrieved_context": "some context",
            "source_documents": [{"title": "doc1"}],
            "retrieval_scores": [0.25],
        }
        assert len(state["messages"]) == 1
        assert state["messages"][0].content == "Hello"
        assert state["query_type"] == "portfolio"
        assert state["retrieval_scores"] == [0.25]

    def test_query_type_accepts_all_literals(self) -> None:
        for qt in ("portfolio", "general", "off_topic", None):
            state: AgentState = {
                "messages": [],
                "query_type": qt,
                "retrieved_context": "",
                "source_documents": [],
                "retrieval_scores": [],
            }
            assert state["query_type"] == qt


class TestAgentStateInheritance:
    """AgentState must extend MessagesState."""

    def test_extends_messages_state(self) -> None:
        from langgraph.graph import MessagesState

        # TypedDict flattens __bases__; use __orig_bases__ instead.
        assert MessagesState in AgentState.__orig_bases__

    def test_messages_field_has_add_messages_annotation(self) -> None:
        """The messages field should carry the add_messages reducer metadata."""
        hints = typing.get_type_hints(AgentState, include_extras=True)
        messages_hint = hints["messages"]
        # Annotated types expose __metadata__
        assert hasattr(messages_hint, "__metadata__")
