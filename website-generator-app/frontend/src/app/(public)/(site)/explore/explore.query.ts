"use client";

import {
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createPortfolioComment,
  deletePortfolioComment,
  fetchPortfolioComments,
  fetchPortfolioEngagementSummary,
  likePortfolio,
  likePortfolioComment,
  recordPortfolioShare,
  recordPortfolioView,
  unlikePortfolio,
  unlikePortfolioComment,
  updatePortfolioComment,
} from "./[slug]/portfolio-engagement.api";
import type {
  PortfolioComment,
  PortfolioCommentListResponse,
  PortfolioEngagementSummary,
} from "./[slug]/portfolio-engagement.types";
import {
  addReplyToComment,
  mergeUpdatedComment,
  removeCommentFromTree,
  updateCommentTree,
} from "./[slug]/portfolio-comments.utils";
import type {
  PageResponse,
  PortfolioCard,
  PortfolioCardMetrics,
} from "./components/explore.types";

export const exploreQueryKeys = {
  all: ["explore"] as const,
  portfolioPages: (pageSize: number) =>
    [...exploreQueryKeys.all, "portfolio-pages", { pageSize }] as const,
  engagement: (slug: string) =>
    [...exploreQueryKeys.all, "engagement", slug] as const,
  comments: (slug: string) =>
    [...exploreQueryKeys.all, "comments", slug] as const,
};

export const createEmptyPortfolioEngagementSummary = (
  portfolioId: string,
): PortfolioEngagementSummary => ({
  portfolioId,
  likesCount: 0,
  commentsCount: 0,
  viewsCount: 0,
  sharesCount: 0,
  viewerHasLiked: false,
});

const fetchExplorePortfolioPage = async (
  page: number,
  size: number,
): Promise<PageResponse> => {
  const response = await fetch(`/api/public/portfolio?page=${page}&size=${size}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error("Failed to load explore portfolios.");
  }

  return (await response.json()) as PageResponse;
};

const toPortfolioCardMetrics = (
  summary: PortfolioEngagementSummary,
): PortfolioCardMetrics => ({
  portfolioId: summary.portfolioId,
  likes: summary.likesCount,
  comments: summary.commentsCount,
  views: summary.viewsCount,
  viewerHasLiked: summary.viewerHasLiked,
});

const setPortfolioEngagementSummary = (
  queryClient: QueryClient,
  slug: string,
  summary: PortfolioEngagementSummary,
): void => {
  queryClient.setQueryData(exploreQueryKeys.engagement(slug), summary);
};

const updatePortfolioEngagementSummary = (
  queryClient: QueryClient,
  slug: string,
  updater: (summary: PortfolioEngagementSummary) => PortfolioEngagementSummary,
): void => {
  queryClient.setQueryData<PortfolioEngagementSummary>(
    exploreQueryKeys.engagement(slug),
    (current) => (current ? updater(current) : current),
  );
};

const updateCommentCount = (
  queryClient: QueryClient,
  slug: string,
  delta: number,
): void => {
  updatePortfolioEngagementSummary(queryClient, slug, (current) => ({
    ...current,
    commentsCount: Math.max(0, current.commentsCount + delta),
  }));
};

const updatePortfolioComments = (
  queryClient: QueryClient,
  slug: string,
  updater: (comments: PortfolioComment[]) => PortfolioComment[],
): void => {
  queryClient.setQueryData<PortfolioCommentListResponse>(
    exploreQueryKeys.comments(slug),
    (current) =>
      current
        ? {
            ...current,
            comments: updater(current.comments),
          }
        : current,
  );
};

const getRemovedCommentCount = (
  comments: PortfolioComment[],
  commentId: string,
): number => {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return 1 + comment.replies.length;
    }

    if (comment.replies.some((reply) => reply.id === commentId)) {
      return 1;
    }
  }

  return 0;
};

export const useExplorePortfoliosInfiniteQuery = (pageSize: number) =>
  useInfiniteQuery({
    queryKey: exploreQueryKeys.portfolioPages(pageSize),
    queryFn: ({ pageParam }) =>
      fetchExplorePortfolioPage(Number(pageParam), pageSize),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
  });

export const usePortfolioEngagementQuery = (slug: string) =>
  useQuery({
    queryKey: exploreQueryKeys.engagement(slug),
    queryFn: () => fetchPortfolioEngagementSummary(slug),
    enabled: slug.length > 0,
  });

export const usePortfolioCardMetricsMap = (
  portfolios: PortfolioCard[],
): Record<string, PortfolioCardMetrics> => {
  const seenSlugs = new Set<string>();
  const uniquePortfolios = portfolios.filter((portfolio) => {
    if (seenSlugs.has(portfolio.slug)) return false;
    seenSlugs.add(portfolio.slug);
    return true;
  });

  const metricQueries = useQueries({
    queries: uniquePortfolios.map((portfolio) => ({
      queryKey: exploreQueryKeys.engagement(portfolio.slug),
      queryFn: () => fetchPortfolioEngagementSummary(portfolio.slug),
      enabled: portfolio.slug.length > 0,
    })),
  });

  return metricQueries.reduce<Record<string, PortfolioCardMetrics>>(
    (metricsBySlug, query, index) => {
      const summary = query.data;
      if (summary) {
        metricsBySlug[uniquePortfolios[index].slug] =
          toPortfolioCardMetrics(summary);
      }
      return metricsBySlug;
    },
    {},
  );
};

export const useTogglePortfolioLikeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      portfolioId,
      viewerHasLiked,
    }: {
      portfolioId: string;
      slug: string;
      viewerHasLiked: boolean;
    }) =>
      viewerHasLiked
        ? unlikePortfolio(portfolioId)
        : likePortfolio(portfolioId),
    onMutate: async (variables) => {
      const queryKey = exploreQueryKeys.engagement(variables.slug);
      await queryClient.cancelQueries({ queryKey });

      const previous =
        queryClient.getQueryData<PortfolioEngagementSummary>(queryKey);
      const current =
        previous ??
        createEmptyPortfolioEngagementSummary(variables.portfolioId);
      const nextViewerHasLiked = !current.viewerHasLiked;

      queryClient.setQueryData<PortfolioEngagementSummary>(queryKey, {
        ...current,
        viewerHasLiked: nextViewerHasLiked,
        likesCount: nextViewerHasLiked
          ? current.likesCount + 1
          : Math.max(0, current.likesCount - 1),
      });

      return { previous };
    },
    onError: (_error, variables, context) => {
      if (context?.previous) {
        setPortfolioEngagementSummary(
          queryClient,
          variables.slug,
          context.previous,
        );
        return;
      }

      queryClient.removeQueries({
        queryKey: exploreQueryKeys.engagement(variables.slug),
        exact: true,
      });
    },
    onSuccess: (summary, variables) => {
      setPortfolioEngagementSummary(queryClient, variables.slug, summary);
    },
  });
};

export const useRecordPortfolioViewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => recordPortfolioView(slug),
    onSuccess: (summary, slug) => {
      setPortfolioEngagementSummary(queryClient, slug, summary);
    },
  });
};

export const useRecordPortfolioShareMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => recordPortfolioShare(slug),
    onSuccess: (summary, slug) => {
      setPortfolioEngagementSummary(queryClient, slug, summary);
    },
  });
};

export const usePortfolioCommentsQuery = (slug: string) =>
  useQuery({
    queryKey: exploreQueryKeys.comments(slug),
    queryFn: () => fetchPortfolioComments(slug),
    enabled: slug.length > 0,
  });

export const useCreatePortfolioCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      body,
      parentCommentId,
      portfolioId,
    }: {
      body: string;
      parentCommentId?: string;
      portfolioId: string;
      slug: string;
    }) =>
      createPortfolioComment({
        body,
        parentCommentId,
        portfolioId,
      }),
    onSuccess: (createdComment, variables) => {
      updatePortfolioComments(queryClient, variables.slug, (comments) =>
        variables.parentCommentId
          ? addReplyToComment(
              comments,
              variables.parentCommentId,
              createdComment,
            )
          : [...comments, createdComment],
      );
      updateCommentCount(queryClient, variables.slug, 1);
    },
  });
};

export const useUpdatePortfolioCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      body,
      commentId,
    }: {
      body: string;
      commentId: string;
      slug: string;
    }) => updatePortfolioComment({ body, commentId }),
    onSuccess: (updatedComment, variables) => {
      updatePortfolioComments(queryClient, variables.slug, (comments) =>
        updateCommentTree(comments, variables.commentId, (currentComment) =>
          mergeUpdatedComment(currentComment, updatedComment),
        ),
      );
    },
  });
};

export const useDeletePortfolioCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }: { commentId: string; slug: string }) =>
      deletePortfolioComment(commentId),
    onMutate: async (variables) => {
      const queryKey = exploreQueryKeys.comments(variables.slug);
      await queryClient.cancelQueries({ queryKey });

      const previous =
        queryClient.getQueryData<PortfolioCommentListResponse>(queryKey);
      const removedCount = previous
        ? getRemovedCommentCount(previous.comments, variables.commentId)
        : 0;

      updatePortfolioComments(queryClient, variables.slug, (comments) =>
        removeCommentFromTree(comments, variables.commentId),
      );
      if (removedCount > 0) {
        updateCommentCount(queryClient, variables.slug, -removedCount);
      }

      return { previous, removedCount };
    },
    onError: (_error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          exploreQueryKeys.comments(variables.slug),
          context.previous,
        );
      }
      if (context?.removedCount) {
        updateCommentCount(queryClient, variables.slug, context.removedCount);
      }
    },
  });
};

export const useTogglePortfolioCommentLikeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      comment,
    }: {
      comment: PortfolioComment;
      slug: string;
    }) =>
      comment.viewerHasLiked
        ? unlikePortfolioComment(comment.id)
        : likePortfolioComment(comment.id),
    onMutate: async (variables) => {
      const queryKey = exploreQueryKeys.comments(variables.slug);
      await queryClient.cancelQueries({ queryKey });

      const previous =
        queryClient.getQueryData<PortfolioCommentListResponse>(queryKey);
      const nextViewerHasLiked = !variables.comment.viewerHasLiked;

      updatePortfolioComments(queryClient, variables.slug, (comments) =>
        updateCommentTree(comments, variables.comment.id, (currentComment) => ({
          ...currentComment,
          viewerHasLiked: nextViewerHasLiked,
          likesCount: nextViewerHasLiked
            ? currentComment.likesCount + 1
            : Math.max(0, currentComment.likesCount - 1),
        })),
      );

      return { previous };
    },
    onError: (_error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          exploreQueryKeys.comments(variables.slug),
          context.previous,
        );
      }
    },
    onSuccess: (updatedComment, variables) => {
      updatePortfolioComments(queryClient, variables.slug, (comments) =>
        updateCommentTree(comments, variables.comment.id, (currentComment) =>
          mergeUpdatedComment(currentComment, updatedComment),
        ),
      );
    },
  });
};
