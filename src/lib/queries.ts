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

/* ---------------------------------------------------------------------------
 * Phase 2 — Labs & career tools
 * ------------------------------------------------------------------------ */

export type CodeChallenge = Tables<"code_challenges">;
export type CodeSnippet = Tables<"code_snippets">;
export type SqlExercise = Tables<"sql_exercises">;
export type SqlAttempt = Tables<"sql_attempts">;
export type ProjectIdea = Tables<"project_ideas">;
export type UserProject = Tables<"user_projects">;
export type ProjectMilestone = Tables<"project_milestones">;
export type GitTopic = Tables<"git_topics">;
export type GitProgress = Tables<"git_progress">;
export type PortfolioProfile = Tables<"portfolio_profiles">;
export type Resume = Tables<"resumes">;
export type ResumeAnalysis = Tables<"resume_analyses">;

export const codeChallengesQuery = () =>
  queryOptions({
    queryKey: ["code-challenges"],
    queryFn: async () =>
      unwrap<CodeChallenge[]>(await supabase.from("code_challenges").select("*").order("order_index")),
  });

export const codeSnippetsQuery = (userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["code-snippets", userId],
    queryFn: async () =>
      unwrap<CodeSnippet[]>(
        await supabase
          .from("code_snippets")
          .select("*")
          .eq("user_id", userId!)
          .order("updated_at", { ascending: false }),
      ),
  });

export const sqlExercisesQuery = () =>
  queryOptions({
    queryKey: ["sql-exercises"],
    queryFn: async () =>
      unwrap<SqlExercise[]>(await supabase.from("sql_exercises").select("*").order("order_index")),
  });

export const sqlAttemptsQuery = (userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["sql-attempts", userId],
    queryFn: async () =>
      unwrap<SqlAttempt[]>(await supabase.from("sql_attempts").select("*").eq("user_id", userId!)),
  });

export const projectIdeasQuery = () =>
  queryOptions({
    queryKey: ["project-ideas"],
    queryFn: async () =>
      unwrap<ProjectIdea[]>(await supabase.from("project_ideas").select("*").order("order_index")),
  });

export const userProjectsQuery = (userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["user-projects", userId],
    queryFn: async () => {
      const projects = unwrap<UserProject[]>(
        await supabase
          .from("user_projects")
          .select("*")
          .eq("user_id", userId!)
          .order("created_at", { ascending: false }),
      );
      const milestones = unwrap<ProjectMilestone[]>(
        await supabase
          .from("project_milestones")
          .select("*")
          .eq("user_id", userId!)
          .order("order_index"),
      );
      return { projects, milestones };
    },
  });

export const gitTopicsQuery = () =>
  queryOptions({
    queryKey: ["git-topics"],
    queryFn: async () =>
      unwrap<GitTopic[]>(await supabase.from("git_topics").select("*").order("order_index")),
  });

export const gitProgressQuery = (userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["git-progress", userId],
    queryFn: async () =>
      unwrap<GitProgress[]>(await supabase.from("git_progress").select("*").eq("user_id", userId!)),
  });

export const portfolioQuery = (userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["portfolio", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_profiles")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as PortfolioProfile | null;
    },
  });

export const publicPortfolioQuery = (handle: string) =>
  queryOptions({
    queryKey: ["public-portfolio", handle],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_profiles")
        .select("*")
        .eq("handle", handle)
        .eq("is_public", true)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return null;
      const projects = unwrap<UserProject[]>(
        await supabase
          .from("user_projects")
          .select("*")
          .eq("user_id", data.user_id)
          .eq("show_in_portfolio", true)
          .order("created_at", { ascending: false }),
      );
      return { portfolio: data as PortfolioProfile, projects };
    },
  });

export const resumesQuery = (userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["resumes", userId],
    queryFn: async () =>
      unwrap<Resume[]>(
        await supabase
          .from("resumes")
          .select("*")
          .eq("user_id", userId!)
          .order("updated_at", { ascending: false }),
      ),
  });

export const resumeAnalysesQuery = (userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["resume-analyses", userId],
    queryFn: async () =>
      unwrap<ResumeAnalysis[]>(
        await supabase
          .from("resume_analyses")
          .select("*")
          .eq("user_id", userId!)
          .order("created_at", { ascending: false })
          .limit(20),
      ),
  });

/* ---------------------------------------------------------------------------
 * Phase 3 — Career center, communication, interview, skills, career roadmaps
 * ------------------------------------------------------------------------ */

export type LinkedinSection = Tables<"linkedin_sections">;
export type LinkedinDraft = Tables<"linkedin_drafts">;
export type CommunicationPrompt = Tables<"communication_prompts">;
export type CommunicationEntry = Tables<"communication_entries">;
export type InterviewQuestion = Tables<"interview_questions">;
export type InterviewAnswer = Tables<"interview_answers">;
export type Skill = Tables<"skills">;
export type CareerRole = Tables<"career_roles">;
export type RoleSkillTarget = Tables<"role_skill_targets">;
export type UserSkillRating = Tables<"user_skill_ratings">;
export type CareerTrack = Tables<"career_tracks">;
export type CareerTrackStep = Tables<"career_track_steps">;
export type CareerStepProgress = Tables<"career_step_progress">;

export const linkedinSectionsQuery = () =>
  queryOptions({
    queryKey: ["linkedin-sections"],
    queryFn: async () =>
      unwrap<LinkedinSection[]>(
        await supabase.from("linkedin_sections").select("*").order("order_index"),
      ),
  });

export const linkedinDraftsQuery = (userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["linkedin-drafts", userId],
    queryFn: async () =>
      unwrap<LinkedinDraft[]>(
        await supabase.from("linkedin_drafts").select("*").eq("user_id", userId!),
      ),
  });

export const communicationPromptsQuery = () =>
  queryOptions({
    queryKey: ["communication-prompts"],
    queryFn: async () =>
      unwrap<CommunicationPrompt[]>(
        await supabase.from("communication_prompts").select("*").order("order_index"),
      ),
  });

export const communicationEntriesQuery = (userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["communication-entries", userId],
    queryFn: async () =>
      unwrap<CommunicationEntry[]>(
        await supabase
          .from("communication_entries")
          .select("*")
          .eq("user_id", userId!)
          .order("created_at", { ascending: false })
          .limit(100),
      ),
  });

export const interviewQuestionsQuery = () =>
  queryOptions({
    queryKey: ["interview-questions"],
    queryFn: async () =>
      unwrap<InterviewQuestion[]>(
        await supabase.from("interview_questions").select("*").order("order_index"),
      ),
  });

export const interviewAnswersQuery = (userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["interview-answers", userId],
    queryFn: async () =>
      unwrap<InterviewAnswer[]>(
        await supabase
          .from("interview_answers")
          .select("*")
          .eq("user_id", userId!)
          .order("updated_at", { ascending: false }),
      ),
  });

export const skillCatalogueQuery = () =>
  queryOptions({
    queryKey: ["skill-catalogue"],
    queryFn: async () => {
      const skills = unwrap<Skill[]>(await supabase.from("skills").select("*").order("order_index"));
      const roles = unwrap<CareerRole[]>(
        await supabase.from("career_roles").select("*").order("order_index"),
      );
      const targets = unwrap<RoleSkillTarget[]>(
        await supabase.from("role_skill_targets").select("*"),
      );
      return { skills, roles, targets };
    },
  });

export const skillRatingsQuery = (userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["skill-ratings", userId],
    queryFn: async () =>
      unwrap<UserSkillRating[]>(
        await supabase.from("user_skill_ratings").select("*").eq("user_id", userId!),
      ),
  });

export const careerTracksQuery = () =>
  queryOptions({
    queryKey: ["career-tracks"],
    queryFn: async () => {
      const tracks = unwrap<CareerTrack[]>(
        await supabase.from("career_tracks").select("*").order("order_index"),
      );
      const steps = unwrap<CareerTrackStep[]>(
        await supabase.from("career_track_steps").select("*").order("order_index"),
      );
      return { tracks, steps };
    },
  });

export const careerStepProgressQuery = (userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["career-step-progress", userId],
    queryFn: async () =>
      unwrap<CareerStepProgress[]>(
        await supabase.from("career_step_progress").select("*").eq("user_id", userId!),
      ),
  });

/* ---------------------------------------------------------------------------
 * Phase 4 — Jobs, aptitude drills, certifications, insights
 * ------------------------------------------------------------------------ */

export type JobApplication = Tables<"job_applications">;
export type AptitudeQuestion = Tables<"aptitude_questions">;
export type AptitudeAttempt = Tables<"aptitude_attempts">;
export type Certification = Tables<"certifications_catalogue">;
export type CertificationPlan = Tables<"certification_plans">;

export const jobApplicationsQuery = (userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["job-applications", userId],
    queryFn: async () =>
      unwrap<JobApplication[]>(
        await supabase
          .from("job_applications")
          .select("*")
          .eq("user_id", userId!)
          .order("updated_at", { ascending: false }),
      ),
  });

export const aptitudeQuestionsQuery = () =>
  queryOptions({
    queryKey: ["aptitude-questions"],
    queryFn: async () =>
      unwrap<AptitudeQuestion[]>(
        await supabase.from("aptitude_questions").select("*").order("order_index"),
      ),
  });

export const aptitudeAttemptsQuery = (userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["aptitude-attempts", userId],
    queryFn: async () =>
      unwrap<AptitudeAttempt[]>(
        await supabase.from("aptitude_attempts").select("*").eq("user_id", userId!),
      ),
  });

export const certificationsQuery = () =>
  queryOptions({
    queryKey: ["certifications-catalogue"],
    queryFn: async () =>
      unwrap<Certification[]>(
        await supabase.from("certifications_catalogue").select("*").order("order_index"),
      ),
  });

export const certificationPlansQuery = (userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["certification-plans", userId],
    queryFn: async () =>
      unwrap<CertificationPlan[]>(
        await supabase.from("certification_plans").select("*").eq("user_id", userId!),
      ),
  });

/* ---------------------------------------------------------------------------
 * Phase 5 — Community, notifications, admin
 * ------------------------------------------------------------------------ */

export type StudyGroup = Tables<"study_groups">;
export type GroupMember = Tables<"group_members">;
export type GroupPost = Tables<"group_posts">;
export type AppNotification = Tables<"notifications">;
export type NotificationPreferences = Tables<"notification_preferences">;

export const isAdminQuery = (userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["is-admin", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId!)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw new Error(error.message);
      return Boolean(data);
    },
  });

export const studyGroupsQuery = (userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["study-groups", userId],
    queryFn: async () => {
      const groups = unwrap<StudyGroup[]>(
        await supabase.from("study_groups").select("*").order("created_at", { ascending: false }),
      );
      const memberships = unwrap<GroupMember[]>(
        await supabase.from("group_members").select("*").eq("user_id", userId!),
      );
      const memberCounts = groups.length
        ? unwrap<GroupMember[]>(
            await supabase
              .from("group_members")
              .select("*")
              .in(
                "group_id",
                groups.map((g) => g.id),
              ),
          )
        : [];
      return { groups, memberships, memberCounts };
    },
  });

export const groupDetailQuery = (groupId: string | undefined, userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(groupId && userId),
    queryKey: ["study-group", groupId],
    queryFn: async () => {
      const group = await supabase.from("study_groups").select("*").eq("id", groupId!).maybeSingle();
      if (group.error) throw new Error(group.error.message);
      if (!group.data) return null;
      const members = unwrap<GroupMember[]>(
        await supabase.from("group_members").select("*").eq("group_id", groupId!),
      );
      const posts = unwrap<GroupPost[]>(
        await supabase
          .from("group_posts")
          .select("*")
          .eq("group_id", groupId!)
          .order("created_at", { ascending: false })
          .limit(50),
      );
      const isMember = members.some((m) => m.user_id === userId);
      return { group: group.data, members, posts, isMember };
    },
  });

export const notificationsQuery = (userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["notifications", userId],
    queryFn: async () =>
      unwrap<AppNotification[]>(
        await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId!)
          .order("created_at", { ascending: false })
          .limit(50),
      ),
  });

export const notificationPreferencesQuery = (userId: string | undefined) =>
  queryOptions({
    enabled: Boolean(userId),
    queryKey: ["notification-preferences", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as NotificationPreferences | null;
    },
  });
