"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { usePublicAuthGate } from "@/context/PublicAuthGateContext";
import {
  useCreatePortfolioCommentMutation,
  useDeletePortfolioCommentMutation,
  usePortfolioCommentsQuery,
  useTogglePortfolioCommentLikeMutation,
  useUpdatePortfolioCommentMutation,
} from "../../explore.query";
import type { PortfolioComment } from "../portfolio-engagement.types";
import { getTotalCommentCount } from "../portfolio-comments.utils";

interface UsePortfolioCommentsOptions {
  portfolioId: string;
  slug: string;
}

const EMPTY_COMMENTS: PortfolioComment[] = [];

export const usePortfolioComments = ({
  portfolioId,
  slug,
}: UsePortfolioCommentsOptions) => {
  const [actionError, setActionError] = useState<string | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const authGate = usePublicAuthGate();
  const commentsQuery = usePortfolioCommentsQuery(slug);
  const createCommentMutation = useCreatePortfolioCommentMutation();
  const updateCommentMutation = useUpdatePortfolioCommentMutation();
  const deleteCommentMutation = useDeletePortfolioCommentMutation();
  const toggleCommentLikeMutation = useTogglePortfolioCommentLikeMutation();

  const comments = commentsQuery.data?.comments ?? EMPTY_COMMENTS;
  const commentCount = useMemo(() => getTotalCommentCount(comments), [comments]);
  const loadError = commentsQuery.isError ? "Could not load comments." : null;

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
      await createCommentMutation.mutateAsync({ portfolioId, slug, body });
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
      await createCommentMutation.mutateAsync({
        portfolioId,
        slug,
        body,
        parentCommentId,
      });
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

    setActionError(null);
    setPendingActionId(comment.id);

    try {
      await toggleCommentLikeMutation.mutateAsync({ comment, slug });
    } catch (error) {
      console.error("Failed to toggle comment like:", error);
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
      await updateCommentMutation.mutateAsync({ body, commentId, slug });
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

    setActionError(null);
    setPendingActionId(commentId);

    try {
      await deleteCommentMutation.mutateAsync({ commentId, slug });
      if (editingId === commentId) {
        cancelEdit();
      }
      if (activeReplyId === commentId) {
        resetReplyState();
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
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
    isLoading: commentsQuery.isPending,
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
