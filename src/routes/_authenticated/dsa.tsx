import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
  FileCode2,
  HelpCircle,
  Play,
  RotateCcw,
  Send,
  Share2,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MonacoCodeEditor } from "@/components/monaco-code-editor";
import { CodeVerdictCard } from "@/components/code-verdict-card";
import { MilestoneShareDialog } from "@/components/milestone-share-dialog";
import { useAuth } from "@/hooks/useAuth";
import { dsaProblemsQuery, dsaProgressQuery, profileQuery } from "@/lib/queries";
import { setDsaStatus } from "@/lib/progress";
import {
  evaluateTestCases,
  executeCode,
  type EvaluationResult,
  type RunResult,
} from "@/lib/code-runner";
import { getDsaChallengeDetail, type DsaChallengeDetail } from "@/lib/dsa-challenge-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dsa")({
  head: () => ({
    meta: [
      { title: "DSA Practice & In-Browser Execution — EngineerOS" },
      {
        name: "description",
        content:
          "Curated DSA problems with in-browser Monaco code execution, sample & hidden test cases, and automatic verdicts.",
      },
      { property: "og:title", content: "DSA Practice — EngineerOS" },
      {
        property: "og:description",
        content: "Solve algorithm problems in Python, C++, Java, C, and JS with instant verdicts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DsaPage,
});

const statuses = ["todo", "attempted", "solved"] as const;

const SUPPORTED_LANGUAGES = [
  { value: "python", label: "Python 3" },
  { value: "cpp", label: "C++ (GCC 14)" },
  { value: "java", label: "Java (JDK 17)" },
  { value: "c", label: "C (GCC 14)" },
  { value: "javascript", label: "JavaScript (ES2024)" },
];

function DsaPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState<string>("all");
  const [activeProblemId, setActiveProblemId] = useState<string | null>(null);

  // Per-problem editor state
  const [activeLang, setActiveLang] = useState<string>("python");
  const [problemCode, setProblemCode] = useState<Record<string, string>>({});
  const [evaluating, setEvaluating] = useState(false);
  const [runningSample, setRunningSample] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState<Record<string, EvaluationResult>>({});
  const [sampleRunResults, setSampleRunResults] = useState<Record<string, RunResult>>({});

  // Share dialog state
  const [shareData, setShareData] = useState<{
    open: boolean;
    title: string;
    details: string;
    codeSnippet?: string;
  }>({
    open: false,
    title: "",
    details: "",
  });

  const { data: problems = [] } = useQuery(dsaProblemsQuery());
  const { data: progress = [] } = useQuery(dsaProgressQuery(user?.id));
  const { data: profile } = useQuery(profileQuery(user?.id));

  const statusOf = (id: string) =>
    (progress.find((p) => p.problem_id === id)?.status ?? "todo") as (typeof statuses)[number];

  const topics = ["all", ...Array.from(new Set(problems.map((p) => p.topic)))];
  const visible = topic === "all" ? problems : problems.filter((p) => p.topic === topic);
  const solved = problems.filter((p) => statusOf(p.id) === "solved").length;

  async function update(problemId: string, status: (typeof statuses)[number]) {
    if (!user) return;
    const previousStatus = statusOf(problemId);
    if (previousStatus === status) return;
    try {
      await setDsaStatus({ userId: user.id, problemId, status, profile, previousStatus });
      await queryClient.invalidateQueries({ queryKey: ["dsa-progress", user.id] });
      await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      if (status === "solved" && previousStatus !== "solved") toast.success("+30 XP · solved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your status.");
    }
  }

  // Toggle problem editor drawer
  const toggleEditor = (problemId: string, title: string) => {
    if (activeProblemId === problemId) {
      setActiveProblemId(null);
    } else {
      setActiveProblemId(problemId);
      const detail = getDsaChallengeDetail(problemId, title);
      const codeKey = `${problemId}_${activeLang}`;
      if (!problemCode[codeKey]) {
        const starter =
          detail.starterCode[activeLang as keyof typeof detail.starterCode] ||
          detail.starterCode.python;
        setProblemCode((prev) => ({ ...prev, [codeKey]: starter }));
      }
    }
  };

  const handleLanguageChange = (problemId: string, title: string, newLang: string) => {
    setActiveLang(newLang);
    const detail = getDsaChallengeDetail(problemId, title);
    const codeKey = `${problemId}_${newLang}`;
    if (!problemCode[codeKey]) {
      const starter =
        detail.starterCode[newLang as keyof typeof detail.starterCode] || detail.starterCode.python;
      setProblemCode((prev) => ({ ...prev, [codeKey]: starter }));
    }
  };

  // Run sample test (first visible test case)
  const runSample = async (problemId: string, title: string) => {
    const detail = getDsaChallengeDetail(problemId, title);
    const codeKey = `${problemId}_${activeLang}`;
    const code =
      problemCode[codeKey] ||
      detail.starterCode[activeLang as keyof typeof detail.starterCode] ||
      detail.starterCode.python;

    const sampleInput = detail.testCases[0]?.input || "";
    setRunningSample(true);
    try {
      const res = await executeCode(activeLang, code, sampleInput);
      setSampleRunResults((prev) => ({ ...prev, [problemId]: res }));
      toast.info(`Sample run finished (${res.durationMs}ms)`);
    } catch {
      toast.error("Execution failed. Check internet connection.");
    } finally {
      setRunningSample(false);
    }
  };

  // Submit solution against all sample and hidden test cases
  const submitSolution = async (problemId: string, title: string) => {
    const detail = getDsaChallengeDetail(problemId, title);
    const codeKey = `${problemId}_${activeLang}`;
    const code =
      problemCode[codeKey] ||
      detail.starterCode[activeLang as keyof typeof detail.starterCode] ||
      detail.starterCode.python;

    setEvaluating(true);
    try {
      toast.loading("Running code against test suite...", { id: "dsa-run" });
      const evalRes = await evaluateTestCases(activeLang, code, detail.testCases);
      setEvaluationResults((prev) => ({ ...prev, [problemId]: evalRes }));
      toast.dismiss("dsa-run");

      if (evalRes.verdict === "Accepted") {
        toast.success(`🎉 Accepted! All ${evalRes.passedCount} test cases passed! +30 XP`);
        await update(problemId, "solved");
        setShareData({
          open: true,
          title: `Solved ${title}`,
          details: `Passed all ${evalRes.totalCount} test cases in ${activeLang.toUpperCase()} (${evalRes.totalDurationMs}ms)`,
          codeSnippet: code,
        });
      } else {
        toast.error(
          `Verdict: ${evalRes.verdict} (${evalRes.passedCount}/${evalRes.totalCount} passed)`,
        );
        await update(problemId, "attempted");
      }
    } catch {
      toast.dismiss("dsa-run");
      toast.error("Evaluation timed out. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Practice"
        title="DSA Practice & In-Browser Runner"
        description="Solve algorithm problems in Python, C++, Java, C, or JS. Run against sample & hidden test cases with automatic Accepted / Wrong Answer / TLE verdicts that sync directly to your progress."
        actions={
          <div className="min-w-[200px]">
            <p className="label-mono text-muted-foreground">
              {solved}/{problems.length} solved
            </p>
            <Progress
              className="mt-2 h-1.5"
              value={problems.length ? (solved / problems.length) * 100 : 0}
            />
          </div>
        }
      />

      {/* Topic Filter Pills */}
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
        {topics.map((item) => (
          <Button
            key={item}
            size="sm"
            variant={topic === item ? "default" : "outline"}
            onClick={() => setTopic(item)}
            aria-pressed={topic === item}
            className="capitalize"
          >
            {item}
          </Button>
        ))}
      </div>

      {/* Problem List */}
      <ul className="space-y-4">
        {visible.map((problem) => {
          const status = statusOf(problem.id);
          const isEditorOpen = activeProblemId === problem.id;
          const challenge = getDsaChallengeDetail(problem.id, problem.title);
          const codeKey = `${problem.id}_${activeLang}`;
          const currentCode =
            problemCode[codeKey] ??
            challenge.starterCode[activeLang as keyof typeof challenge.starterCode] ??
            challenge.starterCode.python;
          const currentEval = evaluationResults[problem.id];
          const currentSample = sampleRunResults[problem.id];

          return (
            <li key={problem.id} className="panel p-4 transition-all">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-[220px] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold">{problem.title}</h2>
                    <Badge
                      variant="outline"
                      className={cn(
                        "label-mono",
                        problem.level === "beginner" &&
                          "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
                        problem.level === "intermediate" &&
                          "text-amber-500 border-amber-500/30 bg-amber-500/10",
                        problem.level === "advanced" &&
                          "text-destructive border-destructive/30 bg-destructive/10",
                      )}
                    >
                      {problem.level}
                    </Badge>
                    <Badge variant="secondary" className="label-mono capitalize">
                      {problem.topic}
                    </Badge>
                    {problem.pattern && (
                      <Badge variant="outline" className="text-primary text-[10px]">
                        {problem.pattern}
                      </Badge>
                    )}
                  </div>

                  <p className="mt-1.5 text-sm text-muted-foreground">{problem.statement}</p>

                  {/* Constraints list */}
                  {challenge.constraints?.length > 0 && (
                    <div className="mt-2 text-[11px] text-muted-foreground font-mono flex flex-wrap gap-x-4 gap-y-1">
                      {challenge.constraints.map((c, i) => (
                        <span key={i} className="bg-muted/50 px-1.5 py-0.5 rounded">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  {problem.hint && (
                    <details className="mt-2">
                      <summary className="label-mono cursor-pointer text-primary hover:underline text-xs">
                        View Algorithm Hint
                      </summary>
                      <p className="mt-1 text-xs text-muted-foreground bg-muted/40 p-2 rounded">
                        {problem.hint}
                      </p>
                    </details>
                  )}
                </div>

                {/* Right controls: Editor toggle & Status selector */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                  <Button
                    size="sm"
                    variant={isEditorOpen ? "secondary" : "default"}
                    onClick={() => toggleEditor(problem.id, problem.title)}
                    className="gap-1.5 font-medium text-xs"
                  >
                    <Code2 className="h-3.5 w-3.5" />
                    {isEditorOpen ? "Hide Code Editor" : "Open In-Browser Editor"}
                    {isEditorOpen ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>

                  <div
                    className="flex gap-1"
                    role="group"
                    aria-label={`Status for ${problem.title}`}
                  >
                    {statuses.map((option) => (
                      <Button
                        key={option}
                        size="sm"
                        variant={status === option ? "default" : "ghost"}
                        aria-pressed={status === option}
                        onClick={() => update(problem.id, option)}
                        className="capitalize text-xs h-8"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>

                  {status === "solved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setShareData({
                          open: true,
                          title: `Solved ${problem.title}`,
                          details: `Completed ${problem.title} on EngineerOS (${problem.level} difficulty)`,
                        })
                      }
                      className="h-8 px-2 text-xs"
                      title="Share milestone"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Collapsible Monaco Code Editor & Verdict Panel */}
              {isEditorOpen && (
                <div className="mt-4 pt-4 border-t border-border space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">In-Browser Monaco Sandbox</span>
                      <span className="text-[11px] text-muted-foreground">
                        (Language: {activeLang.toUpperCase()})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runSample(problem.id, problem.title)}
                        disabled={runningSample || evaluating}
                        className="h-7 text-xs"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Run Sample Test
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => submitSolution(problem.id, problem.title)}
                        disabled={evaluating || runningSample}
                        className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        {evaluating ? "Evaluating Test Suite…" : "Submit Solution"}
                      </Button>
                    </div>
                  </div>

                  <MonacoCodeEditor
                    value={currentCode}
                    onChange={(val) => setProblemCode((prev) => ({ ...prev, [codeKey]: val }))}
                    language={activeLang}
                    onLanguageChange={(lang) =>
                      handleLanguageChange(problem.id, problem.title, lang)
                    }
                    supportedLanguages={SUPPORTED_LANGUAGES}
                    onRun={() => submitSolution(problem.id, problem.title)}
                    isRunning={evaluating}
                    runButtonLabel="Submit Code"
                    height="320px"
                    defaultStarter={
                      challenge.starterCode[activeLang as keyof typeof challenge.starterCode] ||
                      challenge.starterCode.python
                    }
                  />

                  {/* Verdict / Sample Run Output */}
                  {currentEval ? (
                    <CodeVerdictCard
                      evaluation={currentEval}
                      onRunAgain={() => submitSolution(problem.id, problem.title)}
                    />
                  ) : currentSample ? (
                    <CodeVerdictCard
                      runResult={currentSample}
                      onRunAgain={() => runSample(problem.id, problem.title)}
                    />
                  ) : (
                    <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCode2 className="h-4 w-4 text-primary" />
                        <span>
                          {challenge.testCases.length} Test cases configured (
                          {challenge.testCases.filter((t) => t.isHidden).length} hidden).
                        </span>
                      </div>
                      <span className="text-[11px] font-mono">
                        Time Limit: 3.0s | Memory Limit: 128MB
                      </span>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Milestone Share Modal */}
      <MilestoneShareDialog
        open={shareData.open}
        onOpenChange={(open) => setShareData((prev) => ({ ...prev, open }))}
        title={shareData.title}
        category="dsa"
        details={shareData.details}
        codeSnippet={shareData.codeSnippet}
        metric="+30 XP Earned"
      />
    </>
  );
}
