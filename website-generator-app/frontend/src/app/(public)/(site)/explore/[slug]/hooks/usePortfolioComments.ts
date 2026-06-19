"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { usePublicAuthGate } from "@/context/PublicAuthGateContext";
import {
  createPortfolioComment,
  deletePortfolioComment,
  fetchPortfolioComments,
  likePortfolioComment,
  unlikePortfolioComment,
  updatePortfolioComment,
} from "../portfolio-engagement.api";
import type { PortfolioComment } from "../portfolio-engagement.types";
import {
  addReplyToComment,
  getTotalCommentCount,
  mergeUpdatedComment,
  removeCommentFromTree,
  updateCommentTree,
} from "../portfolio-comments.utils";

interface UsePortfolioCommentsOptions {
  portfolioId: string;
  slug: string;
}

export const usePortfolioComments = ({
  portfolioId,
  slug,
}: UsePortfolioCommentsOptions) => {
  const [comments, setComments] = useState<PortfolioComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const authGate = usePublicAuthGate();

  const commentCount = useMemo(() => getTotalCommentCount(comments), [comments]);

  useEffect(() => {
    let isMounted = true;

    const loadComments = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetchPortfolioComments(slug);
        if (isMounted) {
          setComments(response.comments);
        }
      } catch (error) {
        console.error("Failed to load portfolio comments:", error);
        if (isMounted) {
          setLoadError("Could not load comments.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadComments();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const resetReplyState = () => {
    setActiveReplyId(null);
    setReplyBody("");
  };

  const createComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!authGate.requireAuth("comment") || isSubmittingComment) return;

    const body = commentBody.trim();
    if (!body) return;

    setActionError(null);
    setIsSubmittingComment(true);

    try {
      const createdComment = await createPortfolioComment({ portfolioId, body });
      setComments((current) => [...current, createdComment]);
      setCommentBody("");
    } catch (error) {
      console.error("Failed to create comment:", error);
      setActionError("Could not post comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const createReply = async (
    event: FormEvent<HTMLFormElement>,
    parentCommentId: string,
  ) => {
    event.preventDefault();
    if (!authGate.requireAuth("comment") || pendingActionId) return;

    const body = replyBody.trim();
    if (!body) return;

    setActionError(null);
    setPendingActionId(parentCommentId);

    try {
      const createdReply = await createPortfolioComment({
        portfolioId,
        body,
        parentCommentId,
      });
      setComments((current) =>
        addReplyToComment(current, parentCommentId, createdReply),
      );
      resetReplyState();
    } catch (error) {
      console.error("Failed to create reply:", error);
      setActionError("Could not post reply.");
    } finally {
      setPendingActionId(null);
    }
  };

  const toggleLike = async (comment: PortfolioComment) => {
    if (!authGate.requireAuth("engagement") || pendingActionId) return;

    const previousComments = comments;
    const nextViewerHasLiked = !comment.viewerHasLiked;
    const optimisticLikes = nextViewerHasLiked
      ? comment.likesCount + 1
      : Math.max(0, comment.likesCount - 1);

    setActionError(null);
    setPendingActionId(comment.id);
    setComments((current) =>
      updateCommentTree(current, comment.id, (currentComment) => ({
        ...currentComment,
        viewerHasLiked: nextViewerHasLiked,
        likesCount: optimisticLikes,
      })),
    );

    try {
      const updatedComment = nextViewerHasLiked
        ? await likePortfolioComment(comment.id)
        : await unlikePortfolioComment(comment.id);

      setComments((current) =>
        updateCommentTree(current, comment.id, (currentComment) =>
          nextViewerHasLiked
            ? mergeUpdatedComment(currentComment, updatedComment)
            : {
                ...currentComment,
                viewerHasLiked: false,
                likesCount: optimisticLikes,
              },
        ),
      );
    } catch (error) {
      console.error("Failed to toggle comment like:", error);
      setComments(previousComments);
      setActionError("Could not update like.");
    } finally {
      setPendingActionId(null);
    }
  };

  const startReply = (commentId: string) => {
    if (!authGate.requireAuth("comment")) return;
    setEditingId(null);
    setActiveReplyId((current) => (current === commentId ? null : commentId));
    setReplyBody("");
  };

  const startEdit = (comment: PortfolioComment) => {
    setActiveReplyId(null);
    setEditingId(comment.id);
    setEditingBody(comment.body);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingBody("");
  };

  const updateComment = async (
    event: FormEvent<HTMLFormElement>,
    commentId: string,
  ) => {
    event.preventDefault();
    if (!authGate.requireAuth("comment") || pendingActionId) return;

    const body = editingBody.trim();
    if (!body) return;

    setActionError(null);
    setPendingActionId(commentId);

    try {
      const updatedComment = await updatePortfolioComment({ commentId, body });
      setComments((current) =>
        updateCommentTree(current, commentId, (currentComment) =>
          mergeUpdatedComment(currentComment, updatedComment),
        ),
      );
      cancelEdit();
    } catch (error) {
      console.error("Failed to update comment:", error);
      setActionError("Could not update comment.");
    } finally {
      setPendingActionId(null);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!authGate.requireAuth("comment") || pendingActionId) return;

    const previousComments = comments;
    setActionError(null);
    setPendingActionId(commentId);
    setComments((current) => removeCommentFromTree(current, commentId));

    try {
      await deletePortfolioComment(commentId);
      if (editingId === commentId) {
        cancelEdit();
      }
      if (activeReplyId === commentId) {
        resetReplyState();
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      setComments(previousComments);
      setActionError("Could not delete comment.");
    } finally {
      setPendingActionId(null);
    }
  };

  return {
    ...authGate,
    actionError,
    activeReplyId,
    cancelEdit,
    commentBody,
    commentCount,
    comments,
    createComment,
    createReply,
    deleteComment,
    editingBody,
    editingId,
    isLoading,
    isSubmittingComment,
    loadError,
    pendingActionId,
    replyBody,
    resetReplyState,
    setCommentBody,
    setEditingBody,
    setReplyBody,
    startEdit,
    startReply,
    toggleLike,
    updateComment,
  };
};
