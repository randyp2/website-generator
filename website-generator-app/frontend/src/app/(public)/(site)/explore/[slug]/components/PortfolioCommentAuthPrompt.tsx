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
      className="public-action-button public-action-button-outline min-w-0 flex-1 justify-between bg-background text-left text-muted-foreground hover:bg-accent/40"
    >
      <span>Sign up to leave a comment...</span>
      <Send className="size-4 text-muted-foreground" />
    </button>
  </div>
);
