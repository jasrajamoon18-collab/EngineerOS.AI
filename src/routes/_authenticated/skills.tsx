import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { computeSkillGap, SKILL_LEVELS, SKILL_ROUTES } from "@/lib/career";
import { skillCatalogueQuery, skillRatingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/skills")({
  head: () => ({
    meta: [
      { title: "Skill Gap Analyzer — EngineerOS" },
      {
        name: "description",
        content:
          "Rate your own skills against a target role and see exactly which gaps to close next, with the inputs and weights shown openly.",
      },
      { property: "og:title", content: "Skill Gap Analyzer — EngineerOS" },
      {
        property: "og:description",
        content: "An educational self-assessment that shows its own inputs and next steps.",
      },
    ],
  }),
  component: SkillsPage,
});

function SkillsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: catalogue } = useQuery(skillCatalogueQuery());
  const { data: ratings = [] } = useQuery(skillRatingsQuery(user?.id));

  const roles = catalogue?.roles ?? [];
  const skills = catalogue?.skills ?? [];
  const targets = catalogue?.targets ?? [];

  const [roleSlug, setRoleSlug] = useState<string | null>(null);
  const activeRole = roles.find((r) => r.slug === roleSlug) ?? roles[0];

  const gap = computeSkillGap({
    targets: targets.filter((t) => t.role_slug === activeRole?.slug),
    skills,
    ratings,
  });

  async function rate(skillSlug: string, level: number) {
    if (!user) return;
    const existing = ratings.find((r) => r.skill_slug === skillSlug);
    const { error } = existing
      ? await supabase.from("user_skill_ratings").update({ level }).eq("id", existing.id)
      : await supabase
          .from("user_skill_ratings")
          .insert({ user_id: user.id, skill_slug: skillSlug, level });
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["skill-ratings", user.id] });
  }

  return (
    <>
      <PageHeader
        eyebrow="Self-assessment"
        title="Skill Gap Analyzer"
        description="Pick a target role, rate yourself honestly, and see the gaps ranked by how much that role actually weights them."
        actions={
          <div className="min-w-[220px]">
            <Label htmlFor="role">Target role</Label>
            <Select value={activeRole?.slug ?? ""} onValueChange={setRoleSlug}>
              <SelectTrigger id="role" className="mt-2">
                <SelectValue placeholder="Choose a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.slug} value={role.slug}>
                    {role.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <Alert className="mb-8">
        <AlertTitle>This is an educational self-assessment</AlertTitle>
        <AlertDescription>
          Every number here comes from two inputs only: the level you selected for each skill, and a
          fixed target level and weight defined for the role. Nobody tests you, no employer sees
          this, and readiness here does not predict hiring. Coverage = your level capped at target,
          weighted, divided by the total weighted target.
        </AlertDescription>
      </Alert>

      {activeRole ? (
        <>
          <section className="panel mb-8 p-5">
            <p className="label-mono text-primary">{activeRole.title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{activeRole.description}</p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span>Weighted coverage of this role's skill targets</span>
                <span className="label-mono text-primary">{gap.coverage}%</span>
              </div>
              <Progress className="mt-2 h-2" value={gap.coverage} />
              <p className="mt-2 text-xs text-muted-foreground">
                Based on {gap.rated} of {gap.total} skills you have rated. Unrated skills count as
                level 0.
              </p>
            </div>
          </section>

          {gap.topGaps.length ? (
            <section className="mb-8" aria-labelledby="gaps">
              <h2 id="gaps" className="label-mono mb-3 text-primary">
                Close these first
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {gap.topGaps.map((row) => {
                  const route = SKILL_ROUTES[row.skillSlug];
                  return (
                    <li key={row.skillSlug} className="panel p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold">{row.name}</h3>
                        <Badge variant="outline" className="label-mono">
                          gap {row.gap}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        You: level {row.level} · Target for this role: level {row.target} · Weight{" "}
                        {row.weight}
                      </p>
                      {route ? (
                        <Button asChild size="sm" variant="outline" className="mt-3">
                          <Link to={route.to}>Go to {route.label}</Link>
                        </Button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="rate">
            <h2 id="rate" className="label-mono mb-3 text-primary">
              Rate yourself
            </h2>
            <ul className="space-y-3">
              {gap.rows.map((row) => (
                <li
                  key={row.skillSlug}
                  className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{row.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.category} · target level {row.target}
                    </p>
                  </div>
                  <div className="sm:w-56">
                    <Label className="sr-only" htmlFor={`skill-${row.skillSlug}`}>
                      Your level for {row.name}
                    </Label>
                    <Select
                      value={String(row.level)}
                      onValueChange={(value) => rate(row.skillSlug, Number(value))}
                    >
                      <SelectTrigger id={`skill-${row.skillSlug}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SKILL_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={String(level.value)}>
                            {level.value} · {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </>
  );
}
