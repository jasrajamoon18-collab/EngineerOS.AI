import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import {
  aptitudeAttemptsQuery,
  certificationPlansQuery,
  communicationEntriesQuery,
  dsaProblemsQuery,
  dsaProgressQuery,
  interviewAnswersQuery,
  jobApplicationsQuery,
  lessonProgressQuery,
  profileQuery,
  resumesQuery,
  skillRatingsQuery,
  userProjectsQuery,
} from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({
    meta: [
      { title: "Insights — EngineerOS" },
      {
        name: "description",
        content:
          "A transparent readout of your own activity across learning, practice, projects and placement prep.",
      },
      { property: "og:title", content: "Insights — EngineerOS" },
      { property: "og:description", content: "Your activity across every EngineerOS module." },
    ],
  }),
  component: InsightsPage,
});

type Row = {
  label: string;
  value: number;
  target: number;
  detail: string;
  to: string;
};

function InsightsPage() {
  const { user } = useAuth();
  const { data: profile } = useQuery(profileQuery(user?.id));
  const { data: lessonProgress = [] } = useQuery(lessonProgressQuery(user?.id));
  const { data: problems = [] } = useQuery(dsaProblemsQuery());
  const { data: dsaProgress = [] } = useQuery(dsaProgressQuery(user?.id));
  const { data: projectData } = useQuery(userProjectsQuery(user?.id));
  const { data: resumes = [] } = useQuery(resumesQuery(user?.id));
  const { data: skillRatings = [] } = useQuery(skillRatingsQuery(user?.id));
  const { data: interviewAnswers = [] } = useQuery(interviewAnswersQuery(user?.id));
  const { data: communicationEntries = [] } = useQuery(communicationEntriesQuery(user?.id));
  const { data: applications = [] } = useQuery(jobApplicationsQuery(user?.id));
  const { data: aptitudeAttempts = [] } = useQuery(aptitudeAttemptsQuery(user?.id));
  const { data: certificationPlans = [] } = useQuery(certificationPlansQuery(user?.id));

  const lessonsDone = lessonProgress.filter((p) => p.status === "completed").length;
  const solved = dsaProgress.filter((p) => p.status === "solved").length;
  const projects = projectData?.projects ?? [];
  const milestones = projectData?.milestones ?? [];
  const openMilestones = milestones.filter((m) => !m.is_done).length;
  const aptitudeCorrect = aptitudeAttempts.filter((a) => a.is_correct).length;
  const aptitudeAccuracy = aptitudeAttempts.length
    ? Math.round((aptitudeCorrect / aptitudeAttempts.length) * 100)
    : 0;
  const interviewsInPipeline = applications.filter((a) =>
    ["assessment", "interview", "offer"].includes(a.status),
  ).length;

  const rows: Row[] = [
    {
      label: "Lessons completed",
      value: lessonsDone,
      target: 20,
      detail: "Counts lessons you marked complete in the learning library.",
      to: "/learn",
    },
    {
      label: "DSA problems solved",
      value: solved,
      target: Math.max(problems.length, 1),
      detail: "Counts problems you set to “solved” yourself.",
      to: "/dsa",
    },
    {
      label: "Projects registered",
      value: projects.length,
      target: 3,
      detail: `${openMilestones} milestone${openMilestones === 1 ? "" : "s"} still open.`,
      to: "/projects",
    },
    {
      label: "Skills self-rated",
      value: skillRatings.length,
      target: 15,
      detail: "Drives the Skill Gap Analyzer. These are your own ratings, not tests.",
      to: "/skills",
    },
    {
      label: "Mock interview answers",
      value: interviewAnswers.length,
      target: 10,
      detail: "Answers you wrote and stored, checked against a published rubric.",
      to: "/interview",
    },
    {
      label: "Communication drills",
      value: communicationEntries.length,
      target: 10,
      detail: "Written drills with rule-based feedback on clarity and structure.",
      to: "/communication",
    },
    {
      label: "Aptitude questions attempted",
      value: aptitudeAttempts.length,
      target: 30,
      detail: `${aptitudeAccuracy}% of your attempts were correct.`,
      to: "/aptitude",
    },
    {
      label: "Applications logged",
      value: applications.length,
      target: 10,
      detail: `${interviewsInPipeline} at assessment stage or beyond.`,
      to: "/jobs",
    },
    {
      label: "Certifications planned",
      value: certificationPlans.length,
      target: 3,
      detail: "Plans you created for external credentials.",
      to: "/certifications",
    },
    {
      label: "Resumes saved",
      value: resumes.length,
      target: 1,
      detail: "Needed before the ATS analyzer can review anything.",
      to: "/resume",
    },
  ];

  const weakest = [...rows].sort((a, b) => a.value / a.target - b.value / b.target).slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow="Analytics"
        title="Insights"
        description="Everything below is counted from your own activity. No estimates, no hidden model, no comparison to other students."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="panel p-4">
          <p className="label-mono text-muted-foreground">Total XP</p>
          <p className="mt-1 text-2xl font-semibold">{profile?.xp ?? 0}</p>
        </div>
        <div className="panel p-4">
          <p className="label-mono text-muted-foreground">Day streak</p>
          <p className="mt-1 text-2xl font-semibold">{profile?.streak_count ?? 0}</p>
        </div>
        <div className="panel p-4">
          <p className="label-mono text-muted-foreground">Modules with activity</p>
          <p className="mt-1 text-2xl font-semibold">
            {rows.filter((row) => row.value > 0).length}/{rows.length}
          </p>
        </div>
      </div>

      <Alert className="mb-8">
        <AlertTitle>How to read this</AlertTitle>
        <AlertDescription>
          Targets are study suggestions we chose, not employer requirements or a readiness score.
          Nothing here predicts hiring outcomes.
        </AlertDescription>
      </Alert>

      <section className="mb-10" aria-labelledby="focus">
        <h2 id="focus" className="label-mono mb-3 text-primary">
          Thinnest areas right now
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {weakest.map((row) => (
            <Link key={row.label} to={row.to} className="panel p-4 transition-colors hover:bg-muted/40">
              <p className="text-sm font-medium">{row.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{row.detail}</p>
              <Badge variant="outline" className="label-mono mt-3">
                {row.value}/{row.target}
              </Badge>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="all-metrics">
        <h2 id="all-metrics" className="label-mono mb-3 text-primary">
          Full readout
        </h2>
        <ul className="space-y-4">
          {rows.map((row) => (
            <li key={row.label} className="panel p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">{row.label}</p>
                <p className="label-mono text-muted-foreground">
                  {row.value} / {row.target} suggested
                </p>
              </div>
              <Progress
                className="mt-2 h-1.5"
                value={Math.min(100, (row.value / row.target) * 100)}
              />
              <p className="mt-2 text-xs text-muted-foreground">{row.detail}</p>
              <Link to={row.to} className="mt-2 inline-block text-xs text-primary underline">
                Open module
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
