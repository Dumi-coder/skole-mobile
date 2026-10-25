export type GradeTone = "al" | "ol" | "grade-6-9" | "neutral";
export type SubjectKey =
  | "english"
  | "maths"
  | "science"
  | "history"
  | "ict"
  | "default";

export const gradePalette: Record<
  GradeTone,
  {
    light: { bg: string; text: string };
    dark: { bg: string; text: string };
    label: string;
  }
> = {
  al: {
    light: { bg: "#EDE9FE", text: "#4C1D95" },
    dark: { bg: "#2E1F5E", text: "#C4B5FD" },
    label: "A/L",
  },
  ol: {
    light: { bg: "#D9F4EC", text: "#065F46" },
    dark: { bg: "#0F3B2E", text: "#6EE7B7" },
    label: "O/L",
  },
  "grade-6-9": {
    light: { bg: "#FDEBC8", text: "#7A4400" },
    dark: { bg: "#4A2E08", text: "#FCD34D" },
    label: "Grade 6-9",
  },
  neutral: {
    light: { bg: "#F4F4F5", text: "#0A0A0A" },
    dark: { bg: "#18181B", text: "#FAFAFA" },
    label: "Other",
  },
};

export const subjectPalette: Record<
  SubjectKey,
  {
    light: { text: string; border: string };
    dark: { text: string; border: string };
  }
> = {
  english: {
    light: { text: "#BE123C", border: "#E4E4E7" },
    dark: { text: "#FB7185", border: "#3F3F46" },
  },
  maths: {
    light: { text: "#1D4ED8", border: "#E4E4E7" },
    dark: { text: "#60A5FA", border: "#3F3F46" },
  },
  science: {
    light: { text: "#047857", border: "#E4E4E7" },
    dark: { text: "#34D399", border: "#3F3F46" },
  },
  history: {
    light: { text: "#B45309", border: "#E4E4E7" },
    dark: { text: "#FBBF24", border: "#3F3F46" },
  },
  ict: {
    light: { text: "#0F766E", border: "#E4E4E7" },
    dark: { text: "#67E8F9", border: "#3F3F46" },
  },
  default: {
    light: { text: "#0A0A0A", border: "#E4E4E7" },
    dark: { text: "#FAFAFA", border: "#3F3F46" },
  },
};

export function normalizeGradeKey(value: string): GradeTone {
  const normalized = value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/\//g, "")
    .replace(/-/g, "")
    .replace(/grade/g, "");

  if (normalized === "al" || normalized === "a/l") return "al";
  if (normalized === "ol" || normalized === "o/l") return "ol";
  if (normalized === "69" || normalized === "6to9" || normalized === "6-9")
    return "grade-6-9";
  return "neutral";
}

export function getGradeStyle(theme: "light" | "dark", value: string) {
  const key = normalizeGradeKey(value);
  return gradePalette[key][theme] ?? gradePalette.neutral[theme];
}

export function getSubjectKey(value: string): SubjectKey {
  const normalized = value.trim().toLowerCase();

  if (normalized.includes("english")) return "english";
  if (normalized.includes("math") || normalized.includes("mathematics"))
    return "maths";
  if (normalized.includes("science")) return "science";
  if (normalized.includes("history")) return "history";
  if (normalized.includes("ict") || normalized.includes("computer"))
    return "ict";
  return "default";
}

export function getSubjectStyle(theme: "light" | "dark", value: string) {
  return subjectPalette[getSubjectKey(value)][theme];
}
