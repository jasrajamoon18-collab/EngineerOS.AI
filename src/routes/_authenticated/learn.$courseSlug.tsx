import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Check, Clock, Circle, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Markdown } from "@/lib/markdown";
import { useAuth } from "@/hooks/useAuth";
import { courseDetailQuery, lessonProgressQuery, profileQuery } from "@/lib/queries";
import { completeLesson, reopenLesson } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/learn/$courseSlug")({
  head: () => ({
    meta: [
      { title: "Course player — EngineerOS" },
      {
        name: "description",
        content: "Work through lessons, mark them complete and track course progress.",
      },
      { property: "og:title", content: "Course player — EngineerOS" },
      {
        property: "og:description",
        content: "Lesson-by-lesson learning with progress tracking.",
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

  useEffect(() => {
    if (data?.lessons.length && !activeLessonId) setActiveLessonId(data.lessons[0]!.id);
  }, [data, activeLessonId]);

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
  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0];
  const completedCount = lessons.filter((lesson) => completedIds.has(lesson.id)).length;
  const isCompleted = activeLesson ? completedIds.has(activeLesson.id) : false;

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

        <article className="panel p-6">
          {activeLesson ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="label-mono">
                  {activeLesson.kind}
                </Badge>
                <span className="label-mono flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {activeLesson.est_minutes} min
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-bold">{activeLesson.title}</h2>
              <div className="mt-6">
                <Markdown content={activeLesson.content_md} />
              </div>
              <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
                <Button
                  onClick={toggleLesson}
                  disabled={busy}
                  variant={isCompleted ? "outline" : "default"}
                >
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isCompleted ? "Mark as not done" : "Mark lesson complete"}
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/mentor">Ask the AI Mentor about this</Link>
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
