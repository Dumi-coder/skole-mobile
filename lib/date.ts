/**
 * Safely parses date strings from PostgreSQL or various API formats into a valid Date object.
 * Handles space separators ("YYYY-MM-DD HH:mm:ss") and shorthand timezones like "+00".
 */
export function parseSafeDate(
  rawDate: string | Date | null | undefined
): Date | null {
  if (!rawDate) return null;
  if (rawDate instanceof Date) {
    return isNaN(rawDate.getTime()) ? null : rawDate;
  }

  const trimmed = rawDate.trim();
  if (!trimmed) return null;

  // Replace space between date and time with 'T' (e.g. "2026-10-12 07:06:45" -> "2026-10-12T07:06:45")
  let normalized = trimmed.replace(
    /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/,
    "$1T$2"
  );
  // Normalize timezone +00 or -00 to Z
  normalized = normalized.replace(/([+-]00)(:00)?$/, "Z");
  // If timezone is like +05 or -05 without minutes, append :00
  normalized = normalized.replace(/([+-]\d{2})$/, "$1:00");

  const parsed = new Date(normalized);
  if (!isNaN(parsed.getTime())) return parsed;

  const fallback = new Date(trimmed);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Formats a timestamp into a human-readable relative label (e.g., "Just now", "5m ago", "2h ago", "Oct 12").
 */
export function formatTimeAgo(rawDate: string | Date | null | undefined): string {
  try {
    const date = parseSafeDate(rawDate);
    if (!date) return "";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return "Just now";

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Compact time label for chat messages and short badges (e.g. "Now", "5m", "2h", "3d", "Oct 12").
 */
export function formatCompactTime(
  rawDate: string | Date | null | undefined
): string {
  try {
    const date = parseSafeDate(rawDate);
    if (!date) return "";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return "Now";

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}
