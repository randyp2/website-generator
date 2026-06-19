"use client";

import { Send } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface PortfolioCommentAuthPromptProps {
  onRequireAuth: () => void;
}

export const PortfolioCommentAuthPrompt = ({
  onRequireAuth,
}: PortfolioCommentAuthPromptProps) => (
  <div className="mt-2 flex items-start gap-3 pt-2">
    <Avatar className="size-8">
      <AvatarFallback className="bg-muted text-xs text-muted-foreground">
        ?
      </AvatarFallback>
    </Avatar>
    <button
      type="button"
      onClick={onRequireAuth}
      className="flex min-w-0 flex-1 items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent/40"
    >
      <span>Sign up to leave a comment...</span>
      <Send className="size-4 text-muted-foreground" />
    </button>
  </div>
);
