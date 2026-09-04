import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  focus: z.string().trim().min(3).max(120),
  hoursPerWeek: z.number().int().min(2).max(60),
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
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

const SYSTEM_PROMPT = `You plan one realistic study week for an engineering student inside EngineerOS.
Return ONLY JSON: {"summary": string, "items": [{"day_index": 0-6, "title": string, "detail": string, "est_minutes": number}]}.
day_index 0 = Monday. Spread work across days, respect the weekly hour budget, and keep each item concrete
("Solve 3 sliding-window problems", not "practice DSA"). Reference EngineerOS areas where relevant:
Learn, Programming Academy, Linux Academy, DSA Practice, Code Lab, SQL Lab, Project Lab, Interview Academy,
Communication, Placement Drills. Never invent jobs, deadlines, certifications or external services.`;

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

    const contextLine = profile.data
      ? `Branch: ${profile.data.branch_slug ?? "unknown"}, year: ${profile.data.academic_year ?? "unknown"}, goal: ${profile.data.career_goal ?? "unknown"}, streak: ${profile.data.streak_count} days.`
      : "Student context unavailable.";

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      throw new Error("The weekly planner is not configured right now.");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `${contextLine}\nFocus for this week: ${data.focus}\nAvailable study time: ${data.hoursPerWeek} hours across the week.`,
          },
        ],
      }),
    });

    if (response.status === 429) throw new Error("Rate limit hit. Try again in a minute.");
    if (response.status === 402) throw new Error("AI credits are exhausted for this workspace.");
    if (!response.ok) {
      console.error("AI gateway error", response.status, await response.text());
      throw new Error("The weekly planner is temporarily unavailable.");
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = payload.choices?.[0]?.message?.content ?? "";
    let parsed: z.infer<typeof planSchema>;
    try {
      parsed = planSchema.parse(JSON.parse(raw));
    } catch {
      throw new Error("The planner returned an unusable plan. Try again.");
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
