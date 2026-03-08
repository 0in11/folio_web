"""LangGraph graph assembly for the portfolio chatbot."""

from __future__ import annotations

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph

from src.agent.nodes.retriever import retrieve
from src.agent.nodes.router import route
from src.agent.state import AgentState


def _route_by_query_type(state: AgentState) -> str:
    """Direct the graph based on the classified query type.

    Returns the name of the next node to execute:
    - ``"retrieve"`` for portfolio queries (need RAG context)
    - ``"generate"`` for general or off_topic queries (direct response)
    """
    if state.get("query_type") == "portfolio":
        return "retrieve"
    return "generate"


def create_graph() -> StateGraph:
    """Build and compile the portfolio chatbot graph.

    Graph structure::

        START -> router -> conditional_edge -> [
            portfolio:  retrieve -> generate,
            general:    generate,
            off_topic:  generate,
        ] -> END

    Returns:
        A compiled LangGraph ``CompiledStateGraph`` with an
        ``InMemorySaver`` checkpointer for conversation memory.
    """
    # Import generator lazily to allow parallel development
    from src.agent.nodes.generator import generate

    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("router", route)
    graph.add_node("retrieve", retrieve)
    graph.add_node("generate", generate)

    # Wire edges
    graph.add_edge(START, "router")
    graph.add_conditional_edges(
        "router",
        _route_by_query_type,
        {
            "retrieve": "retrieve",
            "generate": "generate",
        },
    )
    graph.add_edge("retrieve", "generate")
    graph.add_edge("generate", END)

    # Compile with in-memory checkpointer for conversation memory
    checkpointer = InMemorySaver()
    return graph.compile(checkpointer=checkpointer)
