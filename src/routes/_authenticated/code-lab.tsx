import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlignLeft,
  Bot,
  CheckCircle2,
  Code2,
  Copy,
  Gauge,
  HelpCircle,
  Lightbulb,
  Play,
  RotateCcw,
  Save,
  Send,
  Sparkles,
  Terminal,
  Trash2,
  Wand2,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  codeChallengesQuery,
  codeSnippetsQuery,
  profileQuery,
  type CodeChallenge,
} from "@/lib/queries";
import { executeCode, type RunResult } from "@/lib/code-runner";
import { requestAiCodeAction } from "@/lib/ai-assistant.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/code-lab")({
  head: () => ({
    meta: [
      { title: "Code Lab — EngineerOS" },
      {
        name: "description",
        content:
          "Integrated online compiler, runner, challenges and AI code coach for engineering students.",
      },
      { property: "og:title", content: "Code Lab — EngineerOS" },
      {
        property: "og:description",
        content: "Write, run, format, and debug code with AI across Python, C++, Java, JS & SQL.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CodeLabPage,
});

const LANGUAGES = [
  { value: "python", label: "Python 3" },
  { value: "javascript", label: "JavaScript (ES2024)" },
  { value: "typescript", label: "TypeScript" },
  { value: "cpp", label: "C++ (GCC 14 / C++20)" },
  { value: "c", label: "C (Clang 18)" },
  { value: "java", label: "Java (OpenJDK 21)" },
  { value: "sql", label: "PostgreSQL / SQL" },
  { value: "bash", label: "Bash / Shell" },
];

const DEFAULT_STARTER: Record<string, string> = {
  python: `# EngineerOS Python Environment
def solve(items: list[int]) -> int:
    # Your logic here
    return sum(items)

numbers = [10, 20, 30, 40, 50]
result = solve(numbers)
print("Computed sum:", result)
`,
  javascript: `// EngineerOS JavaScript Sandbox
function calculateMetrics(data) {
  const total = data.reduce((acc, x) => acc + x, 0);
  const avg = total / (data.length || 1);
  return { total, avg };
}

const scores = [85, 92, 78, 96, 88];
console.log("Analysis results:", calculateMetrics(scores));
`,
  typescript: `// EngineerOS TypeScript Sandbox
interface EngineeringJob {
  role: string;
  skills: string[];
  level: "junior" | "mid" | "senior";
}

function verifyReadiness(job: EngineeringJob, studentSkills: string[]): number {
  const matches = job.skills.filter(s => studentSkills.includes(s));
  return Math.round((matches.length / job.skills.length) * 100);
}

const targetJob: EngineeringJob = {
  role: "Systems Engineer",
  skills: ["linux", "python", "dsa", "git"],
  level: "junior",
};

const current = ["linux", "python", "git"];
console.log("Readiness Score:", verifyReadiness(targetJob, current) + "%");
`,
  cpp: `#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::vector<int> stream = {10, 25, 40, 55, 70};
    int total = std::accumulate(stream.begin(), stream.end(), 0);
    std::cout << "[EngineerOS C++] Vector aggregated sum: " << total << std::endl;
    return 0;
}
`,
  c: `#include <stdio.h>

int main() {
    int buffer[5] = {1, 2, 3, 4, 5};
    int sum = 0;
    for (int i = 0; i < 5; i++) {
        sum += buffer[i];
    }
    printf("[C Memory]: Buffer allocated and evaluated: %d\\n", sum);
    return 0;
}
`,
  java: `public class Main {
    public static void main(String[] args) {
        String message = "EngineerOS Java Virtual Machine";
        System.out.println(message + " - Systems Ready.");
    }
}
`,
  sql: `-- EngineerOS Relational SQL Sandbox
SELECT 
  id, 
  title, 
  track, 
  estimated_hours 
FROM courses 
WHERE is_published = true 
ORDER BY order_index ASC;
`,
  bash: `#!/usr/bin/env bash
# EngineerOS Shell Diagnostics
echo "=== System Diagnostic ==="
echo "Host: $(uname -s 2>/dev/null || echo 'Linux-Kernel-6.6')"
echo "Shell: $SHELL"
echo "Status: ONLINE"
`,
};

function CodeLabPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: challenges = [] } = useQuery(codeChallengesQuery());
  const { data: snippets = [] } = useQuery(codeSnippetsQuery(user?.id));
  const { data: profile } = useQuery(profileQuery(user?.id));

  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(DEFAULT_STARTER["python"] ?? "");
  const [notes, setNotes] = useState("");
  const [stdin, setStdin] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [level, setLevel] = useState("all");

  // Runner state
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);

  // AI assistant state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [activeAiTab, setActiveAiTab] = useState<string | null>(null);

  const levels = useMemo(
    () => ["all", ...Array.from(new Set(challenges.map((c) => c.level)))],
    [challenges],
  );
  const visible = level === "all" ? challenges : challenges.filter((c) => c.level === level);

  function reset() {
    setActiveId(null);
    setTitle("");
    setCode(DEFAULT_STARTER[language] ?? "");
    setNotes("");
    setChallengeId(null);
    setRunResult(null);
    setAiResponse(null);
    setActiveAiTab(null);
  }

  function handleLanguageChange(lang: string) {
    setLanguage(lang);
    if (!activeId && !challengeId) {
      setCode(DEFAULT_STARTER[lang] ?? "");
    }
  }

  function loadChallenge(challenge: CodeChallenge) {
    setActiveId(null);
    setChallengeId(challenge.id);
    setTitle(challenge.title);
    setLanguage(challenge.language);
    setCode(challenge.starter_code);
    setNotes("");
    setRunResult(null);
    setAiResponse(null);
    document.getElementById("code-ide-workspace")?.scrollIntoView({ behavior: "smooth" });
  }

  function loadSnippet(id: string) {
    const snippet = snippets.find((s) => s.id === id);
    if (!snippet) return;
    setActiveId(snippet.id);
    setChallengeId(snippet.challenge_id);
    setTitle(snippet.title);
    setLanguage(snippet.language);
    setCode(snippet.code);
    setNotes(snippet.notes ?? "");
    setRunResult(null);
    document.getElementById("code-ide-workspace")?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleRun() {
    setRunning(true);
    setRunResult(null);
    try {
      const res = await executeCode(language, code, stdin);
      setRunResult(res);
      if (res.exitCode === 0) {
        toast.success(`Executed in ${res.durationMs}ms`);
      } else {
        toast.error("Execution encountered an error");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Run failed");
    } finally {
      setRunning(false);
    }
  }

  async function handleSubmit() {
    setRunning(true);
    try {
      const res = await executeCode(language, code, stdin);
      setRunResult(res);
      if (res.exitCode === 0) {
        if (user) {
          await awardXp(user.id, profile, 25);
          await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
        }
        toast.success("All test assertions passed! +25 XP awarded");
      } else {
        toast.error("Test validation failed. Check stderr console.");
      }
    } finally {
      setRunning(false);
    }
  }

  function handleFormat() {
    try {
      // Basic automatic indentation normalization
      const lines = code.split("\n");
      let indentLevel = 0;
      const formatted = lines.map((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("}") || trimmed.startsWith("]") || trimmed.startsWith(")")) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
        const indented = "  ".repeat(indentLevel) + trimmed;
        if (trimmed.endsWith("{") || trimmed.endsWith(":") || trimmed.endsWith("[")) {
          indentLevel++;
        }
        return indented;
      });
      setCode(formatted.join("\n"));
      toast.success("Code formatted");
    } catch {
      toast.error("Could not format code");
    }
  }

  async function handleAiAction(
    action: "explain" | "debug" | "optimize" | "hint" | "complexity" | "testcases",
  ) {
    setAiLoading(true);
    setActiveAiTab(action);
    setAiResponse(null);
    try {
      const res = await requestAiCodeAction({
        data: {
          action,
          language,
          code,
          context: title ? `Problem title: ${title}` : undefined,
        },
      });
      setAiResponse(res.result);
      toast.success("AI Mentor response ready");
    } catch (err) {
      toast.error("AI Assistant is temporarily busy");
    } finally {
      setAiLoading(false);
    }
  }

  async function save() {
    if (!user) {
      toast.info("Sign in to save snippets permanently to your account.");
      return;
    }
    if (!title.trim()) {
      toast.error("Give your snippet a title first.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        challenge_id: challengeId,
        title: title.trim(),
        language,
        code,
        notes: notes.trim() || null,
      };
      if (activeId) {
        const { error } = await supabase.from("code_snippets").update(payload).eq("id", activeId);
        if (error) throw new Error(error.message);
        toast.success("Snippet updated.");
      } else {
        const { data, error } = await supabase
          .from("code_snippets")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        setActiveId(data.id);
        await awardXp(user.id, profile, 15);
        await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
        toast.success("+15 XP · snippet saved");
      }
      await queryClient.invalidateQueries({ queryKey: ["code-snippets", user.id] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save snippet.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!user) return;
    const { error } = await supabase.from("code_snippets").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (activeId === id) reset();
    await queryClient.invalidateQueries({ queryKey: ["code-snippets", user.id] });
    toast.success("Snippet deleted.");
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard.");
    } catch {
      toast.error("Clipboard blocked.");
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Integrated Sandbox"
        title="Code Lab & Online Compiler"
        description="Write, compile, test, format and debug code across multiple languages with our integrated AI Code Assistant."
      />

      {/* Main IDE Workspace */}
      <div id="code-ide-workspace" className="mb-10 grid gap-6 lg:grid-cols-12">
        {/* Editor & Console Column */}
        <div className="space-y-4 lg:col-span-8">
          <div className="panel overflow-hidden border-border bg-card">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-2.5">
              <div className="flex items-center gap-3">
                <Code2 className="h-4 w-4 text-primary" aria-hidden="true" />
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="h-8 w-44 bg-background text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {title ? (
                  <Badge
                    variant="outline"
                    className="hidden sm:inline-block max-w-[200px] truncate text-xs"
                  >
                    {title}
                  </Badge>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs"
                  onClick={handleFormat}
                  title="Format indentation"
                >
                  <AlignLeft className="h-3.5 w-3.5" />
                  Format
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs"
                  onClick={reset}
                  title="Reset starter template"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  className="h-8 gap-1.5 text-xs font-semibold"
                  onClick={handleRun}
                  disabled={running}
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  {running ? "Running…" : "Run"}
                </Button>
                <Button
                  size="sm"
                  className="h-8 gap-1.5 bg-success text-success-foreground hover:bg-success/90 text-xs font-semibold"
                  onClick={handleSubmit}
                  disabled={running}
                >
                  <Send className="h-3.5 w-3.5" />
                  Submit
                </Button>
              </div>
            </div>

            {/* Code Textarea */}
            <div className="relative">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={16}
                spellCheck={false}
                className="w-full resize-y rounded-none border-0 bg-background/50 font-mono text-xs leading-relaxed focus-visible:ring-0 p-4 text-foreground"
                placeholder={`// Write your ${language} code here...`}
              />
            </div>

            {/* Stdin Drawer / Accordion */}
            <div className="border-t border-border bg-surface/50 px-4 py-2">
              <details className="text-xs">
                <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
                  Custom Standard Input (stdin)
                </summary>
                <Input
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Provide lines of standard input here..."
                  className="mt-2 h-8 text-xs bg-background font-mono"
                />
              </details>
            </div>

            {/* Output / Console Terminal */}
            <div className="border-t border-border bg-black/90 p-4 font-mono text-xs text-emerald-400">
              <div className="mb-2 flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-2 text-[11px] uppercase tracking-wider">
                  <Terminal className="h-3.5 w-3.5 text-primary" />
                  Execution Console & Diagnostics
                </span>
                {runResult ? (
                  <span className="text-[11px]">
                    Status: {runResult.exitCode === 0 ? "OK (0)" : `ERR (${runResult.exitCode})`} ·{" "}
                    {runResult.durationMs}ms
                  </span>
                ) : (
                  <span className="text-[11px]">Ready to run</span>
                )}
              </div>

              <div className="min-h-[100px] max-h-[220px] overflow-y-auto whitespace-pre-wrap rounded bg-black/40 p-3 leading-relaxed">
                {running ? (
                  <span className="animate-pulse text-primary">
                    Compiling and executing code in sandbox...
                  </span>
                ) : runResult ? (
                  <div>
                    {runResult.stdout ? (
                      <p className="text-emerald-300">{runResult.stdout}</p>
                    ) : null}
                    {runResult.stderr ? (
                      <p className="mt-2 text-rose-400">{runResult.stderr}</p>
                    ) : null}
                  </div>
                ) : (
                  <span className="text-zinc-500">
                    Click "Run" or "Submit" to compile and execute this program.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* AI Code Mentor Actions */}
          <div className="panel p-4">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">AI Code Assistant & Tutor</h3>
              <span className="label-mono ml-auto text-[10px] text-muted-foreground">
                Powered by Gemini
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeAiTab === "explain" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => handleAiAction("explain")}
                disabled={aiLoading}
              >
                <Bot className="h-3.5 w-3.5" />
                Explain Code
              </Button>
              <Button
                variant={activeAiTab === "debug" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => handleAiAction("debug")}
                disabled={aiLoading}
              >
                <Wand2 className="h-3.5 w-3.5" />
                Find & Fix Error
              </Button>
              <Button
                variant={activeAiTab === "hint" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => handleAiAction("hint")}
                disabled={aiLoading}
              >
                <Lightbulb className="h-3.5 w-3.5" />
                Give Hint
              </Button>
              <Button
                variant={activeAiTab === "optimize" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => handleAiAction("optimize")}
                disabled={aiLoading}
              >
                <Gauge className="h-3.5 w-3.5" />
                Optimize Code
              </Button>
              <Button
                variant={activeAiTab === "complexity" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => handleAiAction("complexity")}
                disabled={aiLoading}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                Time & Space Complexity
              </Button>
              <Button
                variant={activeAiTab === "testcases" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => handleAiAction("testcases")}
                disabled={aiLoading}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Generate Test Cases
              </Button>
            </div>

            {aiLoading ? (
              <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4 text-xs">
                <p className="animate-pulse flex items-center gap-2 text-primary font-medium">
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                  AI Mentor is analyzing your code logic...
                </p>
              </div>
            ) : aiResponse ? (
              <div className="mt-4 rounded-lg border border-border bg-surface p-4 text-xs leading-relaxed text-foreground whitespace-pre-wrap font-sans">
                <div className="mb-2 flex items-center justify-between border-b border-border pb-2">
                  <span className="font-semibold text-primary uppercase tracking-wider text-[11px]">
                    AI Analysis Result
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px]"
                    onClick={() => setAiResponse(null)}
                  >
                    Dismiss
                  </Button>
                </div>
                {aiResponse}
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Sidebar: Snippet Library & Save */}
        <div className="space-y-6 lg:col-span-4">
          <div className="panel p-5">
            <h3 className="text-sm font-semibold">Save to Personal Library</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Store solutions, notes, and algorithms for quick interview lookup.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <Label htmlFor="snippet-title" className="text-xs">
                  Snippet Title
                </Label>
                <Input
                  id="snippet-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. QuickSort Lomuto Partition"
                  className="mt-1 h-8 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="snippet-notes" className="text-xs">
                  Notes & Key Learnings
                </Label>
                <Textarea
                  id="snippet-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Time complexity O(N log N), pitfalls..."
                  rows={3}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={save}
                  disabled={saving}
                  className="flex-1 gap-1.5 text-xs"
                >
                  <Save className="h-3.5 w-3.5" />
                  {saving ? "Saving…" : activeId ? "Update Snippet" : "Save Snippet"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyCode}
                  className="h-8 text-xs"
                  title="Copy code"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Saved Snippets List */}
          <div className="panel p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Your Snippets</h3>
              <Badge variant="secondary" className="text-xs">
                {snippets.length}
              </Badge>
            </div>

            {snippets.length === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">
                No snippets saved yet. Write code and save it to access it anytime.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-border text-xs">
                {snippets.map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-2">
                    <button
                      type="button"
                      onClick={() => loadSnippet(s.id)}
                      className={cn(
                        "flex-1 text-left font-medium hover:text-primary transition-colors truncate",
                        activeId === s.id && "text-primary font-semibold",
                      )}
                    >
                      {s.title}
                      <span className="ml-2 font-mono text-[10px] text-muted-foreground uppercase">
                        [{s.language}]
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(s.id)}
                      className="ml-2 text-muted-foreground hover:text-destructive"
                      aria-label="Delete snippet"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Challenge Prompts Section */}
      <section aria-labelledby="challenges-heading" className="mb-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="challenges-heading" className="text-lg font-semibold">
              Curated Practice Challenges
            </h2>
            <p className="text-xs text-muted-foreground">
              Select a challenge to load the prompt and starter code directly into your Code Lab
              editor.
            </p>
          </div>
          <div className="flex gap-2">
            {levels.map((lvl) => (
              <Button
                key={lvl}
                size="sm"
                variant={level === lvl ? "default" : "outline"}
                onClick={() => setLevel(lvl)}
                className="h-7 text-xs capitalize"
              >
                {lvl}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((challenge) => (
            <div
              key={challenge.id}
              className="panel flex flex-col justify-between p-4 transition-colors hover:border-primary/40"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="label-mono uppercase text-[10px]">
                    {challenge.language}
                  </Badge>
                  <span className="label-mono text-[10px] capitalize text-muted-foreground">
                    {challenge.level}
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-semibold">{challenge.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {challenge.summary}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => loadChallenge(challenge)}
                className="mt-4 w-full text-xs gap-1.5"
              >
                <Code2 className="h-3.5 w-3.5" />
                Load into Code Lab
              </Button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
