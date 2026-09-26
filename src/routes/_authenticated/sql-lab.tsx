import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { awardXp } from "@/lib/progress";
import { profileQuery, sqlAttemptsQuery, sqlExercisesQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/sql-lab")({
  head: () => ({
    meta: [
      { title: "SQL Lab — EngineerOS" },
      {
        name: "description",
        content:
          "Practise SQL against realistic schemas, save your queries and self-check against reference solutions.",
      },
      { property: "og:title", content: "SQL Lab — EngineerOS" },
      { property: "og:description", content: "Schema, prompt, your query, reference solution." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SqlLabPage,
});

const STATUSES = ["todo", "attempted", "solved"] as const;

function SqlLabPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: exercises = [] } = useQuery(sqlExercisesQuery());
  const { data: attempts = [] } = useQuery(sqlAttemptsQuery(user?.id));
  const { data: profile } = useQuery(profileQuery(user?.id));
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const attemptFor = (id: string) => attempts.find((a) => a.exercise_id === id);
  const solved = exercises.filter((e) => attemptFor(e.id)?.status === "solved").length;

  async function save(exerciseId: string, status: (typeof STATUSES)[number]) {
    if (!user) return;
    const existing = attemptFor(exerciseId);
    const queryText = drafts[exerciseId] ?? existing?.query_text ?? "";
    const { error } = await supabase
      .from("sql_attempts")
      .upsert(
        { user_id: user.id, exercise_id: exerciseId, query_text: queryText, status },
        { onConflict: "user_id,exercise_id" },
      );
    if (error) {
      toast.error(error.message);
      return;
    }
    if (status === "solved" && existing?.status !== "solved") {
      await awardXp(user.id, profile, 25);
      await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success("+25 XP · exercise solved");
    } else {
      toast.success("Query saved.");
    }
    await queryClient.invalidateQueries({ queryKey: ["sql-attempts", user.id] });
  }

  return (
    <>
      <PageHeader
        eyebrow="Lab"
        title="SQL Lab"
        description="Read the schema, write the query, then compare it against the reference solution."
        actions={
          <div className="min-w-[200px]">
            <p className="label-mono text-muted-foreground">
              {solved}/{exercises.length} solved
            </p>
            <Progress
              className="mt-2 h-1.5"
              value={exercises.length ? (solved / exercises.length) * 100 : 0}
            />
          </div>
        }
      />

      <Alert className="mb-8">
        <AlertTitle>Queries are not executed</AlertTitle>
        <AlertDescription>
          EngineerOS has no SQL engine wired to this lab, so your query is stored, never run. Check
          your work against the reference solution and expected output, and mark your own status.
        </AlertDescription>
      </Alert>

      <ul className="space-y-4">
        {exercises.map((exercise) => {
          const attempt = attemptFor(exercise.id);
          const status = attempt?.status ?? "todo";
          return (
            <li key={exercise.id} className="panel p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold">{exercise.title}</h2>
                <Badge
                  variant="outline"
                  className={cn(
                    "label-mono",
                    exercise.level === "beginner" && "text-success",
                    exercise.level === "intermediate" && "text-accent",
                    exercise.level === "advanced" && "text-destructive",
                  )}
                >
                  {exercise.level}
                </Badge>
                <Badge variant="secondary" className="label-mono capitalize">
                  {status}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{exercise.scenario}</p>
              <p className="mt-2 text-sm font-medium">{exercise.prompt}</p>

              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-muted-foreground">Schema</summary>
                <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
                  {exercise.schema_sql}
                </pre>
              </details>

              <div className="mt-3 space-y-2">
                <label className="label-mono text-muted-foreground" htmlFor={`q-${exercise.id}`}>
                  Your query
                </label>
                <Textarea
                  id={`q-${exercise.id}`}
                  rows={6}
                  spellCheck={false}
                  className="font-mono text-sm"
                  value={drafts[exercise.id] ?? attempt?.query_text ?? ""}
                  onChange={(event) =>
                    setDrafts((prev) => ({ ...prev, [exercise.id]: event.target.value }))
                  }
                  placeholder="SELECT ..."
                />
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Expected output &amp; reference solution
                </summary>
                <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
                  {exercise.expected_result}
                </pre>
                <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
                  {exercise.solution_sql}
                </pre>
              </details>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => save(exercise.id, "attempted")}>
                  Save as attempted
                </Button>
                <Button size="sm" onClick={() => save(exercise.id, "solved")}>
                  Mark solved
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
