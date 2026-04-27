import { createHash, randomUUID } from 'crypto';

/**
 * Prompt injection sanitizer — Layer 3 of §9.1.
 * Runs on all student-originating content before templating.
 */
export function sanitizeStudentContent(content: string): string {
  // 1. Normalize Unicode (NFKC) to prevent homoglyph-based delimiter spoofing
  let sanitized = content.normalize('NFKC');

  // 2. Strip sequences that look like our delimiter tag closures
  const dangerousTags = [
    'student_submission',
    'student_filename',
    'student_chat_message',
    'notebook_cell',
  ];

  for (const tag of dangerousTags) {
    // Remove any closing tags that match our delimiters
    const closeTagRegex = new RegExp(`<\\s*/\\s*${tag}[^>]*>`, 'gi');
    sanitized = sanitized.replace(closeTagRegex, `[SANITIZED_TAG_CLOSURE]`);

    // Remove any opening tags that match our delimiters
    const openTagRegex = new RegExp(`<\\s*${tag}[^>]*>`, 'gi');
    sanitized = sanitized.replace(openTagRegex, `[SANITIZED_TAG_OPEN]`);
  }

  return sanitized;
}

/**
 * Wrap student content in labeled delimited blocks — Layer 1 of §9.1.
 * Uses a per-prompt random UUID as the delimiter ID.
 */
export function wrapStudentContent(
  content: string,
  type: 'submission' | 'filename' | 'chat_message' | 'notebook_cell',
): string {
  const uuid = randomUUID();
  const sanitized = sanitizeStudentContent(content);
  const tagName = `student_${type}`;

  return `<${tagName} id="${uuid}">\n${sanitized}\n</${tagName}>`;
}

/**
 * Strip PII from content before sending to the model.
 * Per §10: Replace student identity with stable per-submission pseudonyms.
 */
export function stripPII(
  content: string,
  student: { name: string; email: string; id: string },
  submissionId: string,
): { stripped: string; pseudonym: string } {
  const pseudonym = `STUDENT_${createHash('sha256').update(submissionId).digest('hex').substring(0, 6).toUpperCase()}`;

  let stripped = content;
  if (student.name) {
    stripped = stripped.replace(new RegExp(escapeRegExp(student.name), 'gi'), pseudonym);
  }
  if (student.email) {
    stripped = stripped.replace(new RegExp(escapeRegExp(student.email), 'gi'), `${pseudonym}@anonymous`);
  }
  if (student.id) {
    stripped = stripped.replace(new RegExp(escapeRegExp(student.id), 'g'), pseudonym);
  }

  return { stripped, pseudonym };
}

/**
 * Rehydrate PII into feedback after model returns.
 */
export function rehydratePII(
  content: string,
  pseudonym: string,
  student: { name: string; email: string },
): string {
  let rehydrated = content;
  rehydrated = rehydrated.replace(new RegExp(escapeRegExp(pseudonym), 'g'), student.name);
  rehydrated = rehydrated.replace(
    new RegExp(escapeRegExp(`${pseudonym}@anonymous`), 'g'),
    student.email,
  );
  return rehydrated;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
