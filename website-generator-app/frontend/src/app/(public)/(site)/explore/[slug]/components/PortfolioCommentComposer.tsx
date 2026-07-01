"use client";

import { FormEvent } from "react";
import { Loader2 } from "lucide-react";

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
  rows = 1,
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
      <div className="relative">
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={COMMENT_MAX_LENGTH}
          rows={rows}
          placeholder={placeholder}
          className="min-h-11 resize-none pb-9"
        />
        <button
          type="submit"
          disabled={isSubmitting || !value.trim()}
          className="absolute bottom-2.5 right-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:cursor-pointer hover:text-primary/80 disabled:cursor-not-allowed disabled:text-muted-foreground disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
          {isSubmitting ? "Sending..." : submitLabel}
        </button>
      </div>
      {onCancel && (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="public-action-button public-action-button-outline text-muted-foreground hover:text-foreground"
          >
            {cancelLabel}
          </button>
        </div>
      )}
    </div>
  </form>
);
