import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { awardXp } from "@/lib/progress";
import { gitProgressQuery, gitTopicsQuery, profileQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/git")({
  head: () => ({
    meta: [
      { title: "Git & GitHub Hub — EngineerOS" },
      {
        name: "description",
        content:
          "Learn version control the way teams use it: commands, workflows and practice drills you run in your own terminal.",
      },
      { property: "og:title", content: "Git & GitHub Hub — EngineerOS" },
      { property: "og:description", content: "Commands, workflows and practice drills for Git." },
    ],
  }),
  component: GitHubHubPage,
});

type Command = { command: string; description: string };

function parseCommands(value: unknown): Command[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({
      command: String(item.command ?? ""),
      description: String(item.description ?? ""),
    }))
    .filter((item) => item.command);
}

function GitHubHubPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: topics = [] } = useQuery(gitTopicsQuery());
  const { data: progress = [] } = useQuery(gitProgressQuery(user?.id));
  const { data: profile } = useQuery(profileQuery(user?.id));

  const doneIds = new Set(progress.filter((p) => p.status === "done").map((p) => p.topic_id));
  const categories = [...new Set(topics.map((t) => t.category))];

  async function toggle(topicId: string) {
    if (!user) return;
    const isDone = doneIds.has(topicId);
    const { error } = await supabase.from("git_progress").upsert(
      { user_id: user.id, topic_id: topicId, status: isDone ? "todo" : "done" },
      { onConflict: "user_id,topic_id" },
    );
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!isDone) {
      await awardXp(user.id, profile, 10);
      await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success("+10 XP · topic marked learned");
    }
    await queryClient.invalidateQueries({ queryKey: ["git-progress", user.id] });
  }

  return (
    <>
      <PageHeader
        eyebrow="Workflow"
        title="Git & GitHub Hub"
        description="The version-control vocabulary interviewers assume you have — grouped by workflow, with a drill for each topic."
        actions={
          <div className="min-w-[200px]">
            <p className="label-mono text-muted-foreground">
              {doneIds.size}/{topics.length} topics learned
            </p>
            <Progress
              className="mt-2 h-1.5"
              value={topics.length ? (doneIds.size / topics.length) * 100 : 0}
            />
          </div>
        }
      />

      <Alert className="mb-8">
        <AlertTitle>No GitHub account is connected</AlertTitle>
        <AlertDescription>
          EngineerOS does not read your repositories, commits or contribution graph, and no terminal
          runs here. Drills are meant to be run in your own terminal; you mark your own progress.
        </AlertDescription>
      </Alert>

      <div className="space-y-10">
        {categories.map((category) => (
          <section key={category} aria-labelledby={`cat-${category}`}>
            <h2 id={`cat-${category}`} className="label-mono mb-3 text-primary">
              {category}
            </h2>
            <ul className="space-y-4">
              {topics
                .filter((topic) => topic.category === category)
                .map((topic) => {
                  const done = doneIds.has(topic.id);
                  const commands = parseCommands(topic.commands);
                  return (
                    <li key={topic.id} className="panel p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold">{topic.title}</h3>
                        <Badge variant="outline" className="label-mono">
                          {topic.level}
                        </Badge>
                        {done ? (
                          <Badge variant="secondary" className="label-mono">
                            learned
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{topic.summary}</p>

                      {commands.length ? (
                        <dl className="mt-3 space-y-2">
                          {commands.map((item) => (
                            <div key={item.command} className="rounded-md bg-muted p-3">
                              <dt className="font-mono text-xs">{item.command}</dt>
                              <dd className="mt-1 text-xs text-muted-foreground">
                                {item.description}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      ) : null}

                      {topic.practice ? (
                        <p className="mt-3 text-sm">
                          <span className="label-mono text-accent">Drill · </span>
                          {topic.practice}
                        </p>
                      ) : null}

                      <Button
                        className="mt-4"
                        size="sm"
                        variant={done ? "outline" : "default"}
                        aria-pressed={done}
                        onClick={() => toggle(topic.id)}
                      >
                        {done ? "Mark as not learned" : "Mark as learned"}
                      </Button>
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
