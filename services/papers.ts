import type { Paper, PaperFilters, PapersResponse } from "@/types/papers";

const papers: Paper[] = [
  {
    id: "p-1",
    title: "2024 Chemistry Paper I",
    subject: "Science",
    grade: "A/L",
    year: 2024,
    medium: "English",
  },
  {
    id: "p-2",
    title: "2023 Physics MCQ Set",
    subject: "Science",
    grade: "O/L",
    year: 2023,
    medium: "Sinhala",
  },
  {
    id: "p-3",
    title: "2022 Biology Structured Essay",
    subject: "Science",
    grade: "A/L",
    year: 2022,
    medium: "Tamil",
  },
  {
    id: "p-4",
    title: "English Essay Practice Pack",
    subject: "English",
    grade: "Grade 6-9",
    year: 2024,
    medium: "English",
  },
  {
    id: "p-5",
    title: "ICT Revision Paper",
    subject: "ICT",
    grade: "O/L",
    year: 2024,
    medium: "English",
  },
  {
    id: "p-6",
    title: "History Short Answers",
    subject: "History",
    grade: "Grade 6-9",
    year: 2023,
    medium: "Sinhala",
  },
  {
    id: "p-7",
    title: "Mathematics Part II",
    subject: "Maths",
    grade: "O/L",
    year: 2022,
    medium: "English",
  },
  {
    id: "p-8",
    title: "A/L Combined Maths Past Papers",
    subject: "Maths",
    grade: "A/L",
    year: 2021,
    medium: "English",
  },
];

export async function getPapers(
  filters: PaperFilters = {},
  page = 1,
): Promise<PapersResponse> {
  await new Promise((resolve) => setTimeout(resolve, 380));

  const search = (filters.search ?? "").trim().toLowerCase();
  const filtered = papers.filter((paper) => {
    const matchesGrade =
      !filters.grade ||
      paper.grade.toLowerCase() === filters.grade.toLowerCase();
    const matchesSubject =
      !filters.subject ||
      paper.subject.toLowerCase() === filters.subject.toLowerCase();
    const matchesMedium =
      !filters.medium ||
      paper.medium.toLowerCase() === filters.medium.toLowerCase();
    const matchesSearch =
      !search || paper.title.toLowerCase().includes(search);

    return matchesGrade && matchesSubject && matchesMedium && matchesSearch;
  });

  const pageSize = 4;
  const start = (page - 1) * pageSize;
  const slice = filtered.slice(start, start + pageSize);

  return {
    papers: slice,
    totalCount: filtered.length,
    nextPage: start + pageSize < filtered.length ? page + 1 : null,
  };
}
