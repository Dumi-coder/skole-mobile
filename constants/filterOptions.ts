export const gradeOptions = ["A/L", "O/L", "Grade 6-9"] as const;

export const mediumOptions = ["English", "Sinhala", "Tamil"] as const;

export const locationOptions = [
  "Colombo",
  "Kandy",
  "Galle",
  "Matara",
] as const;

export type SubjectSection = {
  title: string;
  subjects: string[];
};

export const subjectSectionsByGrade: Record<string, SubjectSection[]> = {
  "A/L": [
    {
      title: "Science stream",
      subjects: ["Maths", "Science", "ICT"],
    },
    {
      title: "Arts stream",
      subjects: ["English", "History"],
    },
  ],
  "O/L": [
    {
      title: "Core subjects",
      subjects: ["Maths", "Science", "English", "History", "ICT"],
    },
  ],
  "Grade 6-9": [
    {
      title: "Middle school",
      subjects: ["Maths", "Science", "English", "History", "ICT"],
    },
  ],
};

export function getSubjectSections(grade?: string): SubjectSection[] {
  if (!grade) return [];
  return subjectSectionsByGrade[grade] ?? [];
}
