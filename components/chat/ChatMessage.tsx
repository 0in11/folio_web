"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ChatMessage } from "@/hooks/useChatbot";
import { cn } from "@/lib/utils";
import ChatMarkdown from "./ChatMarkdown";

interface ChatMessageProps {
  readonly message: ChatMessage;
}

const visible = { opacity: 1, y: 0 };
const hidden = { opacity: 0, y: 8 };
const transition = { duration: 0.2, ease: "easeOut" as const };

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-text-muted animate-pulse"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

export default function ChatMessageBubble({ message }: ChatMessageProps) {
  const prefersReducedMotion = useReducedMotion();
  const isUser = message.role === "user";
  const isTyping = message.role === "assistant" && message.content === "";

  return (
    <motion.div
      initial={prefersReducedMotion ? visible : hidden}
      animate={visible}
      transition={prefersReducedMotion ? undefined : transition}
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div className={cn("max-w-[80%]", !isUser && "flex flex-col gap-1")}>
        {!isUser && (
          <span className="font-mono text-xs text-accent-primary/60 pl-1">
            AI
          </span>
        )}
        <div
          className={cn(
            "px-4 py-2.5 font-sans text-sm leading-relaxed",
            isUser
              ? "bg-accent-primary text-bg-primary rounded-tl-2xl rounded-bl-2xl rounded-tr-sm rounded-br-2xl"
              : "bg-bg-surface border border-border-subtle text-text-primary rounded-tr-2xl rounded-br-2xl rounded-tl-sm rounded-bl-2xl"
          )}
        >
          {isTyping ? (
            <TypingIndicator />
          ) : isUser ? (
            message.content
          ) : (
            <ChatMarkdown content={message.content} />
          )}
        </div>
      </div>
    </motion.div>
  );
}
