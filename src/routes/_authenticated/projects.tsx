import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { awardXp } from "@/lib/progress";
import { profileQuery, projectIdeasQuery, userProjectsQuery } from "@/lib/queries";
import type { ProjectIdea, UserProject } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({
    meta: [
      { title: "Project Lab — EngineerOS" },
      {
        name: "description",
        content:
          "Discover engineering project ideas, start your own build and track milestones to completion.",
      },
      { property: "og:title", content: "Project Lab — EngineerOS" },
      {
        property: "og:description",
        content: "Project discovery plus milestone tracking for real builds.",
      },
    ],
  }),
  component: ProjectLabPage,
});

const STATUSES = ["planned", "building", "shipped"] as const;

function ProjectLabPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: ideas = [] } = useQuery(projectIdeasQuery());
  const { data: mine } = useQuery(userProjectsQuery(user?.id));
  const { data: profile } = useQuery(profileQuery(user?.id));
  const projects = mine?.projects ?? [];
  const milestones = mine?.milestones ?? [];

  const [form, setForm] = useState({ title: "", summary: "", tech: "" });
  const [busy, setBusy] = useState(false);
  const [milestoneDraft, setMilestoneDraft] = useState<Record<string, string>>({});

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["user-projects", user?.id] });

  async function createProject(payload: {
    title: string;
    summary: string;
    tech: string[];
    ideaId?: string | null;
    suggested?: string[];
  }) {
    if (!user) return;
    if (!payload.title.trim()) {
      toast.error("Give the project a title first.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase
      .from("user_projects")
      .insert({
        user_id: user.id,
        idea_id: payload.ideaId ?? null,
        title: payload.title.trim(),
        summary: payload.summary.trim() || "No summary yet.",
        tech_stack: payload.tech,
      })
      .select("id")
      .maybeSingle();
    setBusy(false);
    if (error || !data) {
      toast.error(error?.message ?? "Could not create the project.");
      return;
    }
    if (payload.suggested?.length) {
      await supabase.from("project_milestones").insert(
        payload.suggested.map((title, index) => ({
          user_id: user.id,
          project_id: data.id,
          title,
          order_index: index,
        })),
      );
    }
    setForm({ title: "", summary: "", tech: "" });
    await refresh();
    toast.success("Project created.");
  }

  async function startFromIdea(idea: ProjectIdea) {
    await createProject({
      title: idea.title,
      summary: idea.summary,
      tech: idea.skills ?? [],
      ideaId: idea.id,
      suggested: idea.suggested_milestones ?? [],
    });
  }

  async function updateProject(id: string, patch: Partial<UserProject>) {
    const { error } = await supabase.from("user_projects").update(patch).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refresh();
  }

  async function deleteProject(id: string) {
    const { error } = await supabase.from("user_projects").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refresh();
    toast.success("Project removed.");
  }

  async function addMilestone(projectId: string) {
    if (!user) return;
    const title = (milestoneDraft[projectId] ?? "").trim();
    if (!title) return;
    const count = milestones.filter((m) => m.project_id === projectId).length;
    const { error } = await supabase
      .from("project_milestones")
      .insert({ user_id: user.id, project_id: projectId, title, order_index: count });
    if (error) {
      toast.error(error.message);
      return;
    }
    setMilestoneDraft((prev) => ({ ...prev, [projectId]: "" }));
    await refresh();
  }

  async function toggleMilestone(id: string, isDone: boolean) {
    if (!user) return;
    const { error } = await supabase
      .from("project_milestones")
      .update({ is_done: !isDone })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!isDone) {
      await awardXp(user.id, profile, 15);
      await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success("+15 XP · milestone done");
    }
    await refresh();
  }

  async function deleteMilestone(id: string) {
    const { error } = await supabase.from("project_milestones").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refresh();
  }

  return (
    <>
      <PageHeader
        eyebrow="Build"
        title="Project Lab"
        description="Pick a brief from the catalogue or register your own build, then break it into milestones you actually tick off."
      />

      <Alert className="mb-8">
        <AlertTitle>Milestones are self-reported</AlertTitle>
        <AlertDescription>
          EngineerOS is not connected to GitHub or any CI service, so nothing here is verified
          automatically. Repository and live links are stored as plain references you control.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="mine">
        <TabsList>
          <TabsTrigger value="mine">My projects ({projects.length})</TabsTrigger>
          <TabsTrigger value="discover">Discover ideas ({ideas.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="mine" className="mt-6 space-y-6">
          <section className="panel p-4" aria-labelledby="new-project">
            <h2 id="new-project" className="text-sm font-semibold">
              Register a new project
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="p-title">Title</Label>
                <Input
                  id="p-title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Campus attendance tracker"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-tech">Tech stack (comma separated)</Label>
                <Input
                  id="p-tech"
                  value={form.tech}
                  onChange={(e) => setForm((f) => ({ ...f, tech: e.target.value }))}
                  placeholder="React, Postgres"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="p-summary">Summary</Label>
                <Textarea
                  id="p-summary"
                  value={form.summary}
                  onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                  placeholder="What problem does it solve, and for whom?"
                />
              </div>
            </div>
            <Button
              className="mt-4"
              disabled={busy}
              onClick={() =>
                createProject({
                  title: form.title,
                  summary: form.summary,
                  tech: form.tech
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Create project
            </Button>
          </section>

          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No projects yet. Register one above or start from a brief in Discover ideas.
            </p>
          ) : null}

          {projects.map((project) => {
            const items = milestones.filter((m) => m.project_id === project.id);
            const done = items.filter((m) => m.is_done).length;
            return (
              <article key={project.id} className="panel p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold">{project.title}</h3>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                      {project.summary}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${project.title}`}
                    onClick={() => deleteProject(project.id)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {STATUSES.map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={project.status === status ? "default" : "outline"}
                      aria-pressed={project.status === status}
                      onClick={() => updateProject(project.id, { status })}
                    >
                      {status}
                    </Button>
                  ))}
                  {(project.tech_stack ?? []).map((tech) => (
                    <Badge key={tech} variant="secondary" className="label-mono">
                      {tech}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`repo-${project.id}`}>Repository URL</Label>
                    <Input
                      id={`repo-${project.id}`}
                      defaultValue={project.repo_url ?? ""}
                      placeholder="https://github.com/you/project"
                      onBlur={(e) =>
                        updateProject(project.id, { repo_url: e.target.value.trim() || null })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`live-${project.id}`}>Live URL</Label>
                    <Input
                      id={`live-${project.id}`}
                      defaultValue={project.live_url ?? ""}
                      placeholder="https://project.example.com"
                      onBlur={(e) =>
                        updateProject(project.id, { live_url: e.target.value.trim() || null })
                      }
                    />
                  </div>
                </div>

                <label className="mt-4 flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={project.show_in_portfolio}
                    onCheckedChange={(checked) =>
                      updateProject(project.id, { show_in_portfolio: checked === true })
                    }
                  />
                  Show on my public portfolio page
                </label>

                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <p className="label-mono text-muted-foreground">
                      Milestones {done}/{items.length}
                    </p>
                  </div>
                  <Progress
                    className="mt-2 h-1.5"
                    value={items.length ? (done / items.length) * 100 : 0}
                  />
                  <ul className="mt-3 space-y-2">
                    {items.map((milestone) => (
                      <li key={milestone.id} className="flex items-center gap-3">
                        <Checkbox
                          id={`ms-${milestone.id}`}
                          checked={milestone.is_done}
                          onCheckedChange={() => toggleMilestone(milestone.id, milestone.is_done)}
                        />
                        <label
                          htmlFor={`ms-${milestone.id}`}
                          className={
                            milestone.is_done
                              ? "flex-1 text-sm text-muted-foreground line-through"
                              : "flex-1 text-sm"
                          }
                        >
                          {milestone.title}
                        </label>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete milestone ${milestone.title}`}
                          onClick={() => deleteMilestone(milestone.id)}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex gap-2">
                    <Input
                      aria-label={`New milestone for ${project.title}`}
                      value={milestoneDraft[project.id] ?? ""}
                      placeholder="Add a milestone"
                      onChange={(e) =>
                        setMilestoneDraft((prev) => ({ ...prev, [project.id]: e.target.value }))
                      }
                    />
                    <Button variant="outline" onClick={() => addMilestone(project.id)}>
                      Add
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </TabsContent>

        <TabsContent value="discover" className="mt-6 grid gap-4 md:grid-cols-2">
          {ideas.map((idea) => (
            <article key={idea.id} className="panel flex flex-col p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold">{idea.title}</h3>
                <Badge variant="outline" className="label-mono">
                  {idea.level}
                </Badge>
                <Badge variant="secondary" className="label-mono">
                  {idea.domain}
                </Badge>
              </div>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{idea.summary}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {(idea.skills ?? []).map((skill) => (
                  <Badge key={skill} variant="secondary" className="label-mono">
                    {skill}
                  </Badge>
                ))}
              </div>
              <Button className="mt-4" disabled={busy} onClick={() => startFromIdea(idea)}>
                Start this build
              </Button>
            </article>
          ))}
        </TabsContent>
      </Tabs>
    </>
  );
}
