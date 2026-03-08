"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, RotateCcw } from "lucide-react";
import { useChatbot } from "@/hooks/useChatbot";
import ChatMessageBubble from "./ChatMessage";
import { cn } from "@/lib/utils";

// ─── Constants ──────────────────────────────────────────────────

const MAX_CHARS = 500;
const CHAR_WARN_THRESHOLD = 400;

const panelTransition = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.95 },
  transition: { duration: 0.2, ease: "easeOut" as const },
};

// ─── Pulse Ring ─────────────────────────────────────────────────

function PulseRing() {
  return (
    <span className="absolute inset-0 rounded-full bg-accent-primary/20 animate-ping" />
  );
}

// ─── Component ──────────────────────────────────────────────────

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, isLoading, error, sendMessage, clearMessages } =
    useChatbot();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Escape key closes panel
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const charCount = input.length;
  const isOverLimit = charCount > MAX_CHARS;
  const showCharCount = charCount > CHAR_WARN_THRESHOLD;
  const canSend = input.trim().length > 0 && !isLoading && !isOverLimit;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSend) return;
    const message = input.trim();
    setInput("");
    sendMessage(message);
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="panel"
            role="dialog"
            aria-label="AI 챗봇"
            className="fixed bottom-6 right-6 z-50 flex w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border-strong bg-bg-secondary shadow-2xl shadow-black/40 sm:w-[380px]"
            style={{ height: "min(520px, calc(100dvh - 5rem))" }}
            {...panelTransition}
          >
            {/* Header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border-subtle px-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="font-mono text-sm text-text-secondary">
                  AI Assistant
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="대화 초기화"
                  onClick={clearMessages}
                  className="rounded-lg p-2 text-text-muted transition-colors hover:text-text-primary"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  type="button"
                  aria-label="챗봇 닫기"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-text-muted transition-colors hover:text-text-primary"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              aria-live="polite"
              aria-relevant="additions"
              className={cn(
                "flex-1 overflow-y-auto p-4 space-y-3",
                "[&::-webkit-scrollbar]:w-1.5",
                "[&::-webkit-scrollbar-track]:bg-transparent",
                "[&::-webkit-scrollbar-thumb]:rounded-full",
                "[&::-webkit-scrollbar-thumb]:bg-border-subtle",
              )}
            >
              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                  {error}
                </div>
              )}

              {messages.length === 0 && !error ? (
                <div className="flex h-full items-center justify-center px-6">
                  <p className="text-center text-sm text-text-muted">
                    안녕하세요! 포트폴리오에 대해 궁금한 점을 물어보세요.
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <ChatMessageBubble key={index} message={message} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-border-subtle p-3">
              {showCharCount && (
                <div
                  className={cn(
                    "mb-1.5 text-right text-xs",
                    isOverLimit ? "text-red-400" : "text-text-muted",
                  )}
                >
                  {charCount}/{MAX_CHARS}
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  maxLength={MAX_CHARS}
                  className="flex-1 rounded-xl border border-border-subtle bg-bg-surface px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/20"
                />
                <button
                  type="submit"
                  aria-label="메시지 전송"
                  disabled={!canSend}
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-primary text-bg-primary transition-opacity",
                    !canSend && "cursor-not-allowed opacity-40",
                  )}
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="fab"
            type="button"
            aria-label="챗봇 열기"
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent-primary text-bg-primary shadow-lg shadow-accent-primary/25"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <PulseRing />
            <MessageCircle size={24} className="relative z-10" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
