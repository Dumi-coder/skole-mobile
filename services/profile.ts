import { apiClient } from "@/services/api";
import type { UserProfile } from "@/types/profile";

export async function getProfile(): Promise<UserProfile> {
  const profile = await apiClient.getProfile("cookie-session");

  let attendance = 0;
  let classes = 0;
  let teachers = 0;

  try {
    attendance = await apiClient.getAttendanceCount("cookie-session");
  } catch {
    // Non-fatal if attendance count fails
  }

  try {
    classes = await apiClient.getEnrolledClassesCount("cookie-session");
  } catch {
    // Non-fatal if enrollment count fails
  }

  try {
    const teacherList =
      await apiClient.getEnrolledClassTeachers("cookie-session");
    teachers = teacherList.length;
  } catch {
    // Non-fatal if teacher list fails
  }

  const name =
    profile.name ||
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    "User";

  return {
    id: profile.id,
    name,
    email: profile.email ?? "",
    avatar: name.slice(0, 2).toUpperCase(),
    imageUrl: profile.avatarUrl,
    bio: undefined,
    stats: {
      classes,
      attendance,
      teachers,
    },
  };
}
