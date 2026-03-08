"""Shared utilities for agent nodes."""

from __future__ import annotations


def extract_last_user_text(messages: list) -> str:
    """Return the text content of the last user message."""
    for msg in reversed(messages):
        if hasattr(msg, "type") and msg.type == "human":
            return str(msg.content)
        if isinstance(msg, dict) and msg.get("role") == "user":
            return str(msg.get("content", ""))
    return ""
