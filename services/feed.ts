import { formatTimeAgo } from "@/lib/date";
import { resolveAssetUrl } from "@/lib/media";
import { apiClient } from "@/services/api";
import type { FeedPost, FeedResponse } from "@/types/feed";

export async function getFeed(page = 1, limit = 10): Promise<FeedResponse> {
  const offset = (page - 1) * limit;

  const data = await apiClient.getFeed({
    limit,
    offset,
  });

  const posts: FeedPost[] = data.posts.map((post) => {
    const rawImageAssets = (post.assets ?? []).filter(
      (a) => a.mediaType === "image" || !a.mediaType
    );
    const resolvedImageUrls = rawImageAssets
      .map((a) => resolveAssetUrl(a.url))
      .filter((url) => Boolean(url));
    const firstImageUrl =
      resolvedImageUrls[0] ||
      (post.assets?.[0]?.url ? resolveAssetUrl(post.assets[0].url) : undefined);

    return {
      id: post.id,
      author: post.authorName,
      authorAvatar:
        post.authorInitials ||
        (post.authorName ? post.authorName.slice(0, 2).toUpperCase() : "SK"),
      avatarUrl: post.avatarUrl ? resolveAssetUrl(post.avatarUrl) : undefined,
      text: post.content,
      timeLabel: formatTimeAgo(post.createdAt),
      imageUrl: firstImageUrl,
      imageUrls: resolvedImageUrls,
      assets: post.assets?.map((a) => ({
        id: a.id,
        url: resolveAssetUrl(a.url),
        mediaType: (a.mediaType as "image" | "video") || "image",
        durationSeconds: a.durationSeconds,
      })),
      subject:
        post.teachingMeta || (post.postType === "ad" ? "Promoted" : "General"),
    };
  });

  const hasNextPage = offset + data.posts.length < data.totalCount;

  return {
    posts,
    totalCount: data.totalCount,
    nextPage: hasNextPage ? page + 1 : null,
  };
}
