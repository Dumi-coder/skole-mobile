import { getFeed } from "@/services/feed";
import type { FeedPost } from "@/types/feed";

import { useInfiniteList } from "./useInfiniteList";

export function useFeed() {
  return useInfiniteList<FeedPost, Awaited<ReturnType<typeof getFeed>>>({
    queryKey: ["feed"],
    queryFn: (page) => getFeed(page),
    getItems: (page) => page.posts,
    getNextPage: (page) => page.nextPage,
    getTotalCount: (page) => page.totalCount,
  });
}
