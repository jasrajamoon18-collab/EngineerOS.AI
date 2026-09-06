import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { CheckList } from "@/components/check-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { awardXp } from "@/lib/progress";
import { analyseCommunication, wordCount } from "@/lib/career";
import {
  communicationEntriesQuery,
  communicationPromptsQuery,
  profileQuery,
} from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/communication")({
  head: () => ({
    meta: [
      { title: "Communication Academy — EngineerOS" },
      {
        name: "description",
        content:
          "Short daily writing and speaking drills for engineers, with transparent rule-based feedback on clarity, structure and filler words.",
      },
      { property: "og:title", content: "Communication Academy — EngineerOS" },
      {
        property: "og:description",
        content: "Daily communication drills with honest, rule-based writing feedback.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CommunicationPage,
});

function CommunicationPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: prompts = [] } = useQuery(communicationPromptsQuery());
  const { data: entries = [] } = useQuery(communicationEntriesQuery(user?.id));
  const { data: profile } = useQuery(profileQuery(user?.id));

  const [activeId, setActiveId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const categories = [...new Set(prompts.map((p) => p.category))];
  const active = prompts.find((p) => p.id === activeId) ?? prompts[0];
  const doneIds = new Set(entries.map((e) => e.prompt_id));
  const checks = active && text.trim() ? analyseCommunication(text, active.min_words) : [];

  async function submit() {
    if (!user || !active) return;
    if (wordCount(text) < 20) {
      toast.error("Write at least 20 words so the checks mean something.");
      return;
    }
    setSaving(true);
    const feedback = analyseCommunication(text, active.min_words);
    const { error } = await supabase.from("communication_entries").insert({
      user_id: user.id,
      prompt_id: active.id,
      response_text: text,
      word_count: wordCount(text),
      feedback: feedback as unknown as Json,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await awardXp(user.id, profile, 15);
    await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    await queryClient.invalidateQueries({ queryKey: ["communication-entries", user.id] });
    toast.success("+15 XP · drill logged");
    setText("");
  }

  return (
    <>
      <PageHeader
        eyebrow="Soft skills"
        title="Communication Academy"
        description="Ten-minute drills on the writing engineers actually do: standups, incident notes, explaining a design, asking for help."
        actions={
          <p className="label-mono text-muted-foreground">
            {doneIds.size}/{prompts.length} prompts attempted
          </p>
        }
      />

      <Alert className="mb-8">
        <AlertTitle>This is a writing checker, not a language examiner</AlertTitle>
        <AlertDescription>
          Feedback comes from a fixed list of rules — length, sentence size, filler words, whether
          you used a concrete example. It cannot judge whether your idea is correct or how a human
          would react. Disagree with a rule when you have a reason to.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <nav aria-label="Prompts" className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <p className="label-mono mb-2 text-primary">{category}</p>
              <ul className="space-y-1">
                {prompts
                  .filter((p) => p.category === category)
                  .map((prompt) => (
                    <li key={prompt.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveId(prompt.id);
                          setText("");
                        }}
                        aria-current={active?.id === prompt.id ? "true" : undefined}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          active?.id === prompt.id
                            ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                            : "text-muted-foreground hover:bg-sidebar-accent/60"
                        }`}
                      >
                        <span className="flex-1">{prompt.title}</span>
                        {doneIds.has(prompt.id) ? (
                          <Badge variant="secondary" className="label-mono">
                            done
                          </Badge>
                        ) : null}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </nav>

        {active ? (
          <section className="panel p-5" aria-labelledby="active-prompt">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="active-prompt" className="text-base font-semibold">
                {active.title}
              </h2>
              <Badge variant="outline" className="label-mono">
                {active.minutes} min
              </Badge>
              <Badge variant="outline" className="label-mono">
                {active.min_words}+ words
              </Badge>
            </div>
            <p className="mt-3 text-sm">{active.prompt}</p>
            <p className="mt-3 rounded-md bg-muted p-3 text-sm text-muted-foreground">
              <span className="label-mono text-accent">Guidance · </span>
              {active.guidance}
            </p>

            <div className="mt-4 space-y-2">
              <Label htmlFor="response">Your response</Label>
              <Textarea
                id="response"
                rows={10}
                value={text}
                placeholder="Write as if a teammate will read it tomorrow morning."
                onChange={(event) => setText(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">{wordCount(text)} words</p>
            </div>

            <Button className="mt-3" onClick={submit} disabled={saving}>
              {saving ? "Saving…" : "Save & check"}
            </Button>

            <CheckList checks={checks} label="Live rule check" />

            <div className="mt-6">
              <h3 className="label-mono mb-2 text-muted-foreground">Your past attempts</h3>
              {entries.filter((e) => e.prompt_id === active.id).length === 0 ? (
                <p className="text-sm text-muted-foreground">No attempts logged for this prompt.</p>
              ) : (
                <ul className="space-y-3">
                  {entries
                    .filter((e) => e.prompt_id === active.id)
                    .map((entry) => (
                      <li key={entry.id} className="rounded-md border border-border p-3">
                        <p className="label-mono text-muted-foreground">
                          {new Date(entry.created_at).toLocaleString()} · {entry.word_count} words
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm">{entry.response_text}</p>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
