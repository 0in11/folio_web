"""Tests for the LangGraph graph assembly."""

from __future__ import annotations

from typing import Any
from unittest.mock import patch


from src.agent.graph import _route_by_query_type, create_graph


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _mock_route(state: dict) -> dict[str, Any]:
    """Stub router that echoes back a pre-set query_type."""
    return {"query_type": state.get("query_type")}


def _mock_retrieve(state: dict) -> dict[str, Any]:
    """Stub retriever that returns fixed context."""
    return {
        "retrieved_context": "mock context",
        "source_documents": [{"source_type": "test", "source_id": "1", "metadata": {}}],
    }


def _mock_generate(state: dict) -> dict[str, Any]:
    """Stub generator that returns a fixed message."""
    from langchain_core.messages import AIMessage

    return {"messages": [AIMessage(content="mock response")]}


# ---------------------------------------------------------------------------
# Graph compilation
# ---------------------------------------------------------------------------

class TestGraphCompilation:
    """The graph should compile successfully and contain the expected nodes."""

    @patch("src.agent.nodes.generator.generate", _mock_generate)
    def test_graph_compiles(self) -> None:
        graph = create_graph()
        assert graph is not None

    @patch("src.agent.nodes.generator.generate", _mock_generate)
    def test_graph_has_expected_nodes(self) -> None:
        graph = create_graph()
        node_names = set(graph.get_graph().nodes.keys())
        # LangGraph adds __start__ and __end__ sentinel nodes
        assert "router" in node_names
        assert "retrieve" in node_names
        assert "generate" in node_names


# ---------------------------------------------------------------------------
# Conditional routing logic
# ---------------------------------------------------------------------------

class TestConditionalRouting:
    """The routing function should direct portfolio queries to retrieve
    and all other queries directly to generate."""

    def test_portfolio_routes_to_retrieve(self) -> None:
        state = {"query_type": "portfolio"}
        assert _route_by_query_type(state) == "retrieve"

    def test_general_routes_to_generate(self) -> None:
        state = {"query_type": "general"}
        assert _route_by_query_type(state) == "generate"

    def test_off_topic_routes_to_generate(self) -> None:
        state = {"query_type": "off_topic"}
        assert _route_by_query_type(state) == "generate"

    def test_none_query_type_routes_to_generate(self) -> None:
        state = {"query_type": None}
        assert _route_by_query_type(state) == "generate"

    def test_missing_query_type_routes_to_generate(self) -> None:
        state: dict[str, Any] = {}
        assert _route_by_query_type(state) == "generate"


# ---------------------------------------------------------------------------
# Graph edge structure
# ---------------------------------------------------------------------------

class TestGraphEdges:
    """The compiled graph should have the correct edge connections."""

    @patch("src.agent.nodes.generator.generate", _mock_generate)
    def test_start_connects_to_router(self) -> None:
        graph = create_graph()
        graph_repr = graph.get_graph()
        start_edges = [
            edge.target for edge in graph_repr.edges if edge.source == "__start__"
        ]
        assert "router" in start_edges

    @patch("src.agent.nodes.generator.generate", _mock_generate)
    def test_retrieve_connects_to_generate(self) -> None:
        graph = create_graph()
        graph_repr = graph.get_graph()
        retrieve_edges = [
            edge.target for edge in graph_repr.edges if edge.source == "retrieve"
        ]
        assert "generate" in retrieve_edges

    @patch("src.agent.nodes.generator.generate", _mock_generate)
    def test_generate_connects_to_end(self) -> None:
        graph = create_graph()
        graph_repr = graph.get_graph()
        generate_edges = [
            edge.target for edge in graph_repr.edges if edge.source == "generate"
        ]
        assert "__end__" in generate_edges

    @patch("src.agent.nodes.generator.generate", _mock_generate)
    def test_router_has_conditional_edges(self) -> None:
        graph = create_graph()
        graph_repr = graph.get_graph()
        router_edges = [
            edge.target for edge in graph_repr.edges if edge.source == "router"
        ]
        assert "retrieve" in router_edges
        assert "generate" in router_edges
