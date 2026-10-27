/**
 * Resolves an asset URL so it can be fetched reliably on mobile devices.
 *
 * In development or when assets were uploaded locally, backend asset URLs
 * may contain "http://localhost:3001" or "http://127.0.0.1:3001", which points
 * to the mobile device itself instead of the host machine.
 * This helper replaces localhost/127.0.0.1 origins or resolves relative paths
 * with the active EXPO_PUBLIC_API_URL.
 */
export function resolveAssetUrl(rawUrl?: string | null): string {
  if (!rawUrl) return "";
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";

  const apiBase = (
    process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001"
  ).replace(/\/+$/, "");

  // If already a relative path like /v1/files/..., prepend apiBase
  if (trimmed.startsWith("/")) {
    return `${apiBase}${trimmed}`;
  }

  // If it's a localhost or 127.0.0.1 url pointing to a local backend
  try {
    const parsed = new URL(trimmed);
    if (
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "0.0.0.0"
    ) {
      return `${apiBase}${parsed.pathname}${parsed.search}`;
    }
  } catch {
    if (
      /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/i.test(trimmed)
    ) {
      return trimmed.replace(
        /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/i,
        apiBase
      );
    }
  }

  return trimmed;
}
