import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Check, Circle, Flame, ListTree, Sparkles, Target, Trophy } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import {
  coursesQuery,
  dailyTasksQuery,
  dsaProblemsQuery,
  dsaProgressQuery,
  lessonProgressQuery,
  profileQuery,
  resumesQuery,
  skillRatingsQuery,
  interviewAnswersQuery,
  communicationEntriesQuery,
  userProjectsQuery,
  taskCompletionsQuery,
  todayISO,
} from "@/lib/queries";
import { computeNextBestAction, todaysMission } from "@/lib/mission";
import { toggleTask } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — EngineerOS" },
      {
        name: "description",
        content: "Your mission for today, live progress and the single next best action.",
      },
      { property: "og:title", content: "Dashboard — EngineerOS" },
      { property: "og:description", content: "Today's Mission, progress and Next Best Action." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const day = todayISO();

  const { data: profile } = useQuery(profileQuery(user?.id));
  const { data: courses = [] } = useQuery(coursesQuery());
  const { data: lessonProgress = [] } = useQuery(lessonProgressQuery(user?.id));
  const { data: problems = [] } = useQuery(dsaProblemsQuery());
  const { data: dsaProgress = [] } = useQuery(dsaProgressQuery(user?.id));
  const { data: tasks = [] } = useQuery(dailyTasksQuery());
  const { data: completions = [] } = useQuery(taskCompletionsQuery(user?.id, day));

  const mission = todaysMission(tasks, profile?.career_goal ?? null);
  const doneIds = new Set(completions.map((c) => c.task_id));
  const missionDone = mission.filter((task) => doneIds.has(task.id)).length;
  const solvedCount = dsaProgress.filter((p) => p.status === "solved").length;
  const lessonsDone = lessonProgress.filter((p) => p.status === "completed").length;

  const { data: projectData } = useQuery(userProjectsQuery(user?.id));
  const { data: resumes = [] } = useQuery(resumesQuery(user?.id));
  const { data: skillRatings = [] } = useQuery(skillRatingsQuery(user?.id));
  const { data: interviewAnswers = [] } = useQuery(interviewAnswersQuery(user?.id));
  const { data: communicationEntries = [] } = useQuery(communicationEntriesQuery(user?.id));

  const nextAction = computeNextBestAction({
    courses,
    lessonProgress,
    dsaProblems: problems,
    dsaProgress,
    tasksRemaining: mission.length - missionDone,
    branchSlug: profile?.branch_slug ?? null,
    careerGoal: profile?.career_goal ?? null,
    projectCount: projectData?.projects.length ?? 0,
    openMilestones: (projectData?.milestones ?? []).filter((m) => !m.is_done).length,
    hasResume: resumes.length,
    skillRatingCount: skillRatings.length,
    interviewAnswerCount: interviewAnswers.length,
    communicationEntryCount: communicationEntries.length,
  });

  async function onToggle(taskId: string, xp: number, completed: boolean) {
    if (!user) return;
    try {
      await toggleTask({ userId: user.id, taskId, completed, xp, profile });
      await queryClient.invalidateQueries({ queryKey: ["task-completions", user.id, day] });
      await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      if (!completed) toast.success(`+${xp} XP`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the task.");
    }
  }

  const firstName = (profile?.full_name ?? "engineer").split(" ")[0];

  return (
    <>
      <PageHeader
        eyebrow={`System online · ${new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" })}`}
        title={`Welcome back, ${firstName}`}
        description="One screen, one priority. Here's where your effort pays off most today."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Flame} label="Day streak" value={profile?.streak_count ?? 0} tone="accent" />
        <Stat icon={Trophy} label="Total XP" value={profile?.xp ?? 0} tone="primary" />
        <Stat icon={Check} label="Lessons done" value={lessonsDone} tone="success" />
        <Stat icon={ListTree} label="Problems solved" value={solvedCount} tone="primary" />
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="panel p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="label-mono text-primary">Today's Mission</p>
              <h2 className="mt-1 text-lg font-semibold">
                {missionDone} of {mission.length} complete
              </h2>
            </div>
            <Badge variant={missionDone === mission.length ? "default" : "outline"}>
              {missionDone === mission.length && mission.length > 0 ? "Mission complete" : "Active"}
            </Badge>
          </div>
          <Progress
            className="mt-4 h-1.5"
            value={mission.length ? (missionDone / mission.length) * 100 : 0}
          />

          <ul className="mt-5 space-y-2">
            {mission.map((task) => {
              const completed = doneIds.has(task.id);
              return (
                <li key={task.id}>
                  <button
                    type="button"
                    onClick={() => onToggle(task.id, task.xp, completed)}
                    aria-pressed={completed}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                      completed
                        ? "border-success/40 bg-success/10"
                        : "border-border hover:bg-surface",
                    )}
                  >
                    {completed ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                    ) : (
                      <Circle
                        className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                    <span className="flex-1">
                      <span
                        className={cn(
                          "block text-sm font-medium",
                          completed && "text-muted-foreground line-through",
                        )}
                      >
                        {task.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {task.description}
                      </span>
                    </span>
                    <span className="label-mono shrink-0 text-muted-foreground">
                      {task.est_minutes}m · {task.xp}xp
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <Button asChild variant="ghost" size="sm" className="mt-4">
            <Link to="/tasks">
              See all daily tasks
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="space-y-6">
          <div className="panel border-primary/30 bg-primary/5 p-6">
            <p className="label-mono flex items-center gap-2 text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Next best action
            </p>
            <h2 className="mt-3 text-lg font-semibold">{nextAction.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{nextAction.reason}</p>
            <Button asChild className="mt-4 w-full">
              {nextAction.params ? (
                <Link
                  to="/learn/$courseSlug"
                  params={{ courseSlug: nextAction.params["courseSlug"]! }}
                >
                  {nextAction.cta}
                </Link>
              ) : (
                <Link to={nextAction.to}>{nextAction.cta}</Link>
              )}
            </Button>
          </div>

          <div className="panel p-6">
            <p className="label-mono flex items-center gap-2 text-muted-foreground">
              <Target className="h-3.5 w-3.5" aria-hidden="true" />
              Your setup
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Branch</dt>
                <dd className="font-medium uppercase">{profile?.branch_slug ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Year</dt>
                <dd className="font-medium">{profile?.academic_year ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Goal</dt>
                <dd className="font-medium">{profile?.career_goal ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Profile</dt>
                <dd className="font-medium">{profile?.visibility ?? "private"}</dd>
              </div>
            </dl>
            <Button asChild variant="outline" size="sm" className="mt-4 w-full">
              <Link to="/profile">Edit profile & privacy</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-6 panel p-6">
        <h2 className="text-lg font-semibold">Continue learning</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tracks matched to your branch and goal. Progress is saved per lesson.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {courses.slice(0, 6).map((course) => (
            <Link
              key={course.id}
              to="/learn/$courseSlug"
              params={{ courseSlug: course.slug }}
              className="rounded-lg border border-border p-4 transition-colors hover:bg-surface"
            >
              <span className="label-mono text-primary">{course.track}</span>
              <span className="mt-2 block text-sm font-medium">{course.title}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{course.summary}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Flame;
  label: string;
  value: number;
  tone: "primary" | "accent" | "success";
}) {
  const toneClass =
    tone === "accent" ? "text-accent" : tone === "success" ? "text-success" : "text-primary";
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <p className="label-mono text-muted-foreground">{label}</p>
        <Icon className={cn("h-4 w-4", toneClass)} aria-hidden="true" />
      </div>
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}
