export type Paper = {
  id: string;
  title: string;
  subject: string;
  grade: string;
  year: number;
  medium: string;
};

export type PaperFilters = {
  grade?: string;
  subject?: string;
  medium?: string;
  search?: string;
};

export type PapersResponse = {
  papers: Paper[];
  totalCount: number;
  nextPage: number | null;
};
