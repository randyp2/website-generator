"use client";

import { FormEvent } from "react";
import {
  Check,
  Loader2,
  Pencil,
  Reply,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "../explore-portfolio-detail.utils";
import type { PortfolioComment } from "../portfolio-engagement.types";
import {
  COMMENT_MAX_LENGTH,
  getDisplayName,
  getInitials,
} from "../portfolio-comments.utils";
import { PortfolioCommentComposer } from "./PortfolioCommentComposer";

interface PortfolioCommentItemProps {
  activeReplyId: string | null;
  avatarLabel: string | null;
  comment: PortfolioComment;
  currentUserId: string | undefined;
  editingBody: string;
  editingId: string | null;
  isReply?: boolean;
  onCancelEdit: () => void;
  onCancelReply: () => void;
  onDelete: (commentId: string) => void;
  onEditingBodyChange: (value: string) => void;
  onReplyBodyChange: (value: string) => void;
  onStartEdit: (comment: PortfolioComment) => void;
  onStartReply: (commentId: string) => void;
  onSubmitEdit: (
    event: FormEvent<HTMLFormElement>,
    commentId: string,
  ) => void;
  onSubmitReply: (
    event: FormEvent<HTMLFormElement>,
    parentCommentId: string,
  ) => void;
  onToggleLike: (comment: PortfolioComment) => void;
  pendingActionId: string | null;
  portfolioOwnerId: string;
  replyBody: string;
}

export const PortfolioCommentItem = ({
  activeReplyId,
  avatarLabel,
  comment,
  currentUserId,
  editingBody,
  editingId,
  isReply = false,
  onCancelEdit,
  onCancelReply,
  onDelete,
  onEditingBodyChange,
  onReplyBodyChange,
  onStartEdit,
  onStartReply,
  onSubmitEdit,
  onSubmitReply,
  onToggleLike,
  pendingActionId,
  portfolioOwnerId,
  replyBody,
}: PortfolioCommentItemProps) => {
  const authorName = getDisplayName(comment);
  const canEdit = currentUserId === comment.authorId;
  const canDelete = canEdit || currentUserId === portfolioOwnerId;
  const isPending = pendingActionId === comment.id;
  const isEditing = editingId === comment.id;

  return (
    <div className="flex items-start gap-3">
      <Avatar className={isReply ? "size-6" : "size-8"}>
        {comment.authorAvatarUrl ? (
          <AvatarImage src={comment.authorAvatarUrl} alt={authorName} />
        ) : null}
        <AvatarFallback
          className={cn(
            "bg-primary/10 text-primary",
            isReply ? "text-[10px]" : "text-xs",
          )}
        >
          {getInitials(authorName)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-medium text-foreground">{authorName}</span>
          <span className="text-xs text-muted-foreground">
            {formatTimeAgo(comment.createdAt)}
          </span>
        </div>

        {isEditing ? (
          <form
            onSubmit={(event) => onSubmitEdit(event, comment.id)}
            className="mt-2 space-y-2"
          >
            <Textarea
              value={editingBody}
              onChange={(event) => onEditingBodyChange(event.target.value)}
              maxLength={COMMENT_MAX_LENGTH}
              rows={3}
              className="min-h-20 resize-none"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isPending || !editingBody.trim()}
                className="inline-flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Save comment"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4" />
                )}
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Cancel edit"
              >
                <X className="size-4" />
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            {comment.body}
          </p>
        )}

        {!isEditing && (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onToggleLike(comment)}
              disabled={isPending}
              className={cn(
                "inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50",
                comment.viewerHasLiked && "text-primary",
              )}
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <ThumbsUp
                  className={cn(
                    isReply ? "size-3" : "size-3.5",
                    comment.viewerHasLiked && "fill-primary",
                  )}
                />
              )}
              <span>{comment.likesCount.toLocaleString()}</span>
            </button>

            {!isReply && (
              <button
                type="button"
                onClick={() => onStartReply(comment.id)}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                <Reply className="size-3.5" />
                <span>Reply</span>
              </button>
            )}

            {canEdit && (
              <button
                type="button"
                onClick={() => onStartEdit(comment)}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                <Pencil className="size-3.5" />
                <span>Edit</span>
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        )}

        {!isReply && activeReplyId === comment.id && (
          <PortfolioCommentComposer
            avatarLabel={avatarLabel}
            className="mt-4"
            isSubmitting={isPending}
            onCancel={onCancelReply}
            onChange={onReplyBodyChange}
            onSubmit={(event) => onSubmitReply(event, comment.id)}
            placeholder={`Reply to ${authorName}`}
            rows={2}
            submitLabel="Reply"
            value={replyBody}
          />
        )}

        {!isReply && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 border-l-2 border-border pl-4">
            {comment.replies.map((reply) => (
              <PortfolioCommentItem
                key={reply.id}
                activeReplyId={activeReplyId}
                avatarLabel={avatarLabel}
                comment={reply}
                currentUserId={currentUserId}
                editingBody={editingBody}
                editingId={editingId}
                isReply
                onCancelEdit={onCancelEdit}
                onCancelReply={onCancelReply}
                onDelete={onDelete}
                onEditingBodyChange={onEditingBodyChange}
                onReplyBodyChange={onReplyBodyChange}
                onStartEdit={onStartEdit}
                onStartReply={onStartReply}
                onSubmitEdit={onSubmitEdit}
                onSubmitReply={onSubmitReply}
                onToggleLike={onToggleLike}
                pendingActionId={pendingActionId}
                portfolioOwnerId={portfolioOwnerId}
                replyBody={replyBody}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
