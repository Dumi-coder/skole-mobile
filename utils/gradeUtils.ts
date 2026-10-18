/**
 * Normalise a grade string to a canonical lowercase key
 * for case-/format-insensitive filter matching.
 *
 * Examples:
 *   "A/L"  | "AL"  | "al"  → "al"
 *   "O/L"  | "OL"  | "ol"  → "ol"
 *   "6-9"  | "Grade 6-9"   → "69"
 *   "Other"                 → "other"
 */
export function normalizeGradeForFilter(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/\//g, "")
    .replace(/-/g, "")
    .replace(/grade/g, "");
}

/**
 * Compare two grade strings in a format-insensitive way.
 * Returns true when both represent the same grade level.
 */
export function gradesMatch(a: string, b: string): boolean {
  return normalizeGradeForFilter(a) === normalizeGradeForFilter(b);
}
