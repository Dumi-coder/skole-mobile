export type Teacher = {
  id: string;
  name: string;
  avatar?: string;
  imageUrl?: string | null;
  verified: boolean;
  locations: string[];
  grades: string[];
  subjects: string[];
  medium?: string;
  about: string;
  qualifications: string[];
  classes: string[];
};

export type TeacherFilters = {
  grade?: string;
  subject?: string;
  medium?: string;
  location?: string;
  search?: string;
};

export type TeachersResponse = {
  teachers: Teacher[];
  totalCount: number;
  nextPage: number | null;
};
