"use client";

import { useState, useCallback, useRef } from "react";

// ─── Types ──────────────────────────────────────────────────────

export interface ChatMessage {
  readonly role: "user" | "assistant";
  readonly content: string;
}

export interface UseChatbotReturn {
  readonly messages: readonly ChatMessage[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly threadId: string | null;
  readonly sendMessage: (message: string) => Promise<void>;
  readonly clearMessages: () => void;
}

// ─── Constants ──────────────────────────────────────────────────

const ERROR_MESSAGES: Record<number, string> = {
  403: "요청이 차단되었습니다",
  400: "메시지가 너무 깁니다 (최대 500자)",
  429: "요청 한도에 도달했습니다. 잠시 후 다시 시도해주세요.",
};

const DEFAULT_ERROR = "오류가 발생했습니다. 다시 시도해주세요.";

// ─── SSE Parsing ────────────────────────────────────────────────

interface SSEEvent {
  readonly event: string;
  readonly data: string;
}

function parseSSEEvents(chunk: string): readonly SSEEvent[] {
  const events: SSEEvent[] = [];
  const blocks = chunk.split("\n\n");

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    let event = "";
    let data = "";

    for (const line of trimmed.split("\n")) {
      if (line.startsWith("event: ")) {
        event = line.slice(7);
      } else if (line.startsWith("data: ")) {
        data = line.slice(6);
      }
    }

    if (data) {
      events.push({ event: event || "message", data });
    }
  }

  return events;
}

// ─── Event Processing ───────────────────────────────────────────

interface EventProcessResult {
  readonly tokenContent: string;
  readonly newThreadId: string | null;
  readonly errorMessage: string | null;
}

function processSSEEvents(
  events: readonly SSEEvent[],
  currentContent: string,
): EventProcessResult {
  let tokenContent = currentContent;
  let newThreadId: string | null = null;
  let errorMessage: string | null = null;

  for (const evt of events) {
    if (evt.event === "token") {
      try {
        const parsed = JSON.parse(evt.data) as { token: string; thread_id?: string };
        tokenContent += parsed.token;
        if (parsed.thread_id) {
          newThreadId = parsed.thread_id;
        }
      } catch {
        // Skip malformed JSON tokens
      }
    } else if (evt.event === "done") {
      try {
        const parsed = JSON.parse(evt.data) as { thread_id?: string };
        if (parsed.thread_id) {
          newThreadId = parsed.thread_id;
        }
      } catch {
        // Skip malformed JSON
      }
    } else if (evt.event === "error") {
      try {
        const parsed = JSON.parse(evt.data) as { error: string };
        errorMessage = parsed.error || DEFAULT_ERROR;
      } catch {
        errorMessage = DEFAULT_ERROR;
      }
    }
  }

  return { tokenContent, newThreadId, errorMessage };
}

// ─── Hook ───────────────────────────────────────────────────────

export function useChatbot(): UseChatbotReturn {
  const [messages, setMessages] = useState<readonly ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const threadIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearMessages = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    threadIdRef.current = null;
    setMessages([]);
    setError(null);
    setIsLoading(false);
    setThreadId(null);
  }, []);

  const sendMessage = useCallback(async (message: string): Promise<void> => {
    const trimmed = message.trim();
    if (!trimmed) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMessage: ChatMessage = { role: "user", content: trimmed };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const body = threadIdRef.current
        ? { message: trimmed, thread_id: threadIdRef.current }
        : { message: trimmed };

      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        setError(ERROR_MESSAGES[response.status] ?? DEFAULT_ERROR);
        setIsLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setError(DEFAULT_ERROR);
        setIsLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let assistantContent = "";
      let sseBuffer = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      let done = false;
      while (!done) {
        const result = await reader.read();
        done = result.done;

        if (result.value) {
          sseBuffer += decoder.decode(result.value, { stream: true }).replace(/\r\n/g, "\n");
          const parts = sseBuffer.split("\n\n");
          sseBuffer = parts.pop() ?? "";

          const fullChunk = parts.join("\n\n");
          if (!fullChunk.trim()) continue;

          const events = parseSSEEvents(fullChunk + "\n\n");
          const { tokenContent, newThreadId, errorMessage } =
            processSSEEvents(events, assistantContent);

          assistantContent = tokenContent;

          if (newThreadId) {
            threadIdRef.current = newThreadId;
            setThreadId(newThreadId);
          }

          if (errorMessage) {
            setError(errorMessage);
          }

          const content = assistantContent;
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { role: "assistant", content },
          ]);
        }
      }

      if (sseBuffer.trim()) {
        const remaining = parseSSEEvents(sseBuffer + "\n\n");
        const { tokenContent, newThreadId, errorMessage } =
          processSSEEvents(remaining, assistantContent);

        assistantContent = tokenContent;

        if (newThreadId) {
          threadIdRef.current = newThreadId;
          setThreadId(newThreadId);
        }

        if (errorMessage) {
          setError(errorMessage);
        }

        const content = assistantContent;
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content },
        ]);
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setError(DEFAULT_ERROR);
    } finally {
      setIsLoading(false);
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    threadId,
    sendMessage,
    clearMessages,
  };
}
