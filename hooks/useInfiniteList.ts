import { useInfiniteQuery, type QueryKey } from "@tanstack/react-query";

type UseInfiniteListOptions<TItem, TPage> = {
  queryKey: QueryKey;
  queryFn: (page: number) => Promise<TPage>;
  getItems: (page: TPage) => TItem[];
  getNextPage: (page: TPage) => number | null;
  getTotalCount: (page: TPage) => number;
  enabled?: boolean;
};

export function useInfiniteList<TItem, TPage>({
  queryKey,
  queryFn,
  getItems,
  getNextPage,
  getTotalCount,
  enabled = true,
}: UseInfiniteListOptions<TItem, TPage>) {
  const query = useInfiniteQuery({
    queryKey,
    enabled,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => queryFn(pageParam),
    getNextPageParam: (lastPage) => getNextPage(lastPage) ?? undefined,
  });

  const firstPage = query.data?.pages[0];
  const items = query.data?.pages.flatMap(getItems) ?? [];

  return {
    ...query,
    items,
    totalCount: firstPage ? getTotalCount(firstPage) : 0,
  };
}
