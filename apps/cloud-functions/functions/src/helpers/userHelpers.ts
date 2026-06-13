/**
 * Extracts the first name from a display name
 * @param displayName - The full display name (e.g., "John Doe")
 * @returns The first name or "there" as fallback
 */
export function extractFirstName(displayName: string | null | undefined): string {
  if (!displayName || displayName.trim() === '') {
    return 'there';
  }

  const parts = displayName.trim().split(/\s+/);
  return parts[0] || 'there';
}
