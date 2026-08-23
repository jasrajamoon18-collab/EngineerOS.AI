import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SYSTEM_PROMPT = `You are the EngineerOS AI Mentor for engineering students.
Be direct, practical and encouraging. Prefer concrete next steps over motivational filler.
When a student is vague, ask one clarifying question, then give a plan.
Recommend the student's own EngineerOS areas when relevant: Learn (courses), Programming Academy,
Linux Academy, DSA Practice, Daily Tasks. Never invent jobs, certifications, deadlines or
external services. Never claim you can run their code — tell them to run it locally.
Keep answers under 250 words unless the student asks for depth. Use markdown.`;

const inputSchema = z.object({
  message: z.string().trim().min(1).max(2000),
});

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

    const contextLine = profile.data
      ? `Student context — branch: ${profile.data.branch_slug ?? "unknown"}, year: ${
          profile.data.academic_year ?? "unknown"
        }, goal: ${profile.data.career_goal ?? "unknown"}, XP: ${profile.data.xp}, streak: ${
          profile.data.streak_count
        } days.`
      : "Student context unavailable.";

    const insertUser = await supabase.from("mentor_messages").insert({
      conversation_id: conversationId,
      user_id: userId,
      role: "user",
      content: data.message,
    });
    if (insertUser.error) throw new Error(insertUser.error.message);

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return { reply: "The AI Mentor is not configured right now. Please try again later." };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: `${SYSTEM_PROMPT}\n\n${contextLine}` },
          ...(history.data ?? []).map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: data.message },
        ],
      }),
    });

    if (response.status === 429) {
      return { reply: "You've hit the mentor rate limit. Wait a minute and ask again." };
    }
    if (response.status === 402) {
      return { reply: "AI credits are exhausted for this workspace. Top up to keep mentoring." };
    }
    if (!response.ok) {
      console.error("AI gateway error", response.status, await response.text());
      throw new Error("The AI Mentor is temporarily unavailable.");
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = payload.choices?.[0]?.message?.content?.trim() || "I couldn't answer that one.";

    const insertAssistant = await supabase.from("mentor_messages").insert({
      conversation_id: conversationId,
      user_id: userId,
      role: "assistant",
      content: reply,
    });
    if (insertAssistant.error) throw new Error(insertAssistant.error.message);

    await supabase
      .from("mentor_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return { reply };
  });
