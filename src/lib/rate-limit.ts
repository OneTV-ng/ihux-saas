import { ROLE_PERMISSIONS, UserRole } from "@/db/schema";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

/**
 * Rate limiter based on user role and API class
 */
export class RateLimiter {
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup old entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      Object.keys(rateLimitStore).forEach((key) => {
        if (rateLimitStore[key].resetTime < now) {
          delete rateLimitStore[key];
        }
      });
    }, 60000);
  }

  /**
   * Check if request should be rate limited
   * Returns { allowed: boolean, remaining: number, resetTime: number }
   */
  checkLimit(
    userId: string,
    role: UserRole | null = null,
  ): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    limit: number;
  } {
    const permissions = role
      ? ROLE_PERMISSIONS[role]
      : ROLE_PERMISSIONS.guest;
    const limit = permissions.requestsPerMin;

    // Super admin has unlimited requests
    if (limit === Infinity) {
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: Date.now() + 60000,
        limit: Infinity,
      };
    }

    const key = `${userId}:${Date.now() / 60000 | 0}`;
    const now = Date.now();
    const resetTime = Math.ceil(now / 60000) * 60000;

    if (!rateLimitStore[key]) {
      rateLimitStore[key] = {
        count: 0,
        resetTime,
      };
    }

    const store = rateLimitStore[key];
    store.count++;

    const remaining = Math.max(0, limit - store.count);
    const allowed = store.count <= limit;

    return {
      allowed,
      remaining,
      resetTime: store.resetTime,
      limit,
    };
  }

  /**
   * Reset rate limit for a user
   */
  reset(userId: string): void {
    Object.keys(rateLimitStore).forEach((key) => {
      if (key.startsWith(userId)) {
        delete rateLimitStore[key];
      }
    });
  }

  /**
   * Destroy the rate limiter
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter();

/**
 * Rate limit middleware for API routes
 */
export async function withRateLimit(
  handler: Function,
  userId: string,
  role: UserRole | null = null,
) {
  const { allowed, remaining, resetTime, limit } = rateLimiter.checkLimit(
    userId,
    role,
  );

  if (!allowed) {
    return Response.json(
      {
        error: "Rate limit exceeded",
        limit,
        remaining: 0,
        resetTime,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": resetTime.toString(),
          "Retry-After": Math.ceil((resetTime - Date.now()) / 1000).toString(),
        },
      },
    );
  }

  const response = await handler();

  // Add rate limit headers to response
  if (response instanceof Response) {
    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", resetTime.toString());
  }

  return response;
}
