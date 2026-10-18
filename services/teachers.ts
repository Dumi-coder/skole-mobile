import type {
    Teacher,
    TeacherFilters,
    TeachersResponse,
} from "@/types/teacher";

const teacherData: Teacher[] = [
  {
    id: "t-1",
    name: "Malith Perera",
    avatar: "MP",
    verified: true,
    locations: ["Colombo 07", "Nugegoda"],
    grades: ["A/L"],
    subjects: ["Maths", "Physics"],
    medium: "English",
    about:
      "I help students build confidence in mathematics and physical science through short, structured problem-solving sessions.",
    qualifications: ["BSc in Mathematics", "PGDE", "10+ years teaching"],
    classes: ["A/L Combined Maths", "Advanced Mechanics"],
  },
  {
    id: "t-2",
    name: "Nimali Jayawardena",
    avatar: "NJ",
    verified: false,
    locations: ["Kandy"],
    grades: ["O/L"],
    subjects: ["Science", "English"],
    medium: "Sinhala",
    about:
      "Focused on improving confidence for O/L students with clear note-based revision and weekly practice checks.",
    qualifications: ["BSc Biology", "Teacher Training Certificate"],
    classes: ["Science Revision", "English Writing Clinic"],
  },
  {
    id: "t-3",
    name: "Rashan Fernando",
    avatar: undefined,
    verified: true,
    locations: ["Galle", "Matara"],
    grades: ["Grade 6-9"],
    subjects: ["ICT", "History"],
    medium: "English",
    about:
      "I work with middle school learners on digital literacy, project work, and building consistent study habits for exams.",
    qualifications: ["Dip. in ICT Education", "School Mentorship"],
    classes: ["Grade 8 Coding Basics", "History Revision Class"],
  },
  {
    id: "t-4",
    name: "Sajani Weerasinghe",
    avatar: "SW",
    verified: true,
    locations: ["Anuradhapura", "Kurunegala"],
    grades: ["A/L"],
    subjects: ["Biology", "Science"],
    medium: "Tamil",
    about:
      "I support A/L biology learners with concept mapping, question patterns, and exam-ready revision frameworks.",
    qualifications: ["BSc in Zoology", "A/L Biology Mentor"],
    classes: ["A/L Biology Intensive", "Science Fundamentals"],
  },
  {
    id: "t-5",
    name: "Kaveen Gunasekara",
    avatar: "KG",
    verified: false,
    locations: ["Colombo 06"],
    grades: ["O/L"],
    subjects: ["Maths", "Science"],
    medium: "English",
    about:
      "I help students improve speed and accuracy with targeted practice and exam strategy sessions.",
    qualifications: ["BSc Engineering", "Math Remedial Coach"],
    classes: ["Math Booster", "Science Crash Course"],
  },
  {
    id: "t-7",
    name: "Prof. Chandana Wickramasinghe-Arachchi",
    avatar: undefined,
    verified: true,
    locations: ["Colombo 03", "Dehiwala", "Mount Lavinia"],
    grades: ["A/L", "O/L"],
    subjects: ["Maths", "Science", "English", "History", "ICT"],
    medium: "English",
    about:
      "Experienced educator supporting students across multiple grades with structured revision and exam strategy.",
    qualifications: ["PhD Education", "National Teaching Award"],
    classes: ["Multi-subject Revision", "Exam Skills Workshop"],
  },
  {
    id: "t-6",
    name: "Madhavi Dissanayake",
    avatar: "MD",
    verified: true,
    locations: ["Negombo", "Ja-Ela"],
    grades: ["Grade 6-9"],
    subjects: ["English", "History"],
    medium: "Sinhala",
    about:
      "I focus on language confidence and subject clarity for younger learners through engaging lesson examples and regular check-ins.",
    qualifications: ["BA English", "Primary Education Specialist"],
    classes: ["English Reading Lab", "History Story Maps"],
  },
];

export async function getTeachers(
  filters: TeacherFilters = {},
  page = 1,
): Promise<TeachersResponse> {
  await new Promise((resolve) => setTimeout(resolve, 420));

  const search = (filters.search ?? "").trim().toLowerCase();
  const filtered = teacherData.filter((teacher) => {
    const haystack = [
      teacher.name,
      teacher.locations.join(" "),
      teacher.subjects.join(" "),
      teacher.grades.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    const matchesGrade =
      !filters.grade ||
      teacher.grades.some(
        (grade) => grade.toLowerCase() === filters.grade?.toLowerCase(),
      );
    const matchesSubject =
      !filters.subject ||
      teacher.subjects.some(
        (subject) => subject.toLowerCase() === filters.subject?.toLowerCase(),
      );
    const matchesMedium =
      !filters.medium ||
      teacher.medium?.toLowerCase() === filters.medium?.toLowerCase();
    const matchesLocation =
      !filters.location ||
      teacher.locations.some((location) =>
        location.toLowerCase().includes(filters.location!.toLowerCase()),
      );
    const matchesSearch = !search || haystack.includes(search);

    return (
      matchesGrade &&
      matchesSubject &&
      matchesMedium &&
      matchesLocation &&
      matchesSearch
    );
  });

  const pageSize = 4;
  const start = (page - 1) * pageSize;
  const slice = filtered.slice(start, start + pageSize);

  return {
    teachers: slice,
    totalCount: filtered.length,
    nextPage: start + pageSize < filtered.length ? page + 1 : null,
  };
}

export async function getTeacherById(id: string): Promise<Teacher | null> {
  await new Promise((resolve) => setTimeout(resolve, 220));
  return teacherData.find((teacher) => teacher.id === id) ?? null;
}
