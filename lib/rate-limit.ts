/**
 * Rate Limiting utilities for API protection
 * 
 * This provides simple in-memory rate limiting.
 * For production, consider using Redis or a service like Upstash.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory store (use Redis in production)
const rateLimits = new Map<string, RateLimitRecord>();

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

// Default configurations
export const RATE_LIMITS = {
  // Strict: 5 requests per minute (login, sensitive operations)
  STRICT: { windowMs: 60 * 1000, maxRequests: 5 },
  // Medium: 20 requests per minute (API calls)
  MEDIUM: { windowMs: 60 * 1000, maxRequests: 20 },
  // Lenient: 100 requests per minute (general)
  LENIENT: { windowMs: 60 * 1000, maxRequests: 100 },
} as const;

/**
 * Get rate limit info for an IP address
 */
export function getRateLimitInfo(
  ip: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimits.get(ip);

  // No record or expired - allow and create new record
  if (!record || now > record.resetTime) {
    const resetTime = now + config.windowMs;
    rateLimits.set(ip, {
      count: 1,
      resetTime,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: Math.ceil(config.windowMs / 1000),
    };
  }

  // Check if limit exceeded
  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  // Increment counter
  record.count++;

  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetIn: Math.ceil((record.resetTime - now) / 1000),
  };
}

/**
 * Extract client IP from request headers
 */
export function getClientIp(request: Request): string {
  // Check common headers (may be set by proxies/load balancers)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback to unknown
  return "unknown";
}

/**
 * Clean up expired rate limit records
 * Should be called periodically (e.g., every 5 minutes)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [ip, record] of rateLimits.entries()) {
    if (now > record.resetTime) {
      rateLimits.delete(ip);
    }
  }
}

// Start cleanup interval in development
if (process.env.NODE_ENV === "development") {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}
