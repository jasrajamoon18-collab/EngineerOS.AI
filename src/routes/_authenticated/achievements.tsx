import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Award, Lock, Trophy } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { badgeProgress, claimEarnedBadges, type BadgeStats } from "@/lib/badges";
import {
  badgesQuery,
  dsaProgressQuery,
  interviewAnswersQuery,
  jobApplicationsQuery,
  leaderboardQuery,
  lessonProgressQuery,
  profileQuery,
  userBadgesQuery,
  userProjectsQuery,
} from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements & Leaderboard — EngineerOS" },
      {
        name: "description",
        content:
          "Track badges earned from your own saved activity and opt in to a student leaderboard.",
      },
      { property: "og:title", content: "Achievements — EngineerOS" },
      {
        property: "og:description",
        content: "Badges and an opt-in leaderboard built from your real EngineerOS activity.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [claiming, setClaiming] = useState(false);

  const { data: profile } = useQuery(profileQuery(user?.id));
  const { data: badges = [] } = useQuery(badgesQuery());
  const { data: owned = [] } = useQuery(userBadgesQuery(user?.id));
  const { data: leaderboard = [] } = useQuery(leaderboardQuery());
  const { data: lessonProgress = [] } = useQuery(lessonProgressQuery(user?.id));
  const { data: dsaProgress = [] } = useQuery(dsaProgressQuery(user?.id));
  const { data: projectData } = useQuery(userProjectsQuery(user?.id));
  const { data: applications = [] } = useQuery(jobApplicationsQuery(user?.id));
  const { data: interviewAnswers = [] } = useQuery(interviewAnswersQuery(user?.id));

  const stats: BadgeStats = {
    lessons_completed: lessonProgress.filter((p) => p.status === "completed").length,
    dsa_solved: dsaProgress.filter((p) => p.status === "solved").length,
    streak: profile?.streak_count ?? 0,
    projects: projectData?.projects.length ?? 0,
    applications: applications.length,
    interview_answers: interviewAnswers.length,
    xp: profile?.xp ?? 0,
  };

  const ownedSlugs = owned.map((b) => b.badge_slug);
  const unclaimed = badges.filter(
    (badge) => !ownedSlugs.includes(badge.slug) && badgeProgress(badge, stats).earned,
  );

  async function onClaim() {
    if (!user) return;
    setClaiming(true);
    try {
      const claimed = await claimEarnedBadges(user.id, badges, ownedSlugs, stats);
      await queryClient.invalidateQueries({ queryKey: ["user-badges", user.id] });
      toast.success(`${claimed.length} badge${claimed.length === 1 ? "" : "s"} added.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not claim badges.");
    } finally {
      setClaiming(false);
    }
  }

  async function onToggleLeaderboard(value: boolean) {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ leaderboard_opt_in: value })
      .eq("id", user.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    await queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    toast.success(value ? "You're on the leaderboard." : "You're off the leaderboard.");
  }

  return (
    <>
      <PageHeader
        eyebrow="Progress"
        title="Achievements & Leaderboard"
        description="Badges are calculated from activity you saved in EngineerOS — lessons, solved problems, streak, projects, applications and interview answers. Nothing is imported from outside."
      />

      <section className="panel mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">
            {ownedSlugs.length} of {badges.length} badges earned
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {unclaimed.length > 0
              ? `${unclaimed.length} badge${unclaimed.length === 1 ? "" : "s"} ready to add.`
              : "Nothing new to add right now."}
          </p>
        </div>
        <Button onClick={onClaim} disabled={claiming || unclaimed.length === 0}>
          <Award className="mr-2 h-4 w-4" aria-hidden="true" />
          Claim earned badges
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <h2 className="sr-only">Badges</h2>
        {badges.map((badge) => {
          const progress = badgeProgress(badge, stats);
          const held = ownedSlugs.includes(badge.slug);
          return (
            <article key={badge.id} className="panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
                  {held ? (
                    <Trophy className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Lock className="h-4 w-4" aria-hidden="true" />
                  )}
                </div>
                <Badge variant={held ? "default" : "outline"}>
                  {held ? "Earned" : `${progress.current}/${progress.threshold}`}
                </Badge>
              </div>
              <h3 className="mt-3 text-sm font-semibold">{badge.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{badge.description}</p>
              <Progress className="mt-3 h-1.5" value={progress.percent} />
              <p className="label-mono mt-2 text-muted-foreground">+{badge.xp_reward} xp value</p>
            </article>
          );
        })}
      </section>

      <section className="panel mt-8 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Leaderboard</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Only students who opt in appear here, and only their display name, XP, streak and
              badge count are shown.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="leaderboard-opt-in"
              checked={profile?.leaderboard_opt_in ?? false}
              onCheckedChange={(value) => void onToggleLeaderboard(value)}
            />
            <Label htmlFor="leaderboard-opt-in" className="text-sm">
              Show me on the leaderboard
            </Label>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">
            No one has opted in yet. Turn the switch on to be the first.
          </p>
        ) : (
          <ol className="mt-5 space-y-2">
            {leaderboard.map((row, index) => (
              <li
                key={`${row.display_name}-${index}`}
                className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm"
              >
                <span className="label-mono w-6 text-muted-foreground">{index + 1}</span>
                <span className="flex-1 truncate font-medium">{row.display_name}</span>
                <span className="label-mono text-muted-foreground">
                  {row.xp} xp · {row.streak_count}d · {row.badge_count} badges
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
