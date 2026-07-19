import type { PortfolioComment } from "./portfolio-engagement.types";

export const COMMENT_MAX_LENGTH = 2000;

export const getDisplayName = (comment: PortfolioComment): string =>
  comment.authorName?.trim() ||
  comment.authorUsername?.trim() ||
  "Anonymous Creator";

export const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export const getTotalCommentCount = (comments: PortfolioComment[]): number =>
  comments.reduce((total, comment) => total + 1 + comment.replies.length, 0);

export const updateCommentTree = (
  comments: PortfolioComment[],
  commentId: string,
  updater: (comment: PortfolioComment) => PortfolioComment,
): PortfolioComment[] =>
  comments.map((comment) => {
    if (comment.id === commentId) {
      return updater(comment);
    }

    return {
      ...comment,
      replies: comment.replies.map((reply) =>
        reply.id === commentId ? updater(reply) : reply,
      ),
    };
  });

export const removeCommentFromTree = (
  comments: PortfolioComment[],
  commentId: string,
): PortfolioComment[] =>
  comments
    .filter((comment) => comment.id !== commentId)
    .map((comment) => ({
      ...comment,
      replies: comment.replies.filter((reply) => reply.id !== commentId),
    }));

export const addReplyToComment = (
  comments: PortfolioComment[],
  parentCommentId: string,
  reply: PortfolioComment,
): PortfolioComment[] =>
  comments.map((comment) =>
    comment.id === parentCommentId
      ? {
          ...comment,
          replies: [...comment.replies, reply],
          repliesCount: comment.repliesCount + 1,
        }
      : comment,
  );

export const mergeUpdatedComment = (
  current: PortfolioComment,
  updated: PortfolioComment,
): PortfolioComment => ({
  ...current,
  ...updated,
  replies:
    updated.replies.length > 0 || current.replies.length === 0
      ? updated.replies
      : current.replies,
});
