import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Circle, Flame } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { dailyTasksQuery, profileQuery, taskCompletionsQuery, todayISO } from "@/lib/queries";
import { toggleTask } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [
      { title: "Daily tasks — EngineerOS" },
      {
        name: "description",
        content: "Small daily engineering habits that compound into a hireable profile.",
      },
      { property: "og:title", content: "Daily tasks — EngineerOS" },
      { property: "og:description", content: "Build your streak with finishable daily work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const day = todayISO();
  const { data: tasks = [] } = useQuery(dailyTasksQuery());
  const { data: completions = [] } = useQuery(taskCompletionsQuery(user?.id, day));
  const { data: profile } = useQuery(profileQuery(user?.id));

  const doneIds = new Set(completions.map((c) => c.task_id));
  const done = tasks.filter((t) => doneIds.has(t.id)).length;
  const tracks = Array.from(new Set(tasks.map((t) => t.track)));

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

  return (
    <>
      <PageHeader
        eyebrow="Habits"
        title="Daily tasks"
        description="Completions reset every day. Consistency here is what moves your streak and XP."
        actions={
          <div className="min-w-[200px]">
            <p className="label-mono flex items-center gap-2 text-muted-foreground">
              <Flame className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              {profile?.streak_count ?? 0} day streak · {done}/{tasks.length} today
            </p>
            <Progress
              className="mt-2 h-1.5"
              value={tasks.length ? (done / tasks.length) * 100 : 0}
            />
          </div>
        }
      />

      <div className="space-y-8">
        {tracks.map((track) => (
          <section key={track}>
            <h2 className="label-mono mb-3 text-primary capitalize">{track}</h2>
            <ul className="space-y-2">
              {tasks
                .filter((task) => task.track === track)
                .map((task) => {
                  const completed = doneIds.has(task.id);
                  return (
                    <li key={task.id}>
                      <button
                        type="button"
                        onClick={() => onToggle(task.id, task.xp, completed)}
                        aria-pressed={completed}
                        className={cn(
                          "panel flex w-full items-start gap-3 p-4 text-left transition-colors",
                          completed ? "border-success/40 bg-success/10" : "hover:bg-surface",
                        )}
                      >
                        {completed ? (
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-success"
                            aria-hidden="true"
                          />
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
                        <Badge variant="outline" className="label-mono shrink-0">
                          {task.est_minutes}m · {task.xp}xp
                        </Badge>
                      </button>
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
