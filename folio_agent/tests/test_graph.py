"""Tests for the LangGraph graph assembly."""

from __future__ import annotations

from typing import Any
from unittest.mock import patch


from src.agent.graph import create_graph


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
        "retrieval_scores": [0.25],
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
# Linear graph edges
# ---------------------------------------------------------------------------

class TestLinearEdges:
    """The graph should follow a linear retrieve -> router -> generate flow."""

    @patch("src.agent.nodes.generator.generate", _mock_generate)
    def test_start_connects_to_retrieve(self) -> None:
        graph = create_graph()
        graph_repr = graph.get_graph()
        start_edges = [
            edge.target for edge in graph_repr.edges if edge.source == "__start__"
        ]
        assert "retrieve" in start_edges

    @patch("src.agent.nodes.generator.generate", _mock_generate)
    def test_retrieve_connects_to_router(self) -> None:
        graph = create_graph()
        graph_repr = graph.get_graph()
        retrieve_edges = [
            edge.target for edge in graph_repr.edges if edge.source == "retrieve"
        ]
        assert "router" in retrieve_edges

    @patch("src.agent.nodes.generator.generate", _mock_generate)
    def test_router_connects_to_generate(self) -> None:
        graph = create_graph()
        graph_repr = graph.get_graph()
        router_edges = [
            edge.target for edge in graph_repr.edges if edge.source == "router"
        ]
        assert "generate" in router_edges
        # No conditional edges — router should only connect to generate
        assert len(router_edges) == 1

    @patch("src.agent.nodes.generator.generate", _mock_generate)
    def test_generate_connects_to_end(self) -> None:
        graph = create_graph()
        graph_repr = graph.get_graph()
        generate_edges = [
            edge.target for edge in graph_repr.edges if edge.source == "generate"
        ]
        assert "__end__" in generate_edges

    @patch("src.agent.nodes.generator.generate", _mock_generate)
    def test_no_conditional_edges(self) -> None:
        """The graph should have no conditional edges — purely linear."""
        graph = create_graph()
        graph_repr = graph.get_graph()
        # In a linear graph, each node has exactly one outgoing edge
        for node_name in ("retrieve", "router", "generate"):
            edges = [
                edge for edge in graph_repr.edges if edge.source == node_name
            ]
            assert len(edges) == 1, f"{node_name} should have exactly 1 outgoing edge"
