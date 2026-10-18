export const gradeOptions = ["AL", "OL", "6-9", "Other"] as const;

export const mediumOptions = ["Sinhala", "English", "Tamil"] as const;

export const locationOptions = [
  "Colombo",
  "Gampaha",
  "Kandy",
  "Kalutara",
  "Kurunegala",
  "Galle",
  "Matara",
  "Ratnapura",
  "Badulla",
  "Anuradhapura",
  "Kegalle",
  "Puttalam",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Mullaitivu",
  "Polonnaruwa",
  "Vavuniya",
  "Ampara",
  "Hambantota",
  "Matale",
  "Nuwara Eliya",
  "Trincomalee",
  "Batticaloa",
  "Monaragala",
  "Other",
] as const;

export type SubjectSection = {
  title: string;
  subjects: string[];
};

export const subjectSectionsByGrade: Record<string, SubjectSection[]> = {
  AL: [
    {
      title: "Science stream",
      subjects: ["Maths", "Physics", "Chemistry", "Bio", "ICT"],
    },
    {
      title: "Commerce stream",
      subjects: ["Econ", "Account", "Business"],
    },
    {
      title: "Arts & Technology",
      subjects: ["Art", "Tech", "Other"],
    },
  ],
  OL: [
    {
      title: "Core subjects",
      subjects: [
        "Maths",
        "Science",
        "English",
        "ICT",
        "Commerce",
        "Sinhala",
        "History",
        "Tamil",
        "Other",
      ],
    },
  ],
  "6-9": [
    {
      title: "Middle school",
      subjects: ["Maths", "Science", "English", "Other"],
    },
  ],
  Other: [],
};

export function getSubjectSections(grade?: string): SubjectSection[] {
  if (!grade) return [];
  return subjectSectionsByGrade[grade] ?? [];
}
