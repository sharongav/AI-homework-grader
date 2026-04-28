/**
 * Content moderation and security hardening per Phase 14.
 * Virus scan, magic-byte sniffing, file validation.
 */

/** Allowed MIME types with their magic bytes. */
const MAGIC_BYTES: Record<string, Buffer[]> = {
  'application/pdf': [Buffer.from([0x25, 0x50, 0x44, 0x46])], // %PDF
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    Buffer.from([0x50, 0x4b, 0x03, 0x04]), // PK (ZIP)
  ],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': [
    Buffer.from([0x50, 0x4b, 0x03, 0x04]),
  ],
  'application/zip': [Buffer.from([0x50, 0x4b, 0x03, 0x04])],
  'text/plain': [],
  'text/markdown': [],
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate file upload: magic bytes, size limit, extension check.
 * Per §9.8 and Phase 14.
 */
export function validateUpload(
  buffer: Buffer,
  filename: string,
  declaredMime: string,
  maxSizeBytes: number,
): FileValidationResult {
  // Size check
  if (buffer.length > maxSizeBytes) {
    return { valid: false, error: `File exceeds maximum size of ${maxSizeBytes} bytes` };
  }

  // Extension check
  const ext = filename.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['pdf', 'docx', 'pptx', 'txt', 'md', 'zip', 'py', 'java', 'js', 'ts', 'c', 'cpp', 'h'];
  if (!ext || !allowedExtensions.includes(ext)) {
    return { valid: false, error: `File extension .${ext} is not allowed` };
  }

  // Magic byte validation for binary formats
  const expectedMagic = MAGIC_BYTES[declaredMime];
  if (expectedMagic && expectedMagic.length > 0) {
    const matches = expectedMagic.some((magic: any) =>
      buffer.subarray(0, magic.length).equals(magic),
    );
    if (!matches) {
      return { valid: false, error: 'File content does not match declared type (magic bytes mismatch)' };
    }
  }

  return { valid: true };
}

/**
 * Rate limiting configuration per Phase 14.
 * Uses Upstash Ratelimit or equivalent.
 */
export interface RateLimitConfig {
  /** Requests per window. */
  limit: number;
  /** Window duration in seconds. */
  window: number;
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'submission.submit': { limit: 10, window: 60 },
  'chat.sendMessage': { limit: 30, window: 60 },
  'appeal.create': { limit: 5, window: 3600 },
  'auth.signIn': { limit: 10, window: 300 },
  'api.general': { limit: 100, window: 60 },
};
