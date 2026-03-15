"""LangGraph graph assembly for the portfolio chatbot."""

from __future__ import annotations

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph

from src.agent.nodes.retriever import retrieve
from src.agent.nodes.router import route
from src.agent.state import AgentState


def create_graph() -> StateGraph:
    """Build and compile the portfolio chatbot graph.

    Graph structure::

        START -> retrieve -> router -> generate -> END

    All queries go through retrieval first, then the router classifies
    using both the query and retrieval results (retrieve-then-route).

    Returns:
        A compiled LangGraph ``CompiledStateGraph`` with an
        ``InMemorySaver`` checkpointer for conversation memory.
    """
    # Import generator lazily to allow parallel development
    from src.agent.nodes.generator import generate

    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("retrieve", retrieve)
    graph.add_node("router", route)
    graph.add_node("generate", generate)

    # Wire linear edges: retrieve -> router -> generate
    graph.add_edge(START, "retrieve")
    graph.add_edge("retrieve", "router")
    graph.add_edge("router", "generate")
    graph.add_edge("generate", END)

    # Compile with in-memory checkpointer for conversation memory
    checkpointer = InMemorySaver()
    return graph.compile(checkpointer=checkpointer)
