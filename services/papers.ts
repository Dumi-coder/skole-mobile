import { apiClient } from "@/services/api";
import type { Paper, PaperFilters, PapersResponse } from "@/types/papers";

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

export async function getPapers(
  filters: PaperFilters = {},
  page = 1,
  limit = 10,
): Promise<PapersResponse> {
  const offset = (page - 1) * limit;

  const result = await apiClient.searchMaterials({
    limit,
    offset,
    grade: normalizeGrade(filters.grade),
    medium: normalizeMedium(filters.medium),
    search: filters.search?.trim() || undefined,
    subject: filters.subject?.trim() || undefined,
  });

  const papers: Paper[] = result.materials.map((m) => ({
    id: m.id,
    title: m.title,
    subject: m.subject,
    grade: m.grade,
    year: m.year ?? new Date().getFullYear(),
    medium: filters.medium || "English",
    fileUrl: m.fileUrl,
  }));

  const hasNextPage = offset + result.materials.length < result.totalCount;

  return {
    papers,
    totalCount: result.totalCount,
    nextPage: hasNextPage ? page + 1 : null,
  };
}
