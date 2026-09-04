import { supabase } from "@/integrations/supabase/client";
import type { BadgeRow } from "@/lib/queries";

/** Transparent, deterministic badge criteria — every value comes from your own saved activity. */
export type BadgeStats = {
  lessons_completed: number;
  dsa_solved: number;
  streak: number;
  projects: number;
  applications: number;
  interview_answers: number;
  xp: number;
};

export function badgeProgress(badge: BadgeRow, stats: BadgeStats) {
  const current = (stats as Record<string, number>)[badge.criteria_kind] ?? 0;
  const threshold = Math.max(badge.threshold, 1);
  return {
    current,
    threshold,
    earned: current >= threshold,
    percent: Math.min(100, Math.round((current / threshold) * 100)),
  };
}

/** Claims any newly earned badges for the signed-in student. Returns the slugs claimed. */
export async function claimEarnedBadges(
  userId: string,
  badges: BadgeRow[],
  owned: string[],
  stats: BadgeStats,
): Promise<string[]> {
  const ownedSet = new Set(owned);
  const newly = badges
    .filter((badge) => !ownedSet.has(badge.slug) && badgeProgress(badge, stats).earned)
    .map((badge) => badge.slug);
  if (newly.length === 0) return [];
  const { error } = await supabase
    .from("user_badges")
    .insert(newly.map((badge_slug) => ({ user_id: userId, badge_slug })));
  if (error) throw new Error(error.message);
  return newly;
}
