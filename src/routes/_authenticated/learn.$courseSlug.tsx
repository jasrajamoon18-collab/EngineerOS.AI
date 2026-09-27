import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  Clock,
  Circle,
  Code2,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonacoCodeEditor } from "@/components/monaco-code-editor";
import { CodeVerdictCard } from "@/components/code-verdict-card";
import { Markdown } from "@/lib/markdown";
import { useAuth } from "@/hooks/useAuth";
import { courseDetailQuery, lessonProgressQuery, profileQuery } from "@/lib/queries";
import { completeLesson, reopenLesson } from "@/lib/progress";
import {
  evaluateTestCases,
  executeCode,
  type EvaluationResult,
  type RunResult,
} from "@/lib/code-runner";
import { getLessonChallenge } from "@/lib/lesson-challenge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/learn/$courseSlug")({
  head: () => ({
    meta: [
      { title: "Course Player & In-Browser Code Lab — EngineerOS" },
      {
        name: "description",
        content:
          "Work through lessons with interactive Try It and Solve modes, Monaco code editor, and live sandbox execution.",
      },
      { property: "og:title", content: "Course Player — EngineerOS" },
      {
        property: "og:description",
        content: "Lesson-by-lesson learning with hands-on coding and progress tracking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CoursePage,
});

function CoursePage() {
  const { courseSlug } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(courseDetailQuery(courseSlug));
  const { data: progress = [] } = useQuery(lessonProgressQuery(user?.id));
  const { data: profile } = useQuery(profileQuery(user?.id));
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Coding sandbox states
  const [sandboxMode, setSandboxMode] = useState<"try" | "solve">("try");
  const [tryCode, setTryCode] = useState<string>("");
  const [solveCode, setSolveCode] = useState<string>("");
  const [runningTry, setRunningTry] = useState(false);
  const [runningSolve, setRunningSolve] = useState(false);
  const [tryResult, setTryResult] = useState<RunResult | null>(null);
  const [solveResult, setSolveResult] = useState<EvaluationResult | null>(null);

  useEffect(() => {
    if (data?.lessons.length && !activeLessonId) setActiveLessonId(data.lessons[0]!.id);
  }, [data, activeLessonId]);

  const activeLesson =
    data?.lessons.find((lesson) => lesson.id === activeLessonId) ?? data?.lessons[0];

  // Initialize sandbox code when active lesson changes
  useEffect(() => {
    if (activeLesson && courseSlug) {
      const challenge = getLessonChallenge(activeLesson.id, courseSlug, activeLesson.title);
      setTryCode(challenge.tryItCode);
      setSolveCode(challenge.solveStarterCode);
      setTryResult(null);
      setSolveResult(null);
    }
  }, [activeLesson?.id, courseSlug]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading course…</p>;
  }
  if (!data) {
    return (
      <div className="panel p-8 text-center">
        <h1 className="text-lg font-semibold">Course not found</h1>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/learn">Back to library</Link>
        </Button>
      </div>
    );
  }

  const { course, modules, lessons } = data;
  const completedIds = new Set(
    progress.filter((p) => p.status === "completed").map((p) => p.lesson_id),
  );
  const completedCount = lessons.filter((lesson) => completedIds.has(lesson.id)).length;
  const isCompleted = activeLesson ? completedIds.has(activeLesson.id) : false;
  const currentChallenge = activeLesson
    ? getLessonChallenge(activeLesson.id, courseSlug, activeLesson.title)
    : null;

  async function toggleLesson() {
    if (!user || !activeLesson) return;
    setBusy(true);
    try {
      if (isCompleted) {
        await reopenLesson(user.id, activeLesson.id);
      } else {
        await completeLesson({
          userId: user.id,
          lessonId: activeLesson.id,
          courseId: course.id,
          profile,
        });
        toast.success("+20 XP · lesson complete");
      }
      await queryClient.invalidateQueries({ queryKey: ["lesson-progress", user.id] });
      await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save progress.");
    } finally {
      setBusy(false);
    }
  }

  // Handle running Try It code
  const handleRunTry = async () => {
    if (!currentChallenge) return;
    setRunningTry(true);
    try {
      const res = await executeCode(currentChallenge.language, tryCode);
      setTryResult(res);
      toast.info(`Execution completed (${res.durationMs}ms)`);
    } catch {
      toast.error("Execution failed. Check code or network.");
    } finally {
      setRunningTry(false);
    }
  };

  // Handle running Solve Challenge code against test cases
  const handleRunSolve = async () => {
    if (!currentChallenge) return;
    setRunningSolve(true);
    try {
      toast.loading("Evaluating challenge against test cases...", { id: "lesson-solve" });
      const res = await evaluateTestCases(
        currentChallenge.language,
        solveCode,
        currentChallenge.testCases,
      );
      setSolveResult(res);
      toast.dismiss("lesson-solve");

      if (res.verdict === "Accepted") {
        toast.success("🎉 Challenge Passed! All test cases succeeded!");
        if (!isCompleted && user && activeLesson) {
          await completeLesson({
            userId: user.id,
            lessonId: activeLesson.id,
            courseId: course.id,
            profile,
          });
          await queryClient.invalidateQueries({ queryKey: ["lesson-progress", user.id] });
          await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
          toast.success("+20 XP · lesson marked completed automatically!");
        }
      } else {
        toast.error(`Verdict: ${res.verdict} (${res.passedCount}/${res.totalCount} passed)`);
      }
    } catch {
      toast.dismiss("lesson-solve");
      toast.error("Execution error. Please check your implementation.");
    } finally {
      setRunningSolve(false);
    }
  };

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/learn">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Library
        </Link>
      </Button>

      <PageHeader
        eyebrow={`${course.track} · ${course.level}`}
        title={course.title}
        description={course.description ?? course.summary ?? ""}
        actions={
          <div className="min-w-[180px]">
            <p className="label-mono text-muted-foreground">
              {completedCount}/{lessons.length} lessons
            </p>
            <Progress
              className="mt-2 h-1.5"
              value={lessons.length ? (completedCount / lessons.length) * 100 : 0}
            />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <nav className="panel h-fit p-4" aria-label="Course contents">
          {modules.map((module) => (
            <div key={module.id} className="mb-5 last:mb-0">
              <p className="label-mono px-2 text-muted-foreground">{module.title}</p>
              <ul className="mt-2 space-y-1">
                {lessons
                  .filter((lesson) => lesson.module_id === module.id)
                  .map((lesson) => {
                    const done = completedIds.has(lesson.id);
                    const active = lesson.id === activeLesson?.id;
                    return (
                      <li key={lesson.id}>
                        <button
                          type="button"
                          onClick={() => setActiveLessonId(lesson.id)}
                          aria-current={active ? "true" : undefined}
                          className={cn(
                            "flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
                            active ? "bg-primary/10 text-foreground" : "hover:bg-surface",
                          )}
                        >
                          {done ? (
                            <Check
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success"
                              aria-hidden="true"
                            />
                          ) : (
                            <Circle
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                              aria-hidden="true"
                            />
                          )}
                          <span className="flex-1">{lesson.title}</span>
                          <span className="label-mono text-muted-foreground">
                            {lesson.est_minutes}m
                          </span>
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </nav>

        <article className="panel p-6 space-y-6">
          {activeLesson ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="label-mono">
                    {activeLesson.kind}
                  </Badge>
                  <span className="label-mono flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {activeLesson.est_minutes} min
                  </span>
                </div>

                {isCompleted && (
                  <Badge className="bg-emerald-600 text-white flex items-center gap-1 text-xs">
                    <Check className="h-3.5 w-3.5" /> Completed
                  </Badge>
                )}
              </div>

              <h2 className="text-2xl font-bold">{activeLesson.title}</h2>

              {/* Lesson Text */}
              <div className="prose dark:prose-invert max-w-none">
                <Markdown content={activeLesson.content_md} />
              </div>

              {/* Interactive In-Browser Code Execution Section ("Try it" & "Solve" Modes) */}
              {currentChallenge && (
                <div className="rounded-xl border border-border bg-card/60 p-4 sm:p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="text-sm font-semibold">Interactive Code Lab</h3>
                        <p className="text-xs text-muted-foreground">
                          Execute in {currentChallenge.language.toUpperCase()} with Monaco &
                          sandboxed execution
                        </p>
                      </div>
                    </div>

                    <Tabs
                      value={sandboxMode}
                      onValueChange={(v) => setSandboxMode(v as "try" | "solve")}
                    >
                      <TabsList className="h-8">
                        <TabsTrigger value="try" className="text-xs px-3">
                          <Play className="h-3 w-3 mr-1.5" /> Try It
                        </TabsTrigger>
                        <TabsTrigger value="solve" className="text-xs px-3">
                          <Sparkles className="h-3 w-3 mr-1.5" /> Solve Challenge
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {sandboxMode === "try" ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Experiment with lesson concepts and run live code:</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setTryCode(currentChallenge.tryItCode)}
                          className="h-6 text-xs"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" /> Reset
                        </Button>
                      </div>

                      <MonacoCodeEditor
                        value={tryCode}
                        onChange={setTryCode}
                        language={currentChallenge.language}
                        onRun={handleRunTry}
                        isRunning={runningTry}
                        runButtonLabel="Run Code"
                        height="260px"
                        defaultStarter={currentChallenge.tryItCode}
                      />

                      {tryResult && (
                        <CodeVerdictCard runResult={tryResult} onRunAgain={handleRunTry} />
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-md bg-muted/40 p-3 text-xs space-y-1">
                        <span className="font-semibold text-primary">Challenge Task:</span>
                        <p className="text-muted-foreground">{currentChallenge.solvePrompt}</p>
                        <span className="text-[11px] text-muted-foreground">
                          Passing all test cases will automatically mark this lesson complete and
                          award +20 XP.
                        </span>
                      </div>

                      <MonacoCodeEditor
                        value={solveCode}
                        onChange={setSolveCode}
                        language={currentChallenge.language}
                        onRun={handleRunSolve}
                        isRunning={runningSolve}
                        runButtonLabel="Submit Challenge"
                        height="280px"
                        defaultStarter={currentChallenge.solveStarterCode}
                      />

                      {solveResult && (
                        <CodeVerdictCard evaluation={solveResult} onRunAgain={handleRunSolve} />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Lesson Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
                <Button
                  onClick={toggleLesson}
                  disabled={busy}
                  variant={isCompleted ? "outline" : "default"}
                >
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isCompleted ? "Mark as not done" : "Mark lesson complete (+20 XP)"}
                </Button>

                <Button asChild variant="ghost">
                  <Link to="/mentor">Ask AI Mentor about this lesson →</Link>
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">This course has no lessons yet.</p>
          )}
        </article>
      </div>
    </>
  );
}
