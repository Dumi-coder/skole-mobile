import { useQuery } from "@tanstack/react-query";

import { getTeacherById } from "@/services/teachers";

export function useTeacher(teacherId: string | undefined) {
  return useQuery({
    queryKey: ["teacher", teacherId],
    queryFn: () => getTeacherById(String(teacherId)),
    enabled: Boolean(teacherId),
  });
}
