import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { dsaProblemsQuery, dsaProgressQuery, profileQuery } from "@/lib/queries";
import { setDsaStatus } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dsa")({
  head: () => ({
    meta: [
      { title: "DSA practice — EngineerOS" },
      {
        name: "description",
        content: "A curated data structures and algorithms sheet with per-problem status tracking.",
      },
      { property: "og:title", content: "DSA practice — EngineerOS" },
      { property: "og:description", content: "Track attempted and solved problems by topic." },
    ],
  }),
  component: DsaPage,
});

const statuses = ["todo", "attempted", "solved"] as const;

function DsaPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState<string>("all");
  const { data: problems = [] } = useQuery(dsaProblemsQuery());
  const { data: progress = [] } = useQuery(dsaProgressQuery(user?.id));
  const { data: profile } = useQuery(profileQuery(user?.id));

  const statusOf = (id: string) =>
    (progress.find((p) => p.problem_id === id)?.status ?? "todo") as (typeof statuses)[number];

  const topics = ["all", ...Array.from(new Set(problems.map((p) => p.topic)))];
  const visible = topic === "all" ? problems : problems.filter((p) => p.topic === topic);
  const solved = problems.filter((p) => statusOf(p.id) === "solved").length;

  async function update(problemId: string, status: (typeof statuses)[number]) {
    if (!user) return;
    const previousStatus = statusOf(problemId);
    if (previousStatus === status) return;
    try {
      await setDsaStatus({ userId: user.id, problemId, status, profile, previousStatus });
      await queryClient.invalidateQueries({ queryKey: ["dsa-progress", user.id] });
      await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      if (status === "solved" && previousStatus !== "solved") toast.success("+30 XP · solved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your status.");
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Practice"
        title="DSA practice"
        description="Track your own progress honestly. Statuses are yours alone — nothing is auto-graded and no code is executed here."
        actions={
          <div className="min-w-[200px]">
            <p className="label-mono text-muted-foreground">
              {solved}/{problems.length} solved
            </p>
            <Progress
              className="mt-2 h-1.5"
              value={problems.length ? (solved / problems.length) * 100 : 0}
            />
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
        {topics.map((item) => (
          <Button
            key={item}
            size="sm"
            variant={topic === item ? "default" : "outline"}
            onClick={() => setTopic(item)}
            aria-pressed={topic === item}
            className="capitalize"
          >
            {item}
          </Button>
        ))}
      </div>

      <ul className="space-y-3">
        {visible.map((problem) => {
          const status = statusOf(problem.id);
          return (
            <li key={problem.id} className="panel p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-[220px] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold">{problem.title}</h2>
                    <Badge
                      variant="outline"
                      className={cn(
                        "label-mono",
                        problem.level === "beginner" && "text-success",
                        problem.level === "intermediate" && "text-accent",
                        problem.level === "advanced" && "text-destructive",
                      )}
                    >
                      {problem.level}
                    </Badge>
                    <Badge variant="secondary" className="label-mono capitalize">
                      {problem.topic}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{problem.statement}</p>
                  {problem.hint ? (
                    <details className="mt-2">
                      <summary className="label-mono cursor-pointer text-primary">Hint</summary>
                      <p className="mt-1 text-xs text-muted-foreground">{problem.hint}</p>
                    </details>
                  ) : null}
                </div>
                <div
                  className="flex gap-1"
                  role="group"
                  aria-label={`Status for ${problem.title}`}
                >
                  {statuses.map((option) => (
                    <Button
                      key={option}
                      size="sm"
                      variant={status === option ? "default" : "ghost"}
                      aria-pressed={status === option}
                      onClick={() => update(problem.id, option)}
                      className="capitalize"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
