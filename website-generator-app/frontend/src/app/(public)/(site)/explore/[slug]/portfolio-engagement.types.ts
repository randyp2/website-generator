export interface PortfolioEngagementSummary {
  portfolioId: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  sharesCount: number;
  viewerHasLiked: boolean;
}

export interface PortfolioComment {
  id: string;
  portfolioId: string;
  parentCommentId: string | null;
  authorId: string;
  authorName: string | null;
  authorUsername: string | null;
  authorAvatarUrl: string | null;
  body: string;
  status: string;
  likesCount: number;
  repliesCount: number;
  viewerHasLiked: boolean;
  createdAt: string;
  updatedAt: string;
  replies: PortfolioComment[];
}

export interface PortfolioCommentListResponse {
  comments: PortfolioComment[];
}
