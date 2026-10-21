import type { Teacher } from "@/types/teacher";

export function formatTeacherLocations(locations: string[]): string {
  return locations.join(" • ");
}

export function getTeacherInitials(teacher: Pick<Teacher, "name" | "avatar">) {
  if (teacher.avatar && teacher.avatar.length <= 3) {
    return teacher.avatar;
  }

  const parts = teacher.name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}
