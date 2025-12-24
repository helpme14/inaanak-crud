// Simple input validation helpers
export function containsHTML(input: string): boolean {
  if (!input) return false;
  // detect tags like <...> or common script patterns
  const tagPattern = /<[^>]+>/g;
  const scriptPattern = /<\s*script\b/i;
  return tagPattern.test(input) || scriptPattern.test(input);
}

export function stripTags(input: string): string {
  if (!input) return input;
  return input.replace(/<[^>]*>/g, "");
}

export function sanitizeInput(input: string): string {
  return stripTags(input).trim();
}

export default { containsHTML, stripTags, sanitizeInput };
