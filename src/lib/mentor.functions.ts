import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  yearLevel: z.enum(["1", "2", "3"]).default("2"),
});

const YEAR_PROMPTS: Record<string, string> = {
  "1": "Target Audience: 1st Year Engineering Student. Use clear, intuitive real-world analogies. Break down intimidating jargon before using it. Focus on building mental models and curiosity without overwhelming mathematical formalisms.",
  "2": "Target Audience: 2nd Year Engineering Student. Connect concepts to core engineering curricula (Data Structures, OS, Digital Logic). Emphasize memory layouts, time and space complexity, and how hardware executes software.",
  "3": "Target Audience: 3rd / 4th Year Engineering Student (Placement Candidate). Discuss real-world production trade-offs, edge cases, concurrency, scalability, and how top tech interviewers evaluate candidates.",
};

const SYSTEM_PROMPT = `You are the EngineerOS AI Mentor for engineering students.
Be direct, practical and encouraging. Prefer concrete next steps over motivational filler.
When a student is vague, ask one clarifying question, then give a plan.
Recommend the student's own EngineerOS areas when relevant: Learn (courses), Programming Academy,
Linux Academy, DSA Practice, Code Lab, SQL Lab, Project Lab, Interview Academy.
Never invent jobs, certifications, deadlines or external services.
Keep answers under 280 words unless the student asks for depth. Use markdown.`;

export const askMentor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const userId = context.userId;

    const existing = await supabase
      .from("mentor_conversations")
      .select("id")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existing.error) throw new Error(existing.error.message);

    let conversationId = existing.data?.id;
    if (!conversationId) {
      const created = await supabase
        .from("mentor_conversations")
        .insert({ user_id: userId, title: data.message.slice(0, 60) })
        .select("id")
        .single();
      if (created.error) throw new Error(created.error.message);
      conversationId = created.data.id;
    }

    const history = await supabase
      .from("mentor_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(20);
    if (history.error) throw new Error(history.error.message);

    const profile = await supabase
      .from("profiles")
      .select("full_name, branch_slug, academic_year, career_goal, xp, streak_count")
      .eq("id", userId)
      .maybeSingle();

    const yearInstruction = YEAR_PROMPTS[data.yearLevel] || YEAR_PROMPTS["2"];
    const contextLine = profile.data
      ? `Student context — branch: ${profile.data.branch_slug ?? "unknown"}, student profile year: ${
          profile.data.academic_year ?? "unknown"
        }, goal: ${profile.data.career_goal ?? "unknown"}, XP: ${profile.data.xp}, streak: ${
          profile.data.streak_count
        } days.\n[EXPLANATION LEVEL SELECTED: Year ${data.yearLevel} — ${yearInstruction}]`
      : `[EXPLANATION LEVEL SELECTED: Year ${data.yearLevel} — ${yearInstruction}]`;

    let reply = "";
    const geminiKey = process.env["GEMINI_API_KEY"];
    const lovableKey = process.env["LOVABLE_API_KEY"];

    // 1. Try Google Gemini API
    if (geminiKey) {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const chatContents = [
          { role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n${contextLine}` }] },
          ...(history.data ?? []).map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          { role: "user", parts: [{ text: data.message }] },
        ];

        type GenerateContentParams = Parameters<typeof ai.models.generateContent>[0];
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: chatContents as unknown as GenerateContentParams["contents"],
        });

        reply = response.text?.trim() || "";
      } catch (err) {
        console.warn("[EngineerOS] Gemini error in askMentor, trying gateway:", err);
      }
    }

    // 2. Try Lovable AI gateway
    if (!reply && lovableKey) {
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${lovableKey}` },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: `${SYSTEM_PROMPT}\n${contextLine}` },
              ...(history.data ?? []).map((m) => ({ role: m.role, content: m.content })),
              { role: "user", content: data.message },
            ],
          }),
        });

        if (response.ok) {
          const payload = (await response.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          reply = payload.choices?.[0]?.message?.content ?? "";
        }
      } catch {
        // Fall back
      }
    }

    // 3. Pedagogical Fallback
    if (!reply) {
      const year = data.yearLevel;
      if (year === "1") {
        reply = `Here is how to think about this from first principles:\n\nImagine your computer as a fast, obedient kitchen assistant. Variables are labeled storage bins, functions are standard recipes, and algorithms are the order of operations.\n\n**Next action step:** Jump into our **Programming Academy** and test this concept in Code Lab with a tiny 5-line script!`;
      } else if (year === "3") {
        reply = `From a systems and hiring bar perspective, here are the architectural trade-offs you need to know:\n\n1. **Time/Space Trade-offs**: In high-throughput systems, caching speeds up reads at the cost of eventual consistency.\n2. **Interview Delivery**: Structure your explanation using the STAR framework or stating constraints upfront.\n\n**Next action step:** Review the question in **Interview Academy** and verify your time complexity in Code Lab.`;
      } else {
        reply = `Great question. Let's break this down into verifiable engineering components:\n\n1. **Core Concept**: Connect this to the fundamental data structure or OS primitive underneath.\n2. **Practical Application**: Notice where this prevents bugs or optimizes runtime.\n\n**Next step:** Work through the corresponding module in **Learn** and solve 1 related problem in **DSA Practice**.`;
      }
    }

    await supabase.from("mentor_messages").insert([
      { conversation_id: conversationId, user_id: userId, role: "user", content: data.message },
      { conversation_id: conversationId, user_id: userId, role: "assistant", content: reply },
    ]);

    await supabase
      .from("mentor_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return { reply };
  });

export interface MentorNudge {
  id: string;
  topic: string;
  message: string;
  actionRoute: string;
  actionLabel: string;
  badge: string;
}

export const getMentorNudges = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ nudges: MentorNudge[] }> => {
    const supabase = context.supabase;
    const userId = context.userId;

    const profile = await supabase
      .from("profiles")
      .select("streak_count, xp, last_active_date")
      .eq("id", userId)
      .maybeSingle();

    const streak = profile.data?.streak_count ?? 0;

    const nudges: MentorNudge[] = [
      {
        id: "nudge-linux",
        topic: "Linux & Shell Mastery",
        message:
          "You haven't touched Linux file permissions & piping drill in 4 days. Quick 10 min session today?",
        actionRoute: "/linux",
        actionLabel: "Open Linux Academy",
        badge: "Recommended Review",
      },
      {
        id: "nudge-dsa-streak",
        topic: "Algorithm Consistency",
        message:
          streak > 0
            ? `You're on a ${streak}-day streak! Solve 1 Two-Pointers problem to lock in your daily +35 XP.`
            : "Your streak is reset. Complete a quick recovery mission to reactivate your streak today!",
        actionRoute: "/dsa",
        actionLabel: "Solve DSA Challenge",
        badge: streak > 0 ? "Maintain Streak" : "Streak Recovery",
      },
      {
        id: "nudge-interview",
        topic: "Placement Readiness",
        message:
          "Ready for your weekly check-in? Take a 5-minute AI Mock Interview to benchmark your technical depth.",
        actionRoute: "/interview",
        actionLabel: "Start Mock Interview",
        badge: "Hiring Prep",
      },
    ];

    return { nudges };
  });
