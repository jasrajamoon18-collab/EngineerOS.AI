import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { awardXp } from "@/lib/progress";
import { aptitudeAttemptsQuery, aptitudeQuestionsQuery, profileQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/aptitude")({
  head: () => ({
    meta: [
      { title: "Aptitude Drills — EngineerOS" },
      {
        name: "description",
        content:
          "Quantitative, logical and verbal practice questions with worked explanations for placement tests.",
      },
      { property: "og:title", content: "Aptitude Drills — EngineerOS" },
      {
        property: "og:description",
        content: "Placement-style aptitude practice with explanations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AptitudePage,
});

function parseOptions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item));
}

function AptitudePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: questions = [] } = useQuery(aptitudeQuestionsQuery());
  const { data: attempts = [] } = useQuery(aptitudeAttemptsQuery(user?.id));
  const { data: profile } = useQuery(profileQuery(user?.id));
  const [topic, setTopic] = useState<string>("all");
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const topics = ["all", ...new Set(questions.map((q) => q.topic))];
  const visible = topic === "all" ? questions : questions.filter((q) => q.topic === topic);

  const answered = new Set(attempts.map((a) => a.question_id));
  const correct = attempts.filter((a) => a.is_correct).length;
  const accuracy = attempts.length ? Math.round((correct / attempts.length) * 100) : 0;

  async function submit(questionId: string, answerIndex: number) {
    if (!user) return;
    const chosen = selected[questionId];
    if (chosen === undefined) {
      toast.error("Pick an option first.");
      return;
    }
    const isCorrect = chosen === answerIndex;
    const { error } = await supabase.from("aptitude_attempts").insert({
      user_id: user.id,
      question_id: questionId,
      chosen_index: chosen,
      is_correct: isCorrect,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setRevealed((prev) => ({ ...prev, [questionId]: true }));
    if (isCorrect) {
      await awardXp(user.id, profile, 10);
      await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success("+10 XP · correct");
    } else {
      toast("Recorded — read the explanation before retrying.");
    }
    await queryClient.invalidateQueries({ queryKey: ["aptitude-attempts", user.id] });
  }

  return (
    <>
      <PageHeader
        eyebrow="Placement"
        title="Aptitude & Placement Drills"
        description="Written by us, not scraped from any test provider. Every question shows its reasoning so you learn the method, not the answer."
        actions={
          <div className="min-w-[200px]">
            <p className="label-mono text-muted-foreground">
              {answered.size}/{questions.length} attempted · {accuracy}% accuracy
            </p>
            <Progress
              className="mt-2 h-1.5"
              value={questions.length ? (answered.size / questions.length) * 100 : 0}
            />
          </div>
        }
      />

      <Alert className="mb-8">
        <AlertTitle>Practice, not a proctored test</AlertTitle>
        <AlertDescription>
          These drills are untimed and self-paced. Your accuracy here is a study signal only — it is
          not a score any company sees or a prediction of test results.
        </AlertDescription>
      </Alert>

      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
        {topics.map((item) => (
          <Button
            key={item}
            size="sm"
            variant={topic === item ? "default" : "outline"}
            aria-pressed={topic === item}
            onClick={() => setTopic(item)}
          >
            {item}
          </Button>
        ))}
      </div>

      <ul className="space-y-4">
        {visible.map((question) => {
          const options = parseOptions(question.options);
          const show = revealed[question.id];
          const previous = attempts.filter((a) => a.question_id === question.id);
          return (
            <li key={question.id} className="panel p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="label-mono">
                  {question.topic}
                </Badge>
                <Badge variant="outline" className="label-mono">
                  {question.level}
                </Badge>
                {previous.length ? (
                  <Badge variant="secondary" className="label-mono">
                    {previous.filter((a) => a.is_correct).length}/{previous.length} correct
                  </Badge>
                ) : null}
              </div>
              <p className="mt-3 text-sm font-medium">{question.question}</p>

              <fieldset className="mt-4 space-y-2">
                <legend className="sr-only">Options for: {question.question}</legend>
                {options.map((option, index) => {
                  const isChosen = selected[question.id] === index;
                  const isAnswer = index === question.answer_index;
                  return (
                    <label
                      key={option}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 text-sm transition-colors",
                        isChosen && "border-primary bg-primary/5",
                        show && isAnswer && "border-primary bg-primary/10",
                        show && isChosen && !isAnswer && "border-destructive bg-destructive/10",
                      )}
                    >
                      <input
                        type="radio"
                        className="mt-1"
                        name={`q-${question.id}`}
                        checked={isChosen}
                        onChange={() => setSelected((prev) => ({ ...prev, [question.id]: index }))}
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </fieldset>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => submit(question.id, question.answer_index)}>
                  Check answer
                </Button>
                {show ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setRevealed((prev) => ({ ...prev, [question.id]: false }));
                      setSelected((prev) => {
                        const next = { ...prev };
                        delete next[question.id];
                        return next;
                      });
                    }}
                  >
                    Try again
                  </Button>
                ) : null}
              </div>

              {show ? (
                <div className="mt-4 rounded-lg border border-border bg-muted/40 p-4 text-sm">
                  <p className="label-mono text-primary">Why</p>
                  <p className="mt-2 text-muted-foreground">{question.explanation}</p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}
