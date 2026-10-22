export interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: "slide-teachers",
    title: "Find the right tutor for any grade",
    subtitle:
      "Browse verified teachers by grade, subject, medium and location.",
  },
  {
    id: "slide-chat",
    title: "Chat with teachers directly",
    subtitle:
      "Message tutors, discuss class schedules, and ask questions before booking.",
  },
  {
    id: "slide-papers",
    title: "Practice with past papers",
    subtitle:
      "Access official examination papers and marking schemes to prepare for exams.",
  },
];
