import { getPapers } from "@/services/papers";
import type { Paper, PaperFilters } from "@/types/papers";

import { useInfiniteList } from "./useInfiniteList";

export function usePapers(filters: PaperFilters = {}) {
  return useInfiniteList<Paper, Awaited<ReturnType<typeof getPapers>>>({
    queryKey: ["papers", filters],
    queryFn: (page) => getPapers(filters, page),
    getItems: (page) => page.papers,
    getNextPage: (page) => page.nextPage,
    getTotalCount: (page) => page.totalCount,
  });
}
