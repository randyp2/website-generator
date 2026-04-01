export type RateLimitResult = {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
};

export type RateLimiter = {
    limit: (key: string) => Promise<RateLimitResult>;
};
