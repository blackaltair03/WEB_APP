/**
 * Security utilities for sanitizing user input
 */

const HTML_ESCAPES: Record<string, string> = {
  '&': '&',
  '<': '<',
  '>': '>',
  '"': '"',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    result += HTML_ESCAPES[char] || char;
  }
  return result;
}

/**
 * Sanitize string for safe use in URLs
 */
export function sanitizeUrl(str: string): string {
  if (!str) return '';
  return encodeURIComponent(str).replace(/%(?:2F|%2F)/gi, '');
}

/**
 * Sanitize email for display (partial reveal)
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  const parts = email.split('@');
  if (parts.length !== 2) return escapeHtml(email);

  const localPart = parts[0];
  const domain = parts[1];
  const visibleLength = Math.min(3, localPart.length);
  const masked = localPart.slice(0, visibleLength) + '***';
  
  return escapeHtml(masked) + '@' + escapeHtml(domain);
}

/**
 * Validate and sanitize password reset token
 */
export function isValidToken(token: string): boolean {
  return /^[a-zA-Z0-9_-]{32,128}$/.test(token);
}

/**
 * Sanitize user input for logging (remove sensitive data)
 */
export function sanitizeForLog<T extends Record<string, unknown>>(
  data: T,
  sensitiveFields: string[] = ['password', 'token', 'secret', 'key', 'api_key', 'authorization']
): Partial<T> {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    const isSensitive = sensitiveFields.some(field => 
      key.toLowerCase().includes(field.toLowerCase())
    );
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeForLog(value as Record<string, unknown>, sensitiveFields);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as Partial<T>;
}
