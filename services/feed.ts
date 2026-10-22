import { apiClient } from "@/services/api";
import type { FeedPost, FeedResponse } from "@/types/feed";

function formatTimeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
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

export async function getFeed(page = 1, limit = 10): Promise<FeedResponse> {
  const offset = (page - 1) * limit;

  const data = await apiClient.getFeed({
    limit,
    offset,
  });

  const posts: FeedPost[] = data.posts.map((post) => ({
    id: post.id,
    author: post.authorName,
    authorAvatar:
      post.authorInitials ||
      (post.authorName ? post.authorName.slice(0, 2).toUpperCase() : "SK"),
    text: post.content,
    timeLabel: formatTimeAgo(post.createdAt),
    imageUrl:
      post.assets?.find((a) => a.mediaType === "image")?.url ??
      post.assets?.[0]?.url,
    subject:
      post.teachingMeta || (post.postType === "ad" ? "Promoted" : "General"),
  }));

  const hasNextPage = offset + data.posts.length < data.totalCount;

  return {
    posts,
    totalCount: data.totalCount,
    nextPage: hasNextPage ? page + 1 : null,
  };
}
