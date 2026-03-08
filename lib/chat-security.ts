import { NextResponse } from "next/server";

// ─── Constants ──────────────────────────────────────────────────

const MAX_MESSAGE_LENGTH = 500;
const THREAD_ID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const BACKEND_TIMEOUT_MS = 30_000;

const ALLOWED_ORIGINS: readonly string[] = [
  process.env.NEXT_PUBLIC_SITE_URL,
  "http://localhost:3000",
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
].filter((origin): origin is string => Boolean(origin));

// ─── Types ──────────────────────────────────────────────────────

interface ChatRequestBody {
  message?: unknown;
  thread_id?: unknown;
}

export type ValidationSuccess = {
  valid: true;
  message: string;
  threadId: string | undefined;
};

export type ValidationFailure = {
  valid: false;
  response: NextResponse;
};

export type ValidationResult = ValidationSuccess | ValidationFailure;

// ─── Helpers ────────────────────────────────────────────────────

function isValidOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

function hasCustomHeader(request: Request): boolean {
  return request.headers.get("X-Requested-With") === "XMLHttpRequest";
}

export function createBackendSignal(): AbortSignal {
  return AbortSignal.timeout(BACKEND_TIMEOUT_MS);
}

// ─── Main Validator ─────────────────────────────────────────────

export async function validateChatRequest(
  request: Request,
): Promise<ValidationResult> {
  const origin = request.headers.get("Origin");
  if (!isValidOrigin(origin)) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: "Forbidden: invalid origin" },
        { status: 403 },
      ),
    };
  }

  if (!hasCustomHeader(request)) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: "Forbidden: missing required header" },
        { status: 403 },
      ),
    };
  }

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return {
      valid: false,
      response: NextResponse.json(
        { error: "Bad request: invalid JSON" },
        { status: 400 },
      ),
    };
  }

  if (typeof body.message !== "string" || body.message.trim().length === 0) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: "Bad request: message is required" },
        { status: 400 },
      ),
    };
  }

  if (body.message.length > MAX_MESSAGE_LENGTH) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: `Bad request: message exceeds ${MAX_MESSAGE_LENGTH} characters` },
        { status: 400 },
      ),
    };
  }

  if (body.thread_id !== undefined && body.thread_id !== null) {
    if (typeof body.thread_id !== "string" || !THREAD_ID_PATTERN.test(body.thread_id)) {
      return {
        valid: false,
        response: NextResponse.json(
          { error: "Bad request: invalid thread_id format" },
          { status: 400 },
        ),
      };
    }
  }

  const threadId =
    typeof body.thread_id === "string" && body.thread_id.trim().length > 0
      ? body.thread_id.trim()
      : undefined;

  return {
    valid: true,
    message: body.message.trim(),
    threadId,
  };
}
