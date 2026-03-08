import { NextResponse } from "next/server";

import { validateChatRequest, createBackendSignal } from "@/lib/chat-security";

export const runtime = "edge";

export async function POST(request: Request): Promise<Response> {
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

  let upstream: Response;
  try {
    upstream = await fetch(`${backendUrl}/api/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: validation.message,
        ...(validation.threadId ? { thread_id: validation.threadId } : {}),
      }),
      signal: createBackendSignal(),
    });
  } catch {
    return NextResponse.json(
      { error: "Chat service is unavailable" },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    const status =
      upstream.status >= 400 && upstream.status < 600
        ? upstream.status
        : 502;
    return NextResponse.json(
      { error: "Chat service returned an error" },
      { status },
    );
  }

  if (!upstream.body) {
    return NextResponse.json(
      { error: "Chat service returned an empty response" },
      { status: 502 },
    );
  }

  const reader = upstream.body.getReader();
  const stream = new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        controller.enqueue(value);
      } catch {
        controller.close();
      }
    },
    cancel() {
      reader.cancel();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
