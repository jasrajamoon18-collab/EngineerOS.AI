import { useState, useRef, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bookmark,
  BookmarkCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Mic,
  MicOff,
  Plus,
  Send,
  ShieldAlert,
  Sparkles,
  Trophy,
  Users,
  XCircle,
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
import { useAuth } from "@/hooks/useAuth";
import { awardXp } from "@/lib/progress";
import { analyseInterviewAnswer } from "@/lib/career";
import { interviewAnswersQuery, interviewQuestionsQuery, profileQuery } from "@/lib/queries";
import {
  COMPANY_QUESTION_BANK,
  getBookmarkedQuestionIds,
  toggleQuestionBookmark,
  getRevisionReminders,
  setRevisionReminder,
  type CompanyQuestion,
} from "@/lib/company-questions";
import { evaluateMockAnswerAction, type MockAnswerEvaluation } from "@/lib/ai-assistant.functions";

export const Route = createFileRoute("/_authenticated/interview")({
  head: () => ({
    meta: [
      { title: "Interview Academy & AI Mock Sessions — EngineerOS" },
      {
        name: "description",
        content:
          "Voice & text AI mock interviews, company question banks with revision reminders, and automated weak-area logging into your learning plan.",
      },
      { property: "og:title", content: "Interview Academy — EngineerOS" },
      {
        property: "og:description",
        content:
          "Practice mock interview rounds with real-time feedback and company question banks.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InterviewPage,
});

const ROLES = [
  { value: "Backend Engineer", label: "Backend & Systems Engineer" },
  { value: "Frontend Engineer", label: "Frontend & Fullstack Engineer" },
  { value: "Embedded Systems", label: "Embedded & Firmware Engineer" },
  { value: "Data Engineer", label: "Data & ML Systems Engineer" },
];

const SAMPLE_MOCK_QUESTIONS: Record<string, string[]> = {
  "Backend Engineer": [
    "How would you design an idempotent payment processing endpoint that prevents double charging under network retries?",
    "Explain the internal mechanics of a database index (B+ Tree). Why not use a Hash Table for all indexes?",
    "Walk me through how you would diagnose a thread deadlock or CPU spike in a production microservice.",
  ],
  "Frontend Engineer": [
    "Explain how the browser rendering pipeline works from HTML parse to composite, and how you prevent layout thrashing.",
    "How do you design a high-performance virtualized list rendering 100,000 items at 60 FPS?",
    "Walk me through state management trade-offs: when would you choose server-state caching over global client state?",
  ],
  "Embedded Systems": [
    "How does an interrupt service routine (ISR) communicate safely with a main RTOS task without priority inversion?",
    "Explain the electrical and protocol differences between I2C, SPI, and UART interfaces.",
    "Walk me through low-power design: how do you optimize sleep modes and DMA transfers on a microcontroller?",
  ],
  "Data Engineer": [
    "Explain exactly-once message semantics in distributed stream processing frameworks like Kafka.",
    "How do you handle schema evolution and backward compatibility in data lakes using Parquet or Avro?",
    "Walk me through partitioning vs sharding strategies in high-volume analytical databases.",
  ],
};

interface SpeechRecognitionResultItem {
  transcript: string;
}
interface SpeechRecognitionResultList {
  [index: number]: {
    [subIndex: number]: SpeechRecognitionResultItem;
  };
  length: number;
}
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((error: unknown) => void) | null;
  onend: (() => void) | null;
}
interface CustomSpeechWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
}

function InterviewPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: questions = [] } = useQuery(interviewQuestionsQuery());
  const { data: answers = [] } = useQuery(interviewAnswersQuery(user?.id));
  const { data: profile } = useQuery(profileQuery(user?.id));

  const [mainView, setMainView] = useState<"mock" | "company" | "rounds" | "viva">("mock");

  // Mock Interview States
  const [selectedRole, setSelectedRole] = useState("Backend Engineer");
  const [currentMockQuestion, setCurrentMockQuestion] = useState(
    SAMPLE_MOCK_QUESTIONS["Backend Engineer"]![0]!,
  );
  const [mockAnswer, setMockAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [evaluatingMock, setEvaluatingMock] = useState(false);
  const [mockEvaluation, setMockEvaluation] = useState<MockAnswerEvaluation | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Company Question Bank States
  const [companyFilter, setCompanyFilter] = useState<string>("All");
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [reminders, setReminders] = useState<Record<string, string>>({});

  // Rounds & Viva States
  const tracks = [...new Set(questions.map((q) => q.track))];
  const [track, setTrack] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [ratings, setRatings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  // Initialize bookmarks & reminders
  useEffect(() => {
    setBookmarks(getBookmarkedQuestionIds());
    setReminders(getRevisionReminders());
  }, []);

  // Update mock question when role changes
  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    const list = SAMPLE_MOCK_QUESTIONS[role] || SAMPLE_MOCK_QUESTIONS["Backend Engineer"]!;
    setCurrentMockQuestion(list[0]!);
    setMockAnswer("");
    setMockEvaluation(null);
  };

  // Toggle Voice Dictation via Web Speech API
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      toast.info("Microphone stopped");
      return;
    }

    const customWindow = window as unknown as CustomSpeechWindow;
    const SpeechRecognition =
      customWindow.SpeechRecognition || customWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech Recognition is not supported by your browser. Please type your answer.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecording(true);
        toast.success("Listening... speak your interview answer clearly.");
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setMockAnswer((prev) => {
          const cleanPrev = prev.trim();
          return cleanPrev ? `${cleanPrev} ${transcript}` : transcript;
        });
      };

      recognition.onerror = (err: unknown) => {
        console.warn("Speech recognition error:", err);
        setIsRecording(false);
        toast.error("Speech recognition encountered an issue. Please continue typing.");
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
      toast.error("Microphone access was denied or unavailable.");
    }
  };

  // Evaluate Mock Answer with AI
  const handleEvaluateMock = async () => {
    if (mockAnswer.trim().length < 25) {
      toast.error("Please provide a more complete answer (at least 2-3 sentences) to evaluate.");
      return;
    }
    setEvaluatingMock(true);
    try {
      toast.loading("Analyzing technical depth, STAR structure & keywords...", { id: "eval-mock" });
      const result = await evaluateMockAnswerAction({
        data: {
          question: currentMockQuestion,
          answer: mockAnswer,
          role: selectedRole,
          branch: profile?.branch_slug || "CSE",
        },
      });
      setMockEvaluation(result);
      toast.dismiss("eval-mock");
      toast.success(`Evaluation complete! Score: ${result.score}/100`);

      if (user && profile) {
        await awardXp({
          userId: user.id,
          amount: 25,
          reason: "Completed AI Mock Interview Viva",
          profile,
        });
        await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      }
    } catch {
      toast.dismiss("eval-mock");
      toast.error("Evaluation failed. Please try again.");
    } finally {
      setEvaluatingMock(false);
    }
  };

  // 1-Click: Log Weak Area to Daily Learning Plan
  const handleLogToLearningPlan = async (taskText: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("daily_tasks").insert({
        title: taskText,
        description: `Targeted revision logged from Mock Interview on "${currentMockQuestion.slice(0, 45)}..."`,
        track: "career",
        xp: 25,
        est_minutes: 20,
        order_index: 99,
      });

      if (error) {
        // Store in local storage fallback
        const key = `engineeros_custom_tasks_${user.id}`;
        const raw = localStorage.getItem(key);
        const list = raw ? JSON.parse(raw) : [];
        list.push({ id: `weak-${Date.now()}`, title: taskText, done: false });
        localStorage.setItem(key, JSON.stringify(list));
      }

      await queryClient.invalidateQueries({ queryKey: ["daily-tasks"] });
      toast.success("✓ Task successfully logged to your Daily Learning Plan!");
    } catch {
      toast.error("Could not save task to plan.");
    }
  };

  // Company bookmark toggle
  const handleToggleBookmark = (qId: string) => {
    toggleQuestionBookmark(qId);
    setBookmarks(getBookmarkedQuestionIds());
    toast.success("Updated bookmark");
  };

  // Revision reminder setter
  const handleSetReminder = (qId: string, daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const dateStr = d.toISOString().split("T")[0]!;
    setRevisionReminder(qId, dateStr);
    setReminders(getRevisionReminders());
    toast.success(`Revision reminder set for ${dateStr}`);
  };

  // Filtered Company Questions
  const filteredCompanyQuestions =
    companyFilter === "All"
      ? COMPANY_QUESTION_BANK
      : companyFilter === "Bookmarks"
        ? COMPANY_QUESTION_BANK.filter((q) => bookmarks.includes(q.id))
        : COMPANY_QUESTION_BANK.filter((q) => q.company === companyFilter);

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
      self_rating: selfRating,
      checks_json: checks as unknown as Record<string, unknown>,
      reviewed_at: new Date().toISOString(),
    };

    try {
      if (existing) {
        await supabase.from("interview_answers").update(payload).eq("id", existing.id);
      } else {
        await supabase
          .from("interview_answers")
          .insert({ user_id: user.id, question_id: questionId, ...payload });
        if (profile) {
          await awardXp({
            userId: user.id,
            amount: 20,
            reason: "Completed interview question",
            profile,
          });
        }
      }
      await queryClient.invalidateQueries({ queryKey: ["interview-answers", user.id] });
      await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success("Answer saved.");
    } catch {
      toast.error("Could not save answer.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Placement Readiness"
        title="Interview Academy & AI Mock Sessions"
        description="Practice text or voice mock interviews with AI rubric scoring, company-wise question banks with revision reminders, and automated weak area logging directly into your learning plan."
      />

      {/* Main Mode Navigation Bar */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-4">
        <Button
          size="sm"
          variant={mainView === "mock" ? "default" : "outline"}
          onClick={() => setMainView("mock")}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          AI Mock Interview & Voice
        </Button>

        <Button
          size="sm"
          variant={mainView === "company" ? "default" : "outline"}
          onClick={() => setMainView("company")}
          className="gap-2"
        >
          <Building2 className="h-4 w-4" />
          Company Question Banks ({COMPANY_QUESTION_BANK.length})
        </Button>

        <Button
          size="sm"
          variant={mainView === "rounds" ? "default" : "outline"}
          onClick={() => setMainView("rounds")}
          className="gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          Curated Rounds ({questions.length})
        </Button>
      </div>

      {/* ===================== VIEW 1: AI MOCK INTERVIEW & VOICE ===================== */}
      {mainView === "mock" && (
        <div className="space-y-6">
          <div className="panel p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> AI Mock Interview Station
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select your target role. Speak into your microphone or type your response to get
                  an in-depth hiring bar evaluation.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Target Role:</span>
                <Select value={selectedRole} onValueChange={handleRoleChange}>
                  <SelectTrigger className="h-8 w-[190px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value} className="text-xs">
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Current Question Card */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-primary text-[11px] font-mono">
                  {selectedRole} • Technical Viva Question
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs text-muted-foreground"
                  onClick={() => {
                    const list = SAMPLE_MOCK_QUESTIONS[selectedRole] || [];
                    const nextIdx = (list.indexOf(currentMockQuestion) + 1) % list.length;
                    setCurrentMockQuestion(list[nextIdx]!);
                    setMockAnswer("");
                    setMockEvaluation(null);
                  }}
                >
                  Next Question →
                </Button>
              </div>
              <p className="text-base font-semibold text-foreground">{currentMockQuestion}</p>
            </div>

            {/* Answer Input Area: Voice & Text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="mock-ans" className="text-xs font-semibold">
                  Your Answer (Voice or Text)
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={toggleRecording}
                  className="h-7 px-3 text-xs gap-1.5"
                >
                  {isRecording ? (
                    <MicOff className="h-3.5 w-3.5 animate-pulse" />
                  ) : (
                    <Mic className="h-3.5 w-3.5" />
                  )}
                  {isRecording ? "Stop Recording" : "Voice Dictate (Mic)"}
                </Button>
              </div>

              <Textarea
                id="mock-ans"
                rows={6}
                value={mockAnswer}
                onChange={(e) => setMockAnswer(e.target.value)}
                placeholder="Structure your answer using the STAR format (Situation -> Task -> Action -> Result). Discuss your technical reasoning and edge cases..."
                className="text-xs leading-relaxed"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-muted-foreground font-mono">
                  {mockAnswer.trim().split(/\s+/).filter(Boolean).length} words
                  {isRecording && (
                    <span className="ml-2 text-destructive animate-pulse">
                      • Live Dictation Active
                    </span>
                  )}
                </span>

                <Button
                  onClick={handleEvaluateMock}
                  disabled={evaluatingMock || !mockAnswer.trim()}
                  className="gap-1.5 text-xs h-8"
                >
                  <Send className="h-3.5 w-3.5" />
                  {evaluatingMock ? "Evaluating…" : "Submit & Score Answer"}
                </Button>
              </div>
            </div>

            {/* AI Evaluation Results */}
            {mockEvaluation && (
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 font-sans text-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-lg font-mono">
                      {mockEvaluation.score}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">
                        AI Hiring Bar Assessment
                      </h4>
                      <p className="text-muted-foreground text-xs">
                        Overall Score: {mockEvaluation.score}/100 • Evaluated for {selectedRole}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={`font-mono text-xs px-3 py-1 ${
                      mockEvaluation.score >= 80
                        ? "border-emerald-500 text-emerald-500 bg-emerald-500/10"
                        : mockEvaluation.score >= 60
                          ? "border-amber-500 text-amber-500 bg-amber-500/10"
                          : "border-destructive text-destructive bg-destructive/10"
                    }`}
                  >
                    {mockEvaluation.score >= 80
                      ? "Pass (Strong Hire)"
                      : mockEvaluation.score >= 60
                        ? "Leaning Hire"
                        : "Needs Revision"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 p-3 rounded-lg bg-muted/40 border border-border">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4 text-primary" /> Technical Depth:
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      {mockEvaluation.technicalAccuracy}
                    </p>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-lg bg-muted/40 border border-border">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4 text-accent" /> Communication & STAR
                      Structure:
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      {mockEvaluation.communicationFeedback}
                    </p>
                  </div>
                </div>

                {/* Keywords Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="font-semibold text-[11px] text-emerald-500 uppercase flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Keywords Demonstrated:
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {mockEvaluation.keywordsCovered.map((kw, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-emerald-500 border-emerald-500/30 text-[10px]"
                        >
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-[11px] text-destructive uppercase flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> Keywords Missed:
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {mockEvaluation.keywordsMissed.map((kw, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-destructive border-destructive/30 text-[10px]"
                        >
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Weak Areas & Learning Plan Logging */}
                {mockEvaluation.weakAreas.length > 0 && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-500 text-xs flex items-center gap-1.5">
                        <ShieldAlert className="h-4 w-4" /> Weak Areas Identified:
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleLogToLearningPlan(mockEvaluation.learningPlanTask)}
                        className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Log to My Learning Plan
                      </Button>
                    </div>

                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-xs">
                      {mockEvaluation.weakAreas.map((area, i) => (
                        <li key={i}>{area}</li>
                      ))}
                    </ul>

                    <p className="text-[11px] text-muted-foreground italic">
                      Recommended Plan Item: &quot;{mockEvaluation.learningPlanTask}&quot;
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== VIEW 2: COMPANY QUESTION BANKS ===================== */}
      {mainView === "company" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {[
                "All",
                "Google",
                "Amazon",
                "Microsoft",
                "TCS",
                "Infosys",
                "Atlassian",
                "Flipkart",
                "Startups",
                "Bookmarks",
              ].map((filter) => (
                <Button
                  key={filter}
                  size="sm"
                  variant={companyFilter === filter ? "default" : "outline"}
                  onClick={() => setCompanyFilter(filter)}
                  className="text-xs h-7"
                >
                  {filter}
                </Button>
              ))}
            </div>

            <span className="text-xs text-muted-foreground font-mono">
              Showing {filteredCompanyQuestions.length} company questions
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredCompanyQuestions.map((q) => {
              const isBookmarked = bookmarks.includes(q.id);
              const reminderDate = reminders[q.id];

              return (
                <div key={q.id} className="panel p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                          {q.company}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {q.role}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-mono",
                            q.difficulty === "Easy" && "text-emerald-500",
                            q.difficulty === "Medium" && "text-amber-500",
                            q.difficulty === "Hard" && "text-destructive",
                          )}
                        >
                          {q.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {q.frequency}
                        </Badge>
                      </div>

                      <h3 className="text-sm font-semibold text-foreground pt-1">{q.question}</h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleBookmark(q.id)}
                        className="h-8 px-2 text-xs"
                        title={isBookmarked ? "Remove Bookmark" : "Bookmark Question"}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="h-4 w-4 text-primary fill-current" />
                        ) : (
                          <Bookmark className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>

                      <Select onValueChange={(val) => handleSetReminder(q.id, Number(val))}>
                        <SelectTrigger className="h-8 w-28 text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          <SelectValue placeholder="Remind" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2" className="text-xs">
                            In 2 days
                          </SelectItem>
                          <SelectItem value="5" className="text-xs">
                            In 5 days
                          </SelectItem>
                          <SelectItem value="7" className="text-xs">
                            In 1 week
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground italic">
                    Interviewer Context: {q.interviewerContext}
                  </p>

                  {reminderDate && (
                    <div className="text-[11px] text-amber-500 flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3" /> Revision reminder set for {reminderDate}
                    </div>
                  )}

                  <Accordion type="single" collapsible className="pt-1">
                    <AccordionItem value="details" className="border-border">
                      <AccordionTrigger className="text-xs py-1.5 text-primary hover:underline">
                        View Model Talking Points & Keywords
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2 text-xs text-muted-foreground">
                        <div>
                          <span className="font-semibold text-foreground">Expected Keywords:</span>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {q.expectedKeywords.map((kw, i) => (
                              <Badge key={i} variant="outline" className="text-[10px]">
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="font-semibold text-foreground">
                            Key Architecture Talking Points:
                          </span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            {q.keyTalkingPoints.map((tp, i) => (
                              <li key={i}>{tp}</li>
                            ))}
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== VIEW 3: CURATED ROUNDS ===================== */}
      {mainView === "rounds" && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by track">
            {tracks.map((item) => (
              <Button
                key={item}
                size="sm"
                variant={activeTrack === item ? "default" : "outline"}
                onClick={() => setTrack(item)}
                aria-pressed={activeTrack === item}
                className="capitalize text-xs"
              >
                {item}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {visible.map((question) => {
              const text = textFor(question.id);
              const isAnswered = answered.has(question.id);
              const keywords = question.keywords as string[];
              const criteria = (question.criteria as string[]) ?? [];
              const checks = analyseInterviewAnswer({ text, track: activeTrack, keywords });

              return (
                <section key={question.id} className="panel p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs capitalize font-mono">
                      {question.round}
                    </Badge>
                    {isAnswered && (
                      <Badge className="bg-emerald-600 text-white text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Answered
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-semibold text-sm text-foreground">{question.prompt}</h3>

                  <div className="space-y-2">
                    <Label htmlFor={`ans-${question.id}`} className="text-xs">
                      Your Answer
                    </Label>
                    <Textarea
                      id={`ans-${question.id}`}
                      rows={5}
                      value={text}
                      onChange={(e) =>
                        setDrafts((prev) => ({ ...prev, [question.id]: e.target.value }))
                      }
                      placeholder="Type your response in full sentences..."
                      className="text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      size="sm"
                      onClick={() => save(question.id, keywords)}
                      disabled={saving === question.id}
                      className="h-8 text-xs"
                    >
                      {saving === question.id ? "Saving…" : "Save Answer (+20 XP)"}
                    </Button>
                  </div>

                  <CheckList checks={checks} label="Rubric Applied to Your Answer" />
                </section>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
