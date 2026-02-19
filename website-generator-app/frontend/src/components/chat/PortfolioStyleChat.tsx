"use client";

import { cn } from "@/lib/utils";
import type { Message } from "@/types/preview";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ColorPickerPanel } from "./ColorPickerPanel";
import { TypographyPickerPanel } from "./TypographyPickerPanel";

interface PortfolioStyleChatProps {
  messages: Message[];
  isSending?: boolean;
  onSendMessage: (prompt: string) => void;
  onContinue?: () => void;
  continueLabel?: string;
  isContinueDisabled?: boolean;
  showColorPicker?: boolean;
  onColorSubmit?: (colors: Record<string, string>) => void;
  showTypographyPicker?: boolean;
  onTypographySubmit?: (fonts: { heading: string; body: string }) => void;
  recommendedHeadingFont?: string;
  recommendedBodyFont?: string;
  className?: string;
}

const formatTimestamp = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export function PortfolioStyleChat({
  messages,
  isSending = false,
  onSendMessage,
  onContinue,
  continueLabel = "Continue to Revise/Edit",
  isContinueDisabled = false,
  showColorPicker = false,
  onColorSubmit,
  showTypographyPicker = false,
  onTypographySubmit,
  recommendedHeadingFont,
  recommendedBodyFont,
  className,
}: PortfolioStyleChatProps) {
  const [prompt, setPrompt] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [prompt]);

  const handleSend = () => {
    const value = prompt.trim();
    if (!value || isSending) return;
    onSendMessage(value);
    setPrompt("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <section
      className={cn(
        "mx-auto flex h-[calc(100vh-10rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md",
        className,
      )}
    >
      <header className="h-14 border-b border-white/10 px-4 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-medium text-white/70">Chat</span>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-white/20">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm text-white/65">No messages yet</p>
            <p className="mt-1 text-xs text-white/45">Describe the style direction you want.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col",
                message.role === "user" ? "items-end" : "items-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white"
                    : "bg-white/5 border border-white/10 text-white/90",
                )}
              >
                {message.content}
              </div>
              <span className="mt-1 text-xs text-white/40">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          ))
        )}

        {showColorPicker && onColorSubmit && (
          <ColorPickerPanel onSubmit={onColorSubmit} />
        )}

        {showTypographyPicker && onTypographySubmit && (
          <TypographyPickerPanel
            onSubmit={onTypographySubmit}
            recommendedHeadingFont={recommendedHeadingFont}
            recommendedBodyFont={recommendedBodyFont}
          />
        )}

        {isSending && (
          <div className="text-xs text-white/50">Generating response...</div>
        )}
        <div ref={endRef} />
      </div>

      {!showColorPicker && !showTypographyPicker && (
      <div className="border-t border-white/10 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the style you want..."
            className="min-h-[44px] max-h-32 flex-1 resize-none border-white/10 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-blue-500"
          />
          <Button
            type="button"
            onClick={handleSend}
            disabled={isSending || !prompt.trim()}
            className="h-11 w-11 shrink-0 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:bg-blue-900/40 disabled:text-white/40"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
          {onContinue && (
            <Button
              type="button"
              onClick={onContinue}
              disabled={isContinueDisabled}
              className="h-11 rounded-xl bg-white text-black hover:bg-white/90"
            >
              {continueLabel}
            </Button>
          )}
        </div>
      </div>
      )}
    </section>
  );
}
