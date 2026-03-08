import { NextResponse } from "next/server";

import { validateChatRequest, createBackendSignal } from "@/lib/chat-security";

// ─── Types ──────────────────────────────────────────────────────

interface ChatBackendResponse {
  response: string;
  sources: Record<string, unknown>[];
  thread_id: string;
}

// ─── POST Handler ───────────────────────────────────────────────

export async function POST(request: Request): Promise<NextResponse> {
  const validation = await validateChatRequest(request);

  if (!validation.valid) {
    return validation.response;
  }

  const backendUrl = process.env.CHATBOT_API_URL;
  if (!backendUrl) {
    return NextResponse.json(
      { error: "Chat service is not configured" },
      { status: 503 },
    );
  }

  try {
    const backendResponse = await fetch(`${backendUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: validation.message,
        ...(validation.threadId ? { thread_id: validation.threadId } : {}),
      }),
      signal: createBackendSignal(),
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: "Chat service returned an error" },
        { status: backendResponse.status },
      );
    }

    const data = (await backendResponse.json()) as ChatBackendResponse;

    return NextResponse.json({
      response: data.response,
      sources: data.sources,
      thread_id: data.thread_id,
    });
  } catch {
    return NextResponse.json(
      { error: "Chat service is unavailable" },
      { status: 502 },
    );
  }
}
