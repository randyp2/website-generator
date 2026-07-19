import type {
  PortfolioComment,
  PortfolioCommentListResponse,
  PortfolioEngagementSummary,
} from "./portfolio-engagement.types";

const readJson = async <T>(response: Response, fallbackMessage: string): Promise<T> => {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let message = fallbackMessage;
  try {
    const payload = (await response.json()) as { error?: unknown; message?: unknown };
    if (typeof payload.error === "string") {
      message = payload.error;
    } else if (typeof payload.message === "string") {
      message = payload.message;
    }
  } catch {
    const text = await response.text().catch(() => "");
    if (text) message = text;
  }

  throw new Error(message);
};

const engagementPath = (slug: string): string =>
  `/api/public/portfolio/${encodeURIComponent(slug)}/engagement`;

const authenticatedEngagementPath = (portfolioId: string): string =>
  `/api/portfolio/engagement/${encodeURIComponent(portfolioId)}`;

export const fetchPortfolioEngagementSummary = async (
  slug: string,
): Promise<PortfolioEngagementSummary> => {
  const response = await fetch(engagementPath(slug), {
    cache: "no-store",
    credentials: "same-origin",
  });

  return readJson<PortfolioEngagementSummary>(
    response,
    "Failed to load portfolio engagement.",
  );
};

export const recordPortfolioView = async (
  slug: string,
): Promise<PortfolioEngagementSummary> => {
  const response = await fetch(`${engagementPath(slug)}/views`, {
    method: "POST",
    cache: "no-store",
    credentials: "same-origin",
  });

  return readJson<PortfolioEngagementSummary>(
    response,
    "Failed to record portfolio view.",
  );
};

export const recordPortfolioShare = async (
  slug: string,
): Promise<PortfolioEngagementSummary> => {
  const response = await fetch(`${engagementPath(slug)}/shares`, {
    method: "POST",
    cache: "no-store",
    credentials: "same-origin",
  });

  return readJson<PortfolioEngagementSummary>(
    response,
    "Failed to record portfolio share.",
  );
};

export const likePortfolio = async (
  portfolioId: string,
): Promise<PortfolioEngagementSummary> => {
  const response = await fetch(`${authenticatedEngagementPath(portfolioId)}/like`, {
    method: "POST",
    cache: "no-store",
    credentials: "same-origin",
  });

  return readJson<PortfolioEngagementSummary>(response, "Failed to like portfolio.");
};

export const unlikePortfolio = async (
  portfolioId: string,
): Promise<PortfolioEngagementSummary> => {
  const response = await fetch(`${authenticatedEngagementPath(portfolioId)}/like`, {
    method: "DELETE",
    cache: "no-store",
    credentials: "same-origin",
  });

  return readJson<PortfolioEngagementSummary>(
    response,
    "Failed to unlike portfolio.",
  );
};

export const fetchPortfolioComments = async (
  slug: string,
): Promise<PortfolioCommentListResponse> => {
  const response = await fetch(`${engagementPath(slug)}/comments`, {
    cache: "no-store",
    credentials: "same-origin",
  });

  return readJson<PortfolioCommentListResponse>(
    response,
    "Failed to load comments.",
  );
};

export const createPortfolioComment = async ({
  portfolioId,
  body,
  parentCommentId,
}: {
  portfolioId: string;
  body: string;
  parentCommentId?: string;
}): Promise<PortfolioComment> => {
  const response = await fetch(`${authenticatedEngagementPath(portfolioId)}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body, parentCommentId }),
    cache: "no-store",
    credentials: "same-origin",
  });

  return readJson<PortfolioComment>(response, "Failed to post comment.");
};

export const updatePortfolioComment = async ({
  commentId,
  body,
}: {
  commentId: string;
  body: string;
}): Promise<PortfolioComment> => {
  const response = await fetch(
    `/api/portfolio/engagement/comments/${encodeURIComponent(commentId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
      cache: "no-store",
      credentials: "same-origin",
    },
  );

  return readJson<PortfolioComment>(response, "Failed to update comment.");
};

export const deletePortfolioComment = async (commentId: string): Promise<void> => {
  const response = await fetch(
    `/api/portfolio/engagement/comments/${encodeURIComponent(commentId)}`,
    {
      method: "DELETE",
      cache: "no-store",
      credentials: "same-origin",
    },
  );

  if (!response.ok) {
    await readJson<unknown>(response, "Failed to delete comment.");
  }
};

export const likePortfolioComment = async (
  commentId: string,
): Promise<PortfolioComment> => {
  const response = await fetch(
    `/api/portfolio/engagement/comments/${encodeURIComponent(commentId)}/like`,
    {
      method: "POST",
      cache: "no-store",
      credentials: "same-origin",
    },
  );

  return readJson<PortfolioComment>(response, "Failed to like comment.");
};

export const unlikePortfolioComment = async (
  commentId: string,
): Promise<PortfolioComment> => {
  const response = await fetch(
    `/api/portfolio/engagement/comments/${encodeURIComponent(commentId)}/like`,
    {
      method: "DELETE",
      cache: "no-store",
      credentials: "same-origin",
    },
  );

  return readJson<PortfolioComment>(response, "Failed to unlike comment.");
};
