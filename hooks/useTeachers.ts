import { getTeachers } from "@/services/teachers";
import type { Teacher, TeacherFilters } from "@/types/teacher";

import { useInfiniteList } from "./useInfiniteList";

export function useTeachers(filters: TeacherFilters = {}) {
  return useInfiniteList<Teacher, Awaited<ReturnType<typeof getTeachers>>>({
    queryKey: ["teachers", filters],
    queryFn: (page) => getTeachers(filters, page),
    getItems: (page) => page.teachers,
    getNextPage: (page) => page.nextPage,
    getTotalCount: (page) => page.totalCount,
  });
}
