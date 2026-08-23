import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;
export type Course = Tables<"courses">;
export type Module = Tables<"modules">;
export type Lesson = Tables<"lessons">;
export type Branch = Tables<"branches">;
export type DsaProblem = Tables<"dsa_problems">;
export type DsaProgress = Tables<"dsa_progress">;
export type DailyTask = Tables<"daily_tasks">;
export type TaskCompletion = Tables<"task_completions">;
export type LessonProgress = Tables<"lesson_progress">;
export type Enrollment = Tables<"enrollments">;
export type Roadmap = Tables<"roadmaps">;
export type RoadmapStep = Tables<"roadmap_steps">;

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
}

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const branchesQuery = () =>
  queryOptions({
    queryKey: ["branches"],
    queryFn: async () =>
      unwrap<Branch[]>(await supabase.from("branches").select("*").order("order_index")),
  });

export const coursesQuery = (track?: Course["track"]) =>
  queryOptions({
    queryKey: ["courses", track ?? "all"],
    queryFn: async () => {
      let request = supabase.from("courses").select("*").eq("is_published", true);
      if (track) request = request.eq("track", track);
      return unwrap<Course[]>(await request.order("order_index"));
    },
  });

export const courseDetailQuery = (slug: string) =>
  queryOptions({
    queryKey: ["course", slug],
    queryFn: async () => {
      const course = await supabase.from("courses").select("*").eq("slug", slug).maybeSingle();
      if (course.error) throw new Error(course.error.message);
      if (!course.data) return null;
      const modules = unwrap<Module[]>(
        await supabase
          .from("modules")
          .select("*")
          .eq("course_id", course.data.id)
          .order("order_index"),
      );
      const lessons = unwrap<Lesson[]>(
        await supabase
          .from("lessons")
          .select("*")
          .in(
            "module_id",
            modules.map((m) => m.id),
          )
          .order("order_index"),
      );
      return { course: course.data, modules, lessons };
    },
  });

export const profileQuery = (userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as Profile | null;
    },
  });

export const lessonProgressQuery = (userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["lesson-progress", userId],
    queryFn: async () =>
      unwrap<LessonProgress[]>(
        await supabase.from("lesson_progress").select("*").eq("user_id", userId!),
      ),
  });

export const enrollmentsQuery = (userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["enrollments", userId],
    queryFn: async () =>
      unwrap<Enrollment[]>(await supabase.from("enrollments").select("*").eq("user_id", userId!)),
  });

export const dsaProblemsQuery = () =>
  queryOptions({
    queryKey: ["dsa-problems"],
    queryFn: async () =>
      unwrap<DsaProblem[]>(await supabase.from("dsa_problems").select("*").order("order_index")),
  });

export const dsaProgressQuery = (userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["dsa-progress", userId],
    queryFn: async () =>
      unwrap<DsaProgress[]>(await supabase.from("dsa_progress").select("*").eq("user_id", userId!)),
  });

export const dailyTasksQuery = () =>
  queryOptions({
    queryKey: ["daily-tasks"],
    queryFn: async () =>
      unwrap<DailyTask[]>(
        await supabase.from("daily_tasks").select("*").eq("is_active", true).order("order_index"),
      ),
  });

export const taskCompletionsQuery = (userId: string | undefined, day: string) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["task-completions", userId, day],
    queryFn: async () =>
      unwrap<TaskCompletion[]>(
        await supabase
          .from("task_completions")
          .select("*")
          .eq("user_id", userId!)
          .eq("completed_on", day),
      ),
  });

export const roadmapsQuery = () =>
  queryOptions({
    queryKey: ["roadmaps"],
    queryFn: async () => {
      const roadmaps = unwrap<Roadmap[]>(
        await supabase.from("roadmaps").select("*").order("order_index"),
      );
      const steps = unwrap<RoadmapStep[]>(
        await supabase.from("roadmap_steps").select("*").order("order_index"),
      );
      return { roadmaps, steps };
    },
  });

export const mentorMessagesQuery = (userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["mentor-messages", userId],
    queryFn: async () =>
      unwrap<Tables<"mentor_messages">[]>(
        await supabase
          .from("mentor_messages")
          .select("*")
          .eq("user_id", userId!)
          .order("created_at", { ascending: true })
          .limit(200),
      ),
  });
