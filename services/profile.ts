import type { UserProfile } from "@/types/profile";

export async function getProfile(): Promise<UserProfile> {
  await new Promise((resolve) => setTimeout(resolve, 260));

  return {
    id: "u-1",
    name: "Aditi Silva",
    email: "aditi.silva@example.com",
    avatar: "AS",
    bio: "Learning coach and A/L student",
    stats: {
      classes: 12,
      attendance: 94,
      teachers: 8,
    },
  };
}
