import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  GraduationCap,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Mic,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { CheckList } from "@/components/check-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const [mainView, setMainView] = useState<"rounds" | "viva">("rounds");
  const [vivaSubject, setVivaSubject] = useState("Distributed Task Queue with Redis & Go");
  const [vivaQuestions, setVivaQuestions] = useState<
    Array<{
      question: string;
      examinerIntent: string;
      modelAnswer: string;
      trapFollowUp: string;
    }>
  >([
    {
      question:
        "How do you guarantee that a message is not processed twice during a network partition?",
      examinerIntent:
        "Testing whether the student understands exactly-once vs at-least-once semantics and idempotency keys.",
      modelAnswer:
        "We implement at-least-once delivery with an idempotency key stored in Redis with an atomic SETNX lock and a 10-minute TTL. Before executing the worker task, the consumer checks if the UUID has already been acknowledged.",
      trapFollowUp:
        "What happens if the worker crashes AFTER setting the lock but BEFORE completing the database transaction?",
    },
    {
      question: "Why did you choose Redis over RabbitMQ or Apache Kafka for this architecture?",
      examinerIntent:
        "Checking if candidate made a conscious architectural trade-off or just picked what was familiar.",
      modelAnswer:
        "Our queue throughput requirement was ~5,000 tasks/min with strict sub-millisecond dispatch latency. Redis Streams gave us minimal operational overhead and in-memory speed without running a JVM cluster like Kafka. However, Kafka would be superior if we required replayable multi-day message retention.",
      trapFollowUp:
        "What happens to your queued tasks if the Redis server runs out of RAM or restarts without RDB/AOF persistence enabled?",
    },
    {
      question: "Explain the time and space complexity of your core scheduling algorithm.",
      examinerIntent:
        "Checking fundamental computer science grounding applied to practical systems.",
      modelAnswer:
        "Task prioritization uses a min-heap indexed by Unix epoch deadline timestamp. Inserting or updating a task takes O(log N) time, while extracting the next imminent deadline takes O(1) peek and O(log N) pop. Space complexity is O(N) where N is the maximum queued task capacity.",
      trapFollowUp:
        "Can you optimize this to O(1) if deadlines are quantized into fixed 1-second intervals?",
    },
  ]);
  const [isGeneratingViva, setIsGeneratingViva] = useState(false);

  function handleGenerateViva(customSubject?: string) {
    const subj = customSubject || vivaSubject;
    setIsGeneratingViva(true);
    setTimeout(() => {
      setVivaQuestions([
        {
          question: `What is the primary architectural bottleneck in your "${subj}" implementation under 10x traffic?`,
          examinerIntent: "Evaluating scalability awareness and bottleneck profiling techniques.",
          modelAnswer:
            "Under 10x traffic, the single-node database connection pool exhausts available socket handles. We mitigate this using read-replicas, connection pooling via PgBouncer, and caching hot query paths.",
          trapFollowUp: "How do you handle stale cache invalidation when concurrent updates occur?",
        },
        {
          question: `Walk me through your database schema normalization and index design for ${subj}.`,
          examinerIntent: "Testing whether relational modeling was intentional or arbitrary.",
          modelAnswer:
            "The schema is designed in 3rd Normal Form (3NF) to eliminate update anomalies. Composite indexes are created on (user_id, created_at DESC) to ensure our primary dashboard query runs via index-scan rather than full-table sequential scan.",
          trapFollowUp: "Why wouldn't you index every single column to make all searches fast?",
        },
        {
          question: `If an external auditor reviewed your codebase tomorrow, what security vulnerability would they flag first?`,
          examinerIntent: "Assessing engineering maturity, humility, and security mindfulness.",
          modelAnswer:
            "We audited against OWASP Top 10: parameterized queries prevent SQL injection, but rate-limiting on unauthenticated public endpoints was our weakest link. We subsequently added a token-bucket rate limiter.",
          trapFollowUp:
            "How does token bucket differ from sliding-window counter in high-burst DDoS traffic?",
        },
      ]);
      setIsGeneratingViva(false);
      toast.success("New viva defense questions generated!");
    }, 600);
  }

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

      <div className="flex gap-2 mb-6">
        <Button
          variant={mainView === "rounds" ? "default" : "outline"}
          size="sm"
          onClick={() => setMainView("rounds")}
          className="text-xs gap-1.5"
        >
          <Mic className="h-3.5 w-3.5" />
          Job & Placement Rounds
        </Button>
        <Button
          variant={mainView === "viva" ? "default" : "outline"}
          size="sm"
          onClick={() => setMainView("viva")}
          className="text-xs gap-1.5"
        >
          <GraduationCap className="h-3.5 w-3.5" />
          Viva Defense & Lab Exam Simulator
        </Button>
      </div>

      {mainView === "viva" ? (
        <div className="space-y-6">
          <section className="panel p-6 border-primary/20 bg-primary/5 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold">Academic & Project Viva Simulator</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              External examiners probe deep into architectural choices, theoretical complexities,
              failure modes, and trade-offs. Prepare with realistic questions and anticipated
              examiner trap follow-ups.
            </p>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Your Project or Lab Subject Name</Label>
              <div className="flex gap-2">
                <Input
                  value={vivaSubject}
                  onChange={(e) => setVivaSubject(e.target.value)}
                  placeholder="e.g. Distributed Task Queue, Operating Systems Lab, Mini Compiler"
                  className="h-9 text-xs bg-background"
                />
                <Button
                  onClick={() => handleGenerateViva()}
                  disabled={isGeneratingViva}
                  className="h-9 text-xs gap-1.5 shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {isGeneratingViva ? "Generating…" : "Generate Viva Questions"}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-muted-foreground mr-1 self-center">
                Quick Select:
              </span>
              {[
                "Capstone Engineering Project",
                "Operating Systems Lab (Paging & Banker's)",
                "Data Structures Lab (AVL & Graphs)",
                "Computer Networks Lab (Socket Programming)",
                "DBMS Lab (3NF Normalization & Triggers)",
              ].map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] bg-background"
                  onClick={() => {
                    setVivaSubject(preset);
                    handleGenerateViva(preset);
                  }}
                >
                  {preset}
                </Button>
              ))}
            </div>
          </section>

          <div className="space-y-4">
            {vivaQuestions.map((vq, idx) => (
              <article key={idx} className="panel p-5 border-border space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-border pb-2.5">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4" />
                    Viva Question {idx + 1}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    External Examiner Probe
                  </Badge>
                </div>

                <h3 className="text-sm font-semibold text-foreground leading-relaxed">
                  "{vq.question}"
                </h3>

                <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs space-y-1">
                  <span className="font-semibold text-muted-foreground flex items-center gap-1 text-[11px]">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    What the Examiner is Evaluating:
                  </span>
                  <p className="text-muted-foreground leading-relaxed text-[11px]">
                    {vq.examinerIntent}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-surface border border-border text-xs space-y-1">
                  <span className="font-semibold text-primary flex items-center gap-1 text-[11px]">
                    <Lightbulb className="h-3.5 w-3.5" />
                    Model Engineering Answer:
                  </span>
                  <p className="text-foreground leading-relaxed text-xs">{vq.modelAnswer}</p>
                </div>

                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                  <span className="font-semibold text-amber-500 flex items-center gap-1 text-[11px]">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Anticipated Examiner Trap Follow-Up:
                  </span>
                  <p className="text-foreground/90 leading-relaxed text-xs italic">
                    "{vq.trapFollowUp}"
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <>
          <Alert className="mb-6">
            <AlertTitle>No hiring prediction, no voice interview</AlertTitle>
            <AlertDescription>
              Checks below apply a fixed rubric — length, ownership language, evidence, keywords,
              STAR structure, trade-offs. They cannot predict whether you would pass a real
              interview. Voice and video mock interviews are not built; they would need an external
              service and your explicit consent, and we will not pretend otherwise.
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
                <section
                  key={question.id}
                  className="panel p-5"
                  aria-labelledby={`q-${question.id}`}
                >
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
                        value={String(
                          ratings[question.id] ?? answerFor(question.id)?.self_rating ?? 3,
                        )}
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
      )}
    </>
  );
}
