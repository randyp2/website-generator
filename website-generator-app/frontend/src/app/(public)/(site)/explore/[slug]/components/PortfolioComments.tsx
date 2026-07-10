"use client";

import { useState } from "react";
import { ChevronDown, Loader2, MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { usePortfolioComments } from "../hooks/usePortfolioComments";
import { PortfolioCommentAuthPrompt } from "./PortfolioCommentAuthPrompt";
import { PortfolioCommentComposer } from "./PortfolioCommentComposer";
import { PortfolioCommentItem } from "./PortfolioCommentItem";

interface PortfolioCommentsProps {
  portfolioId: string;
  portfolioOwnerId: string;
  slug: string;
}

const PortfolioComments = ({
  portfolioId,
  portfolioOwnerId,
  slug,
}: PortfolioCommentsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const commentsState = usePortfolioComments({ portfolioId, slug });
  const avatarLabel = commentsState.user?.email ?? null;

  return (
    <article className="px-1 py-2 sm:px-2">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex w-full items-center justify-between rounded-lg py-2 text-left transition-colors"
      >
        <div className="flex items-center gap-3">
          <MessageCircle className="size-5 text-primary" />
          <span className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
            Comments
          </span>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {commentsState.isLoading ? "..." : commentsState.commentCount}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "size-5 text-muted-foreground transition-transform duration-300 group-hover:cursor-pointer",
            isOpen && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="mt-4 space-y-5">
            {commentsState.isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading comments
              </div>
            )}

            {!commentsState.isLoading && commentsState.loadError && (
              <p className="text-sm text-destructive">
                {commentsState.loadError}
              </p>
            )}

            {!commentsState.isLoading &&
              !commentsState.loadError &&
              commentsState.comments.length === 0 && (
                <p className="rounded-lg border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
                  No comments yet.
                </p>
              )}

            {!commentsState.isLoading &&
              !commentsState.loadError &&
              commentsState.comments.map((comment) => (
                <div key={comment.id}>
                  <PortfolioCommentItem
                    activeReplyId={commentsState.activeReplyId}
                    avatarLabel={avatarLabel}
                    comment={comment}
                    currentUserId={commentsState.user?.id}
                    editingBody={commentsState.editingBody}
                    editingId={commentsState.editingId}
                    onCancelEdit={commentsState.cancelEdit}
                    onCancelReply={commentsState.resetReplyState}
                    onDelete={commentsState.deleteComment}
                    onEditingBodyChange={commentsState.setEditingBody}
                    onReplyBodyChange={commentsState.setReplyBody}
                    onStartEdit={commentsState.startEdit}
                    onStartReply={commentsState.startReply}
                    onSubmitEdit={commentsState.updateComment}
                    onSubmitReply={commentsState.createReply}
                    onToggleLike={commentsState.toggleLike}
                    pendingActionId={commentsState.pendingActionId}
                    portfolioOwnerId={portfolioOwnerId}
                    replyBody={commentsState.replyBody}
                  />
                </div>
              ))}

            {commentsState.actionError && (
              <p className="text-sm text-destructive">
                {commentsState.actionError}
              </p>
            )}

            {commentsState.isAuthenticated ? (
              <PortfolioCommentComposer
                avatarLabel={avatarLabel}
                className="mt-2 pt-2"
                isSubmitting={commentsState.isSubmittingComment}
                onChange={commentsState.setCommentBody}
                onSubmit={commentsState.createComment}
                placeholder="Add a comment"
                submitLabel="Send"
                value={commentsState.commentBody}
              />
            ) : (
              <PortfolioCommentAuthPrompt
                onRequireAuth={() => commentsState.requireAuth("comment")}
              />
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default PortfolioComments;
