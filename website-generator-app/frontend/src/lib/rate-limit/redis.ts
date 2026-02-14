import { Redis } from "@upstash/redis";
import { isRateLimitDisabled } from "./rate-limit-config";

export const redis = isRateLimitDisabled() ? null : Redis.fromEnv();
