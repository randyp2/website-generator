"use client";

import { FormEvent } from "react";
import { Loader2, Send } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { COMMENT_MAX_LENGTH, getInitials } from "../portfolio-comments.utils";

interface PortfolioCommentComposerProps {
  avatarLabel: string | null;
  cancelLabel?: string;
  className?: string;
  isSubmitting: boolean;
  onCancel?: () => void;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  placeholder: string;
  rows?: number;
  submitLabel: string;
  value: string;
}

export const PortfolioCommentComposer = ({
  avatarLabel,
  cancelLabel = "Cancel",
  className = "",
  isSubmitting,
  onCancel,
  onChange,
  onSubmit,
  placeholder,
  rows = 3,
  submitLabel,
  value,
}: PortfolioCommentComposerProps) => (
  <form onSubmit={onSubmit} className={`flex items-start gap-3 ${className}`}>
    <Avatar className="size-8">
      <AvatarFallback className="bg-muted text-xs text-muted-foreground">
        {avatarLabel ? getInitials(avatarLabel) : "?"}
      </AvatarFallback>
    </Avatar>

    <div className="min-w-0 flex-1 space-y-2">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={COMMENT_MAX_LENGTH}
        rows={rows}
        placeholder={placeholder}
        className="min-h-20 resize-none pr-10"
      />
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-9 items-center justify-center rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !value.trim()}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {submitLabel}
        </button>
      </div>
    </div>
  </form>
);
