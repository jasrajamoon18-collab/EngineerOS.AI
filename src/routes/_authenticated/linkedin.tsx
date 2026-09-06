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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { awardXp } from "@/lib/progress";
import { analyseLinkedInDraft } from "@/lib/career";
import { linkedinDraftsQuery, linkedinSectionsQuery, profileQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/linkedin")({
  head: () => ({
    meta: [
      { title: "LinkedIn Career Center — EngineerOS" },
      {
        name: "description",
        content:
          "Draft and self-assess every LinkedIn section with transparent writing checks. EngineerOS never connects to or edits your LinkedIn account.",
      },
      { property: "og:title", content: "LinkedIn Career Center — EngineerOS" },
      {
        property: "og:description",
        content: "Section-by-section LinkedIn drafting with honest, rule-based writing feedback.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LinkedInPage,
});

function checklistItems(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean);
}

function LinkedInPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: sections = [] } = useQuery(linkedinSectionsQuery());
  const { data: drafts = [] } = useQuery(linkedinDraftsQuery(user?.id));
  const { data: profile } = useQuery(profileQuery(user?.id));

  const [text, setText] = useState<Record<string, string>>({});
  const [rating, setRating] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  function draftFor(key: string) {
    return drafts.find((d) => d.section_key === key);
  }

  function valueFor(key: string) {
    return text[key] ?? draftFor(key)?.draft_text ?? "";
  }

  async function save(sectionKey: string) {
    if (!user) return;
    const body = valueFor(sectionKey).trim();
    if (body.length < 10) {
      toast.error("Write at least a sentence before saving.");
      return;
    }
    setSaving(sectionKey);
    const existing = draftFor(sectionKey);
    const selfRating = Number(rating[sectionKey] ?? existing?.self_rating ?? 3);
    const payload = { draft_text: body, self_rating: selfRating };
    const { error } = existing
      ? await supabase.from("linkedin_drafts").update(payload).eq("id", existing.id)
      : await supabase
          .from("linkedin_drafts")
          .insert({ ...payload, user_id: user.id, section_key: sectionKey });
    setSaving(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!existing) {
      await awardXp(user.id, profile, 10);
      await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success("+10 XP · section drafted");
    } else {
      toast.success("Draft saved");
    }
    await queryClient.invalidateQueries({ queryKey: ["linkedin-drafts", user.id] });
  }

  const drafted = new Set(drafts.map((d) => d.section_key));

  return (
    <>
      <PageHeader
        eyebrow="Career center"
        title="LinkedIn Career Center"
        description="Write each section here, check it against transparent writing rules, then paste the version you like into LinkedIn yourself."
        actions={
          <p className="label-mono text-muted-foreground">
            {drafted.size}/{sections.length} sections drafted
          </p>
        }
      />

      <Alert className="mb-8">
        <AlertTitle>Your LinkedIn account is not connected</AlertTitle>
        <AlertDescription>
          EngineerOS cannot read, post to, or edit any LinkedIn profile. There is no LinkedIn API
          integration here — drafts live only in your account, and you copy them across manually.
          The feedback below is a fixed set of writing rules, not a recruiter simulation.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        {sections.map((section) => {
          const body = valueFor(section.key);
          const checks = body.trim() ? analyseLinkedInDraft(section.key, body) : [];
          const items = checklistItems(section.checklist);
          return (
            <section key={section.id} className="panel p-5" aria-labelledby={`sec-${section.key}`}>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id={`sec-${section.key}`} className="text-base font-semibold">
                  {section.title}
                </h2>
                {drafted.has(section.key) ? (
                  <Badge variant="secondary" className="label-mono">
                    drafted
                  </Badge>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{section.guidance}</p>

              {items.length ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}

              {section.example_weak || section.example_strong ? (
                <Accordion type="single" collapsible className="mt-3">
                  <AccordionItem value="examples">
                    <AccordionTrigger className="text-sm">Compare two examples</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      {section.example_weak ? (
                        <p className="rounded-md bg-muted p-3 text-sm">
                          <span className="label-mono text-destructive">Weak · </span>
                          {section.example_weak}
                        </p>
                      ) : null}
                      {section.example_strong ? (
                        <p className="rounded-md bg-muted p-3 text-sm">
                          <span className="label-mono text-primary">Stronger · </span>
                          {section.example_strong}
                        </p>
                      ) : null}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : null}

              <div className="mt-4 space-y-2">
                <Label htmlFor={`draft-${section.key}`}>Your draft</Label>
                <Textarea
                  id={`draft-${section.key}`}
                  rows={5}
                  value={body}
                  placeholder="Write it in your own words."
                  onChange={(event) =>
                    setText((prev) => ({ ...prev, [section.key]: event.target.value }))
                  }
                />
              </div>

              <div className="mt-3 flex flex-wrap items-end gap-3">
                <div className="w-48">
                  <Label htmlFor={`rating-${section.key}`}>How happy are you with it?</Label>
                  <Select
                    value={String(rating[section.key] ?? draftFor(section.key)?.self_rating ?? 3)}
                    onValueChange={(value) =>
                      setRating((prev) => ({ ...prev, [section.key]: value }))
                    }
                  >
                    <SelectTrigger id={`rating-${section.key}`} className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <SelectItem key={value} value={String(value)}>
                          {value} / 5
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => save(section.key)} disabled={saving === section.key}>
                  {saving === section.key ? "Saving…" : "Save draft"}
                </Button>
              </div>

              <CheckList checks={checks} label="Writing rules applied to this draft" />
            </section>
          );
        })}
      </div>
    </>
  );
}
