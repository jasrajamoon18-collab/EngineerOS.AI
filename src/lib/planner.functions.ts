import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  focus: z.string().trim().min(3).max(120),
  hoursPerWeek: z.number().int().min(2).max(60),
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weakAreas: z.array(z.string()).optional(),
  currentStreak: z.number().optional(),
  targetRole: z.string().optional(),
});

const planSchema = z.object({
  summary: z.string().min(1).max(600),
  items: z
    .array(
      z.object({
        day_index: z.number().int().min(0).max(6),
        title: z.string().min(1).max(120),
        detail: z.string().max(400).default(""),
        est_minutes: z.number().int().min(10).max(300),
      }),
    )
    .min(3)
    .max(21),
});

const SYSTEM_PROMPT = `You plan one realistic, adaptive study week for an engineering student inside EngineerOS.
Return ONLY JSON: {"summary": string, "items": [{"day_index": 0-6, "title": string, "detail": string, "est_minutes": number}]}.
day_index 0 = Monday, 6 = Sunday. Spread work across days, respect the weekly hour budget, prioritize weak patterns first, and keep each item concrete
("Solve 2 sliding-window problems in Python", not "practice DSA"). Reference EngineerOS areas:
Learn, Programming Academy, Linux Academy, DSA Practice, Code Lab, SQL Lab, Project Lab, Interview Academy.
Never invent jobs, external deadlines, or non-existent tools.`;

export const generateStudyPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const userId = context.userId;

    const profile = await supabase
      .from("profiles")
      .select("branch_slug, academic_year, career_goal, xp, streak_count")
      .eq("id", userId)
      .maybeSingle();

    const streak = profile.data?.streak_count ?? data.currentStreak ?? 0;
    const goal = profile.data?.career_goal ?? data.targetRole ?? "Software Engineer";
    const branch = profile.data?.branch_slug ?? "cse";
    const weakList = data.weakAreas?.length
      ? data.weakAreas.join(", ")
      : "Core Fundamentals, Problem Solving";

    let parsed: z.infer<typeof planSchema> | null = null;
    const geminiKey = process.env["GEMINI_API_KEY"];
    const lovableKey = process.env["LOVABLE_API_KEY"];

    // 1. Try Gemini API
    if (geminiKey) {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `${SYSTEM_PROMPT}

Student Profile: Branch=${branch}, Year=${profile.data?.academic_year ?? 3}, Goal=${goal}, Streak=${streak} days.
Known Weak Areas: ${weakList}.
Focus for this week: ${data.focus}.
Target Study Hours: ${data.hoursPerWeek} hours spread across the 7 days.
Generate an adaptive weekly plan JSON:`,
        });

        const text = response.text?.trim() || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = planSchema.parse(JSON.parse(jsonMatch[0]));
        }
      } catch (err) {
        console.warn("[EngineerOS] Gemini planner error, trying fallback:", err);
      }
    }

    // 2. Try Lovable AI gateway
    if (!parsed && lovableKey) {
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${lovableKey}` },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              {
                role: "user",
                content: `Branch: ${branch}, Goal: ${goal}, Streak: ${streak} days.\nFocus: ${data.focus}\nHours: ${data.hoursPerWeek}\nWeak areas: ${weakList}`,
              },
            ],
          }),
        });

        if (response.ok) {
          const payload = (await response.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const raw = payload.choices?.[0]?.message?.content ?? "";
          parsed = planSchema.parse(JSON.parse(raw));
        }
      } catch {
        // Fall back to deterministic plan
      }
    }

    // 3. Robust Pedagogical Generator Fallback
    if (!parsed) {
      const dailyMinutes = Math.round((data.hoursPerWeek * 60) / 6);
      parsed = {
        summary: `Adaptive ${data.focus} curriculum tailored for ${goal} (${streak}d streak). Targets: ${weakList}.`,
        items: [
          {
            day_index: 0,
            title: `Diagnostic & Foundations in ${data.focus}`,
            detail: "Review core architecture and solve 1 warm-up problem in Code Lab.",
            est_minutes: dailyMinutes,
          },
          {
            day_index: 1,
            title: "DSA Pattern Drill: Addressing Weak Area",
            detail: `Targeted session on: ${data.weakAreas?.[0] ?? "Two Pointers & Arrays"}.`,
            est_minutes: dailyMinutes,
          },
          {
            day_index: 2,
            title: "Systems & Terminal Mastery",
            detail: "Work through Linux / Systems lesson module and inspect command flags.",
            est_minutes: dailyMinutes,
          },
          {
            day_index: 3,
            title: "Applied Implementation & Milestone Code",
            detail: "Build out the core data structure or API service in Monaco sandbox.",
            est_minutes: dailyMinutes,
          },
          {
            day_index: 4,
            title: "Edge Case & Test Suite Hardening",
            detail:
              "Run solutions against boundary cases, hidden tests, and measure execution time.",
            est_minutes: dailyMinutes,
          },
          {
            day_index: 5,
            title: "Weekly Defense & Mock Viva Drill",
            detail: "Conduct 1 mock technical interview session and log any identified weak spots.",
            est_minutes: Math.round(dailyMinutes * 0.8),
          },
        ],
      };
    }

    const created = await supabase
      .from("study_plans")
      .insert({
        user_id: userId,
        week_start: data.weekStart,
        focus: data.focus,
        summary: parsed.summary,
        source: "ai",
      })
      .select("id")
      .single();
    if (created.error) throw new Error(created.error.message);

    const items = parsed.items.map((item, index) => ({
      plan_id: created.data.id,
      user_id: userId,
      day_index: item.day_index,
      title: item.title,
      detail: item.detail ?? "",
      est_minutes: item.est_minutes,
      order_index: index,
    }));
    const insertItems = await supabase.from("study_plan_items").insert(items);
    if (insertItems.error) throw new Error(insertItems.error.message);

    return { planId: created.data.id, itemCount: items.length };
  });

const autoAdjustSchema = z.object({
  planId: z.string(),
  completedItemIds: z.array(z.string()),
  missedDayIndices: z.array(z.number()),
});

export const autoAdjustStudyPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => autoAdjustSchema.parse(data))
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const userId = context.userId;

    // Fetch existing unfinished plan items
    const { data: existingItems, error } = await supabase
      .from("study_plan_items")
      .select("*")
      .eq("plan_id", data.planId)
      .eq("user_id", userId);

    if (error || !existingItems) throw new Error("Could not find current plan items.");

    const uncompleted = existingItems.filter((item) => !data.completedItemIds.includes(item.id));
    if (uncompleted.length === 0) return { rebalanced: 0 };

    // Shift uncompleted tasks forward into remaining days (Friday, Saturday, Sunday: day_index 4, 5, 6)
    const availableDays = [4, 5, 6].filter((d) => !data.missedDayIndices.includes(d));
    const targetDays = availableDays.length > 0 ? availableDays : [5, 6];

    let count = 0;
    for (let i = 0; i < uncompleted.length; i++) {
      const item = uncompleted[i]!;
      const assignedDay = targetDays[i % targetDays.length]!;
      await supabase
        .from("study_plan_items")
        .update({
          day_index: assignedDay,
          detail: `${item.detail} [Auto-rebalanced by AI Mentor]`.trim(),
        })
        .eq("id", item.id);
      count++;
    }

    return { rebalanced: count };
  });
