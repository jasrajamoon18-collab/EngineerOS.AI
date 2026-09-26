import { supabase } from "@/integrations/supabase/client";
import { todayISO } from "@/lib/queries";
import type { Profile } from "@/lib/queries";

function getLocalStore<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const val = localStorage.getItem(key);
    return val ? (JSON.parse(val) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalStore<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

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
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ xp: (profile?.xp ?? 0) + xp, ...streak })
      .eq("id", userId);
    if (error) throw error;
  } catch (err) {
    console.warn("[EngineerOS] Could not sync XP to server, saving locally:", err);
    const localProfile = getLocalStore<Partial<Profile>>(`engineeros_profile_${userId}`, {});
    localProfile.xp = (localProfile.xp ?? profile?.xp ?? 0) + xp;
    localProfile.streak_count = streak.streak_count;
    localProfile.last_active_date = streak.last_active_date;
    setLocalStore(`engineeros_profile_${userId}`, localProfile);
  }
}

export async function completeLesson(params: {
  userId: string;
  lessonId: string;
  courseId: string;
  profile: Profile | null | undefined;
}) {
  try {
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
    if (error) throw error;
  } catch (err) {
    console.warn("[EngineerOS] Saving lesson completion locally:", err);
    const local = getLocalStore<Array<{ lesson_id: string; course_id: string; status: string }>>(
      `engineeros_lessons_${params.userId}`,
      [],
    );
    if (!local.some((l) => l.lesson_id === params.lessonId)) {
      local.push({
        lesson_id: params.lessonId,
        course_id: params.courseId,
        status: "completed",
      });
      setLocalStore(`engineeros_lessons_${params.userId}`, local);
    }
  }
  await awardXp(params.userId, params.profile, 20);
}

export async function reopenLesson(userId: string, lessonId: string) {
  try {
    const { error } = await supabase
      .from("lesson_progress")
      .delete()
      .eq("user_id", userId)
      .eq("lesson_id", lessonId);
    if (error) throw error;
  } catch (err) {
    console.warn("[EngineerOS] Reopening lesson locally:", err);
    const local = getLocalStore<Array<{ lesson_id: string; course_id: string; status: string }>>(
      `engineeros_lessons_${userId}`,
      [],
    );
    const filtered = local.filter((l) => l.lesson_id !== lessonId);
    setLocalStore(`engineeros_lessons_${userId}`, filtered);
  }
}

export async function setDsaStatus(params: {
  userId: string;
  problemId: string;
  status: "todo" | "attempted" | "solved";
  profile: Profile | null | undefined;
  previousStatus?: string;
}) {
  try {
    const { error } = await supabase.from("dsa_progress").upsert(
      {
        user_id: params.userId,
        problem_id: params.problemId,
        status: params.status,
      },
      { onConflict: "user_id,problem_id" },
    );
    if (error) throw error;
  } catch (err) {
    console.warn("[EngineerOS] Saving DSA progress locally:", err);
    const local = getLocalStore<Array<{ problem_id: string; status: string }>>(
      `engineeros_dsa_${params.userId}`,
      [],
    );
    const existing = local.find((p) => p.problem_id === params.problemId);
    if (existing) {
      existing.status = params.status;
    } else {
      local.push({ problem_id: params.problemId, status: params.status });
    }
    setLocalStore(`engineeros_dsa_${params.userId}`, local);
  }

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
  try {
    if (params.completed) {
      const { error } = await supabase
        .from("task_completions")
        .delete()
        .eq("user_id", params.userId)
        .eq("task_id", params.taskId)
        .eq("completed_on", day);
      if (error) throw error;
      return;
    }
    const { error } = await supabase
      .from("task_completions")
      .insert({ user_id: params.userId, task_id: params.taskId, completed_on: day });
    if (error) throw error;
    await awardXp(params.userId, params.profile, params.xp);
  } catch (err) {
    console.warn("[EngineerOS] Toggling task completion locally:", err);
    const key = `engineeros_tasks_${params.userId}_${day}`;
    const local = getLocalStore<string[]>(key, []);
    if (params.completed) {
      setLocalStore(
        key,
        local.filter((id) => id !== params.taskId),
      );
    } else {
      if (!local.includes(params.taskId)) local.push(params.taskId);
      setLocalStore(key, local);
      await awardXp(params.userId, params.profile, params.xp);
    }
  }
}
