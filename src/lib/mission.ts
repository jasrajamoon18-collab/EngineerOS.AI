import type { Course, DailyTask, DsaProblem, DsaProgress, LessonProgress } from "@/lib/queries";

export type NextBestAction = {
  title: string;
  reason: string;
  to: string;
  params?: Record<string, string>;
  cta: string;
};

/**
 * Deterministic recommendation engine. Deliberately simple and explainable:
 * students should always understand WHY something is next.
 */
export function computeNextBestAction(input: {
  courses: Course[];
  lessonProgress: LessonProgress[];
  dsaProblems: DsaProblem[];
  dsaProgress: DsaProgress[];
  tasksRemaining: number;
  branchSlug: string | null;
  careerGoal: string | null;
  projectCount?: number;
  openMilestones?: number;
  hasResume?: number;
}): NextBestAction {
  if (input.careerGoal === "placement" && input.hasResume === 0) {
    return {
      title: "Draft your ATS-friendly resume",
      reason: "You're targeting placement and there is no resume saved yet — that blocks every application.",
      to: "/resume",
      cta: "Open Resume Builder",
    };
  }

  if (input.careerGoal === "projects" && (input.projectCount ?? 0) === 0) {
    return {
      title: "Register your first project",
      reason: "Your goal is building. Pick a brief and break it into milestones you can tick off.",
      to: "/projects",
      cta: "Open Project Lab",
    };
  }

  if ((input.openMilestones ?? 0) > 0) {
    return {
      title: `Close ${input.openMilestones} open project milestone${input.openMilestones! > 1 ? "s" : ""}`,
      reason: "A half-finished build teaches less than a shipped one. Finish what you started.",
      to: "/projects",
      cta: "Open Project Lab",
    };
  }

  const completedCourseIds = new Set(
    input.lessonProgress.filter((p) => p.status === "completed").map((p) => p.course_id),
  );

  const inProgress = input.courses.find((course) => completedCourseIds.has(course.id));

  if (inProgress) {
    return {
      title: `Continue ${inProgress.title}`,
      reason: "You already started this course — momentum beats a fresh start.",
      to: "/learn/$courseSlug",
      params: { courseSlug: inProgress.slug },
      cta: "Resume course",
    };
  }

  if (input.tasksRemaining > 0) {
    return {
      title: `Clear ${input.tasksRemaining} daily task${input.tasksRemaining > 1 ? "s" : ""}`,
      reason: "Your streak is built from small daily wins, not marathon sessions.",
      to: "/tasks",
      cta: "Open Daily Tasks",
    };
  }

  const solved = new Set(
    input.dsaProgress.filter((p) => p.status === "solved").map((p) => p.problem_id),
  );
  const unsolved = input.dsaProblems.find((problem) => !solved.has(problem.id));
  if (unsolved && input.careerGoal === "placement") {
    return {
      title: `Solve "${unsolved.title}"`,
      reason: "You're optimising for placement, and interview practice is the highest-leverage hour.",
      to: "/dsa",
      cta: "Open DSA practice",
    };
  }

  const starter =
    input.courses.find((course) => course.track === "programming") ?? input.courses[0];
  if (starter) {
    return {
      title: `Start ${starter.title}`,
      reason: "Nothing is in progress yet. Pick one track and go deep before adding another.",
      to: "/learn/$courseSlug",
      params: { courseSlug: starter.slug },
      cta: "Start course",
    };
  }

  return {
    title: "Explore the learning library",
    reason: "Browse the tracks and pick the one closest to your goal.",
    to: "/learn",
    cta: "Browse courses",
  };
}

/** Today's Mission: a small, finishable set drawn from the active task pool. */
export function todaysMission(tasks: DailyTask[], careerGoal: string | null): DailyTask[] {
  const priority: Record<string, number> = {
    placement: 0,
    "core-skills": 1,
    projects: 2,
    "higher-studies": 3,
  };
  const goalTrack =
    careerGoal === "placement" ? "dsa" : careerGoal === "projects" ? "programming" : "core";
  return [...tasks]
    .sort((a, b) => {
      const aScore = (a.track === goalTrack ? -10 : 0) + a.order_index;
      const bScore = (b.track === goalTrack ? -10 : 0) + b.order_index;
      return aScore - bScore;
    })
    .slice(0, 3 + (priority[careerGoal ?? ""] === 0 ? 1 : 0));
}
