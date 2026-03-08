"""FastAPI server for the portfolio chatbot."""

from __future__ import annotations

import asyncio
import json
import logging
import uuid
from contextlib import asynccontextmanager
from typing import Any, AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from sse_starlette.sse import EventSourceResponse

from src.agent.graph import create_graph

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Rate limiter
# ---------------------------------------------------------------------------

limiter = Limiter(key_func=get_remote_address, headers_enabled=True)

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------


class ChatRequest(BaseModel):
    """Incoming chat request body."""

    message: str
    thread_id: str | None = None


class ChatResponse(BaseModel):
    """Synchronous chat response body."""

    response: str
    sources: list[dict[str, Any]]
    thread_id: str


# ---------------------------------------------------------------------------
# Application lifespan
# ---------------------------------------------------------------------------

_graph: Any = None


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    """Create the LangGraph graph once at startup."""
    global _graph  # noqa: PLW0603
    _graph = create_graph()
    yield


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(title="Folio Agent API", lifespan=lifespan)

# Attach rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _ensure_thread_id(thread_id: str | None) -> str:
    """Return the given thread_id or generate a new one."""
    return thread_id if thread_id else str(uuid.uuid4())


def _build_config(thread_id: str) -> dict[str, Any]:
    """Build a LangGraph config dict with the thread_id."""
    return {"configurable": {"thread_id": thread_id}}


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@app.get("/api/health")
async def health() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}


@app.post("/api/chat")
@limiter.limit("50/day")
async def chat(request: Request, body: ChatRequest) -> JSONResponse:
    """Synchronous chat endpoint — returns the full response at once."""
    thread_id = _ensure_thread_id(body.thread_id)
    config = _build_config(thread_id)

    try:
        result = await asyncio.to_thread(
            _graph.invoke,
            {"messages": [("user", body.message)]},
            config=config,
        )
        ai_message = result["messages"][-1]
        sources: list[dict[str, Any]] = result.get("source_documents", [])

        payload = ChatResponse(
            response=ai_message.content,
            sources=sources,
            thread_id=thread_id,
        )
        return JSONResponse(content=payload.model_dump())
    except Exception:
        logger.exception("Chat request failed")
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error"},
        )


@app.post("/api/chat/stream")
@limiter.limit("50/day")
async def chat_stream(request: Request, body: ChatRequest) -> EventSourceResponse:
    """SSE streaming chat endpoint — sends tokens as they arrive."""
    thread_id = _ensure_thread_id(body.thread_id)
    config = _build_config(thread_id)

    async def _event_generator() -> AsyncGenerator[dict[str, str], None]:
        try:
            loop = asyncio.get_event_loop()
            results = await loop.run_in_executor(
                None,
                lambda: list(_graph.stream(
                    {"messages": [("user", body.message)]},
                    config=config,
                    stream_mode="messages",
                )),
            )
            for msg, metadata in results:
                if hasattr(msg, "content") and msg.content:
                    yield {
                        "event": "token",
                        "data": json.dumps(
                            {"token": msg.content, "thread_id": thread_id},
                        ),
                    }

            yield {
                "event": "done",
                "data": json.dumps({"thread_id": thread_id}),
            }
        except Exception:
            logger.exception("Chat stream failed")
            yield {
                "event": "error",
                "data": json.dumps({"error": "Internal server error"}),
            }

    return EventSourceResponse(_event_generator())
