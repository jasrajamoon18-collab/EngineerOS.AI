import { supabase } from "@/integrations/supabase/client";
import { todayISO } from "@/lib/queries";
import type { Profile } from "@/lib/queries";

function nextStreak(profile: Profile | null | undefined): {
  streak_count: number;
  last_active_date: string;
} {
  const today = todayISO();
  if (!profile) return { streak_count: 1, last_active_date: today };
  if (profile.last_active_date === today) {
    return { streak_count: profile.streak_count || 1, last_active_date: today };
  }
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const continued = profile.last_active_date === yesterday;
  return {
    streak_count: continued ? (profile.streak_count || 0) + 1 : 1,
    last_active_date: today,
  };
}

/** Awards XP and keeps the daily streak in sync. Errors bubble to the caller. */
export async function awardXp(userId: string, profile: Profile | null | undefined, xp: number) {
  const streak = nextStreak(profile);
  const { error } = await supabase
    .from("profiles")
    .update({ xp: (profile?.xp ?? 0) + xp, ...streak })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}

export async function completeLesson(params: {
  userId: string;
  lessonId: string;
  courseId: string;
  profile: Profile | null | undefined;
}) {
  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: params.userId,
      lesson_id: params.lessonId,
      course_id: params.courseId,
      status: "completed",
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" },
  );
  if (error) throw new Error(error.message);
  await awardXp(params.userId, params.profile, 20);
}

export async function reopenLesson(userId: string, lessonId: string) {
  const { error } = await supabase
    .from("lesson_progress")
    .delete()
    .eq("user_id", userId)
    .eq("lesson_id", lessonId);
  if (error) throw new Error(error.message);
}

export async function setDsaStatus(params: {
  userId: string;
  problemId: string;
  status: "todo" | "attempted" | "solved";
  profile: Profile | null | undefined;
  previousStatus?: string;
}) {
  const { error } = await supabase.from("dsa_progress").upsert(
    {
      user_id: params.userId,
      problem_id: params.problemId,
      status: params.status,
    },
    { onConflict: "user_id,problem_id" },
  );
  if (error) throw new Error(error.message);
  if (params.status === "solved" && params.previousStatus !== "solved") {
    await awardXp(params.userId, params.profile, 30);
  }
}

export async function toggleTask(params: {
  userId: string;
  taskId: string;
  completed: boolean;
  xp: number;
  profile: Profile | null | undefined;
}) {
  const day = todayISO();
  if (params.completed) {
    const { error } = await supabase
      .from("task_completions")
      .delete()
      .eq("user_id", params.userId)
      .eq("task_id", params.taskId)
      .eq("completed_on", day);
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await supabase
    .from("task_completions")
    .insert({ user_id: params.userId, task_id: params.taskId, completed_on: day });
  if (error) throw new Error(error.message);
  await awardXp(params.userId, params.profile, params.xp);
}
