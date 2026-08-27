import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { awardXp } from "@/lib/progress";
import { careerStepProgressQuery, careerTracksQuery, profileQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/career")({
  head: () => ({
    meta: [
      { title: "Career Roadmaps — EngineerOS" },
      {
        name: "description",
        content:
          "Phase-by-phase career roadmaps matched to your branch and goal, with each step linked to the part of EngineerOS that builds it.",
      },
      { property: "og:title", content: "Career Roadmaps — EngineerOS" },
      {
        property: "og:description",
        content: "Practical, checkable career roadmaps tied to your profile goal and progress.",
      },
    ],
  }),
  component: CareerPage,
});

function CareerPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile } = useQuery(profileQuery(user?.id));
  const { data } = useQuery(careerTracksQuery());
  const { data: progress = [] } = useQuery(careerStepProgressQuery(user?.id));

  const allTracks = data?.tracks ?? [];
  const steps = data?.steps ?? [];

  const suggested = allTracks
    .filter(
      (track) =>
        (!track.branch_slug || track.branch_slug === profile?.branch_slug) &&
        (!track.career_goal || track.career_goal === profile?.career_goal),
    )
    .map((t) => t.slug);

  const [slug, setSlug] = useState<string | null>(null);
  const active = allTracks.find((t) => t.slug === slug) ?? allTracks.find((t) => suggested.includes(t.slug)) ?? allTracks[0];

  const trackSteps = steps.filter((s) => s.track_slug === active?.slug);
  const doneIds = new Set(progress.filter((p) => p.is_done).map((p) => p.step_id));
  const doneCount = trackSteps.filter((s) => doneIds.has(s.id)).length;
  const phases = [...new Set(trackSteps.map((s) => s.phase))];

  async function toggle(stepId: string) {
    if (!user) return;
    const isDone = doneIds.has(stepId);
    const { error } = await supabase
      .from("career_step_progress")
      .upsert(
        { user_id: user.id, step_id: stepId, is_done: !isDone },
        { onConflict: "user_id,step_id" },
      );
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!isDone) {
      await awardXp(user.id, profile, 10);
      await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success("+10 XP · step complete");
    }
    await queryClient.invalidateQueries({ queryKey: ["career-step-progress", user.id] });
  }

  return (
    <>
      <PageHeader
        eyebrow="Direction"
        title="Career Roadmaps"
        description="A sequenced plan for the role you're aiming at — each step points at the module inside EngineerOS that builds it."
        actions={
          <div className="min-w-[240px]">
            <Select value={active?.slug ?? ""} onValueChange={setSlug}>
              <SelectTrigger aria-label="Choose a roadmap">
                <SelectValue placeholder="Choose a roadmap" />
              </SelectTrigger>
              <SelectContent>
                {allTracks.map((track) => (
                  <SelectItem key={track.slug} value={track.slug}>
                    {track.title}
                    {suggested.includes(track.slug) ? " · matches your profile" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <Alert className="mb-8">
        <AlertTitle>A study plan, not a guarantee</AlertTitle>
        <AlertDescription>
          Roadmaps are curated sequences based on your branch and the goal in your profile. They are
          not tied to any employer, job posting or certification, and completing one guarantees
          nothing except that you have done the work.
        </AlertDescription>
      </Alert>

      {active ? (
        <>
          <section className="panel mb-8 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold">{active.title}</h2>
              <Badge variant="outline" className="label-mono">
                {active.horizon}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{active.description}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span>
                {doneCount}/{trackSteps.length} steps complete
              </span>
            </div>
            <Progress
              className="mt-2 h-2"
              value={trackSteps.length ? (doneCount / trackSteps.length) * 100 : 0}
            />
          </section>

          <div className="space-y-10">
            {phases.map((phase) => (
              <section key={phase} aria-labelledby={`phase-${phase}`}>
                <h3 id={`phase-${phase}`} className="label-mono mb-3 text-primary">
                  {phase}
                </h3>
                <ul className="space-y-3">
                  {trackSteps
                    .filter((step) => step.phase === phase)
                    .map((step) => {
                      const done = doneIds.has(step.id);
                      return (
                        <li key={step.id} className="panel flex gap-3 p-4">
                          <Checkbox
                            id={`step-${step.id}`}
                            checked={done}
                            onCheckedChange={() => toggle(step.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={`step-${step.id}`}
                              className="text-sm font-medium leading-snug"
                            >
                              {step.title}
                            </label>
                            <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                            {step.route ? (
                              <Button asChild size="sm" variant="outline" className="mt-3">
                                <Link to={step.route}>Open module</Link>
                              </Button>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </section>
            ))}
          </div>
        </>
      ) : null}
    </>
  );
}
