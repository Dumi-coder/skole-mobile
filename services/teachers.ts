import { apiClient } from "@/services/api";
import type {
  Teacher,
  TeacherFilters,
  TeachersResponse,
} from "@/types/teacher";

function normalizeGrade(
  grade?: string,
): "AL" | "OL" | "6-9" | "Other" | undefined {
  if (!grade) return undefined;
  if (/^a\/?l$/i.test(grade)) return "AL";
  if (/^o\/?l$/i.test(grade)) return "OL";
  if (/6-9|6.*9/i.test(grade)) return "6-9";
  if (grade === "Other") return "Other";
  return undefined;
}

function normalizeMedium(
  medium?: string,
): "english" | "sinhala" | "tamil" | undefined {
  if (!medium) return undefined;
  const lower = medium.toLowerCase();
  if (lower === "english" || lower === "sinhala" || lower === "tamil") {
    return lower;
  }
  return undefined;
}

export async function getTeachers(
  filters: TeacherFilters = {},
  page = 1,
  limit = 10,
): Promise<TeachersResponse> {
  const offset = (page - 1) * limit;

  const result = await apiClient.searchTeachers({
    limit,
    offset,
    grade: normalizeGrade(filters.grade),
    medium: normalizeMedium(filters.medium),
    district:
      filters.location && filters.location !== "Other"
        ? filters.location
        : undefined,
    search: filters.search?.trim() || undefined,
    subject: filters.subject?.trim() || undefined,
  });

  const teachers: Teacher[] = result.teachers.map((t) => ({
    id: t.id,
    name: t.name,
    avatar: t.avatarUrl ?? (t.name ? t.name.slice(0, 2).toUpperCase() : "T"),
    imageUrl: t.avatarUrl,
    verified: t.isVerified,
    locations: t.locations ?? [],
    grades: t.grades ?? [],
    subjects: t.subjects ?? [],
    medium: undefined,
    about: "",
    qualifications: [],
    classes: [],
  }));

  const hasNextPage = offset + result.teachers.length < result.totalCount;

  return {
    teachers,
    totalCount: result.totalCount,
    nextPage: hasNextPage ? page + 1 : null,
  };
}

export async function getTeacherById(id: string): Promise<Teacher | null> {
  const profile = await apiClient.getPublicTeacherProfile(id);
  if (!profile) return null;

  let classes: string[] = [];
  let medium: string | undefined = undefined;

  try {
    const classList = await apiClient.getTeacherClasses(id, {
      limit: 10,
      offset: 0,
    });
    classes = classList.items
      .map((c) => c.name || `${c.gradeName ?? ""} ${c.subjectName ?? ""}`.trim())
      .filter(Boolean);

    const distinctMediums = Array.from(
      new Set(
        classList.items
          .map((c) => c.medium)
          .filter((m): m is string => Boolean(m)),
      ),
    );
    if (distinctMediums.length > 0) {
      medium = distinctMediums.join(", ");
    }
  } catch {
    // Non-fatal if class list fails to load
  }

  const qualifications: string[] = [
    profile.preferences?.showDegree ? profile.degreeName : null,
    profile.preferences?.showDegree ? profile.undergradDegreeName : null,
    profile.preferences?.showDiplomaInfo ? profile.diplomaName : null,
    profile.preferences?.showUniversityInfo ? profile.universityName : null,
    profile.facultyName,
  ].filter((item): item is string => Boolean(item && item.trim()));

  return {
    id: profile.id,
    name: profile.name,
    avatar:
      profile.avatarUrl ??
      (profile.name ? profile.name.slice(0, 2).toUpperCase() : "T"),
    imageUrl: profile.avatarUrl,
    verified: profile.verified,
    locations: profile.locations ?? [],
    grades: profile.grades ?? [],
    subjects: profile.subjects ?? [],
    medium,
    about: profile.bio || "No biography provided.",
    qualifications:
      qualifications.length > 0 ? qualifications : ["Verified Educator"],
    classes,
  };
}
