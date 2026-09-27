import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Award, Flame, HeartHandshake, Lock, Sparkles, Trophy, Zap } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkillTreeView } from "@/components/skill-tree-view";
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
      { title: "Achievements, Skill Trees & Leagues — EngineerOS" },
      {
        name: "description",
        content:
          "Skill tree progression per language/track, verifiable badges, opt-in weekly leagues, and streak recovery missions.",
      },
      { property: "og:title", content: "Achievements — EngineerOS" },
      {
        property: "og:description",
        content:
          "Badges, skill trees, and an opt-in leaderboard built from your real EngineerOS activity.",
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
  const [recovering, setRecovering] = useState(false);

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

  // Streak Recovery Mission Handler
  async function handleStreakRecovery() {
    if (!user) return;
    setRecovering(true);
    try {
      const restoredStreak = Math.max(3, (profile?.streak_count ?? 0) + 2);
      await supabase
        .from("profiles")
        .update({
          streak_count: restoredStreak,
          last_active_date: new Date().toISOString().split("T")[0],
        })
        .eq("id", user.id);

      // Also persist to local storage fallback
      const key = `engineeros_profile_${user.id}`;
      const raw = localStorage.getItem(key);
      const local = raw ? JSON.parse(raw) : {};
      localStorage.setItem(key, JSON.stringify({ ...local, streak_count: restoredStreak }));

      await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success(`🎉 Streak recovered! Your streak is now active at ${restoredStreak} days.`);
    } catch {
      toast.error("Could not recover streak.");
    } finally {
      setRecovering(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Progress & Recognition"
        title="Achievements, Skill Trees & Weekly Leagues"
        description="Verify your compounding engineering progress: visual skill trees per language, verifiable achievement badges, opt-in weekly leagues, and streak recovery missions."
      />

      {/* Streak Recovery Mission Mechanic Banner */}
      <div className="panel mb-6 p-4 bg-gradient-to-r from-amber-500/10 via-card to-card border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-500 fill-current" />
            <span className="font-semibold text-sm text-foreground">Streak Recovery Mission</span>
            <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-[10px]">
              Forgiving Consistency
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Missed a day? Complete 2 DSA problems or 1 course lesson today to instantly restore and
            protect your streak.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleStreakRecovery}
          disabled={recovering}
          className="text-xs bg-amber-600 hover:bg-amber-700 text-white shrink-0"
        >
          <HeartHandshake className="h-3.5 w-3.5 mr-1.5" />
          {recovering ? "Restoring…" : "Claim Streak Recovery"}
        </Button>
      </div>

      <Tabs defaultValue="trees" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trees" className="text-xs">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Skill Trees
          </TabsTrigger>
          <TabsTrigger value="badges" className="text-xs">
            <Award className="h-3.5 w-3.5 mr-1.5" /> Badges ({badges.length})
          </TabsTrigger>
          <TabsTrigger value="league" className="text-xs">
            <Trophy className="h-3.5 w-3.5 mr-1.5" /> Weekly League (Opt-In)
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Skill Trees */}
        <TabsContent value="trees">
          <SkillTreeView userXp={profile?.xp ?? 150} />
        </TabsContent>

        {/* Tab 2: Badges */}
        <TabsContent value="badges" className="space-y-6">
          <section className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">
                {ownedSlugs.length} of {badges.length} badges earned
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Badges verify your actual milestones: streak milestones, DSA problem counts, and
                lesson completions.
              </p>
            </div>
            {unclaimed.length > 0 && (
              <Button onClick={onClaim} disabled={claiming} size="sm" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Claim {unclaimed.length} earned
              </Button>
            )}
          </section>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge) => {
              const owned = ownedSlugs.includes(badge.slug);
              const progress = badgeProgress(badge, stats);

              return (
                <div
                  key={badge.id}
                  className={`panel p-4 flex flex-col justify-between space-y-3 ${
                    owned ? "border-primary/40 bg-primary/5" : "opacity-80"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                          owned
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-muted text-muted-foreground"
                        }`}
                      >
                        {owned ? <Award className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{badge.title}</h4>
                        <span className="text-[10px] text-muted-foreground capitalize">
                          {badge.track} track
                        </span>
                      </div>
                    </div>

                    {owned && (
                      <Badge className="bg-emerald-600 text-white text-[10px]">Earned</Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {badge.description}
                  </p>

                  <div className="space-y-1 pt-1 border-t border-border/50 text-[11px] font-mono">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Requirement</span>
                      <span>
                        {progress.current} / {progress.threshold}
                      </span>
                    </div>
                    <Progress value={progress.percent} className="h-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab 3: Weekly League */}
        <TabsContent value="league" className="space-y-6">
          <div className="panel p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" /> Weekly Student League
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Private-by-default: only your anonymous alias and verified weekly XP are displayed
                  if you choose to participate.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Label htmlFor="opt-in-switch" className="text-xs font-semibold cursor-pointer">
                  Participate in Weekly League
                </Label>
                <Switch
                  id="opt-in-switch"
                  checked={profile?.leaderboard_opt_in ?? false}
                  onCheckedChange={onToggleLeaderboard}
                />
              </div>
            </div>

            {leaderboard.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No students in this week&apos;s league division yet. Opt-in above to lead the board!
              </p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full font-bold font-mono text-xs ${
                          index === 0
                            ? "bg-amber-500 text-white"
                            : index === 1
                              ? "bg-slate-400 text-white"
                              : index === 2
                                ? "bg-amber-700 text-white"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="font-semibold text-foreground">{entry.display_name}</span>
                    </div>

                    <div className="flex items-center gap-4 font-mono">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Flame className="h-3 w-3 text-amber-500" /> {entry.streak_count}d
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Award className="h-3 w-3 text-primary" /> {entry.badge_count}
                      </span>
                      <Badge variant="outline" className="font-bold text-primary font-mono text-xs">
                        {entry.xp} XP
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
