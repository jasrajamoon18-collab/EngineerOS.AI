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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import type { Json } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { awardXp } from "@/lib/progress";
import { analyseInterviewAnswer } from "@/lib/career";
import { interviewAnswersQuery, interviewQuestionsQuery, profileQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/interview")({
  head: () => ({
    meta: [
      { title: "Interview Academy — EngineerOS" },
      {
        name: "description",
        content:
          "Practise HR, behavioural and technical interview answers in text, save them, and check them against transparent criteria.",
      },
      { property: "og:title", content: "Interview Academy — EngineerOS" },
      {
        property: "og:description",
        content: "Text mock interviews with stored answers and rule-based, explainable feedback.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InterviewPage,
});

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean);
}

function InterviewPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: questions = [] } = useQuery(interviewQuestionsQuery());
  const { data: answers = [] } = useQuery(interviewAnswersQuery(user?.id));
  const { data: profile } = useQuery(profileQuery(user?.id));

  const tracks = [...new Set(questions.map((q) => q.track))];
  const [track, setTrack] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [ratings, setRatings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const activeTrack = track ?? tracks[0] ?? "";
  const visible = questions.filter((q) => q.track === activeTrack);
  const answered = new Set(answers.map((a) => a.question_id));

  function answerFor(id: string) {
    return answers.find((a) => a.question_id === id);
  }
  function textFor(id: string) {
    return drafts[id] ?? answerFor(id)?.answer_text ?? "";
  }

  async function save(questionId: string, keywords: string[]) {
    if (!user) return;
    const text = textFor(questionId).trim();
    if (text.length < 40) {
      toast.error("Write a full answer before saving — at least a few sentences.");
      return;
    }
    setSaving(questionId);
    const checks = analyseInterviewAnswer({ text, track: activeTrack, keywords });
    const existing = answerFor(questionId);
    const selfRating = Number(ratings[questionId] ?? existing?.self_rating ?? 3);
    const payload = {
      answer_text: text,
      checks: checks as unknown as Json,
      self_rating: selfRating,
    };
    const { error } = existing
      ? await supabase.from("interview_answers").update(payload).eq("id", existing.id)
      : await supabase
          .from("interview_answers")
          .insert({ ...payload, user_id: user.id, question_id: questionId });
    setSaving(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!existing) {
      await awardXp(user.id, profile, 20);
      await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success("+20 XP · answer saved");
    } else {
      toast.success("Answer updated");
    }
    await queryClient.invalidateQueries({ queryKey: ["interview-answers", user.id] });
  }

  return (
    <>
      <PageHeader
        eyebrow="Placement prep"
        title="Interview Academy"
        description="Write your answers out first. Anything you cannot write clearly, you cannot say clearly under pressure."
        actions={
          <p className="label-mono text-muted-foreground">
            {answered.size}/{questions.length} questions answered
          </p>
        }
      />

      <Alert className="mb-6">
        <AlertTitle>No hiring prediction, no voice interview</AlertTitle>
        <AlertDescription>
          Checks below apply a fixed rubric — length, ownership language, evidence, keywords,
          STAR structure, trade-offs. They cannot predict whether you would pass a real interview.
          Voice and video mock interviews are not built; they would need an external service and
          your explicit consent, and we will not pretend otherwise.
        </AlertDescription>
      </Alert>

      {tracks.length ? (
        <Tabs value={activeTrack} onValueChange={setTrack} className="mb-6">
          <TabsList className="flex-wrap">
            {tracks.map((item) => (
              <TabsTrigger key={item} value={item} className="capitalize">
                {item}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ) : null}

      <div className="space-y-6">
        {visible.map((question) => {
          const keywords = stringList(question.keywords);
          const criteria = stringList(question.criteria);
          const strongPoints = stringList(question.strong_answer_points);
          const text = textFor(question.id);
          const checks = text.trim()
            ? analyseInterviewAnswer({ text, track: activeTrack, keywords })
            : [];
          return (
            <section key={question.id} className="panel p-5" aria-labelledby={`q-${question.id}`}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="label-mono">
                  {question.level}
                </Badge>
                {answered.has(question.id) ? (
                  <Badge variant="secondary" className="label-mono">
                    answered
                  </Badge>
                ) : null}
              </div>
              <h2 id={`q-${question.id}`} className="mt-2 text-base font-semibold">
                {question.question}
              </h2>
              {question.context ? (
                <p className="mt-2 text-sm text-muted-foreground">{question.context}</p>
              ) : null}

              {criteria.length ? (
                <div className="mt-3">
                  <p className="label-mono text-muted-foreground">What is being assessed</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {criteria.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-4 space-y-2">
                <Label htmlFor={`answer-${question.id}`}>Your answer</Label>
                <Textarea
                  id={`answer-${question.id}`}
                  rows={8}
                  value={text}
                  placeholder="Answer as you would out loud, in full sentences."
                  onChange={(event) =>
                    setDrafts((prev) => ({ ...prev, [question.id]: event.target.value }))
                  }
                />
              </div>

              <div className="mt-3 flex flex-wrap items-end gap-3">
                <div className="w-48">
                  <Label htmlFor={`rate-${question.id}`}>Your own confidence</Label>
                  <Select
                    value={String(ratings[question.id] ?? answerFor(question.id)?.self_rating ?? 3)}
                    onValueChange={(value) =>
                      setRatings((prev) => ({ ...prev, [question.id]: value }))
                    }
                  >
                    <SelectTrigger id={`rate-${question.id}`} className="mt-2">
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
                <Button
                  onClick={() => save(question.id, keywords)}
                  disabled={saving === question.id}
                >
                  {saving === question.id ? "Saving…" : "Save answer"}
                </Button>
              </div>

              <CheckList checks={checks} label="Rubric applied to your answer" />

              {strongPoints.length ? (
                <Accordion type="single" collapsible className="mt-4">
                  <AccordionItem value="points">
                    <AccordionTrigger className="text-sm">
                      Show what a strong answer usually covers
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {strongPoints.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : null}
            </section>
          );
        })}
      </div>
    </>
  );
}
