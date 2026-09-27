import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Terminal,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EvaluationResult, RunResult, TestCaseResult } from "@/lib/code-runner";

interface CodeVerdictCardProps {
  evaluation?: EvaluationResult | null;
  runResult?: RunResult | null;
  onRunAgain?: () => void;
}

export function CodeVerdictCard({ evaluation, runResult, onRunAgain }: CodeVerdictCardProps) {
  const [selectedTestCase, setSelectedTestCase] = useState<number>(0);
  const [showStdout, setShowStdout] = useState(false);

  if (!evaluation && !runResult) return null;

  // Single run output view
  if (runResult && !evaluation) {
    const isError = runResult.exitCode !== 0 || !!runResult.stderr || !!runResult.compileOutput;
    return (
      <div className="rounded-lg border border-border bg-card p-4 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isError ? (
              <Badge
                variant="destructive"
                className="flex items-center gap-1 font-mono text-xs uppercase"
              >
                <XCircle className="h-3 w-3" />
                {runResult.verdict || "Execution Error"}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="flex items-center gap-1 font-mono text-xs uppercase border-emerald-500/40 text-emerald-500 bg-emerald-500/10"
              >
                <CheckCircle2 className="h-3 w-3" />
                Executed Successfully
              </Badge>
            )}
            <span className="text-muted-foreground text-[11px] flex items-center gap-1">
              <Clock className="h-3 w-3" /> {runResult.durationMs}ms
            </span>
            {runResult.memoryKb && (
              <span className="text-muted-foreground text-[11px]">
                {Math.round(runResult.memoryKb / 1024)} MB
              </span>
            )}
          </div>
          {onRunAgain && (
            <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={onRunAgain}>
              Re-run
            </Button>
          )}
        </div>

        {runResult.compileOutput && (
          <div className="space-y-1">
            <span className="text-destructive font-semibold text-[11px]">Compiler Output:</span>
            <pre className="p-2.5 rounded bg-destructive/10 text-destructive border border-destructive/20 overflow-x-auto whitespace-pre-wrap text-[11px]">
              {runResult.compileOutput}
            </pre>
          </div>
        )}

        {runResult.stderr && (
          <div className="space-y-1">
            <span className="text-destructive font-semibold text-[11px]">Standard Error:</span>
            <pre className="p-2.5 rounded bg-destructive/10 text-destructive border border-destructive/20 overflow-x-auto whitespace-pre-wrap text-[11px]">
              {runResult.stderr}
            </pre>
          </div>
        )}

        <div className="space-y-1">
          <span className="text-muted-foreground font-semibold text-[11px] flex items-center gap-1">
            <Terminal className="h-3 w-3" /> Output:
          </span>
          <pre className="p-2.5 rounded bg-muted/50 border border-border overflow-x-auto whitespace-pre-wrap text-[11px] min-h-[50px] max-h-[220px]">
            {runResult.stdout || "(No standard output produced)"}
          </pre>
        </div>
      </div>
    );
  }

  if (!evaluation) return null;

  const currentResult: TestCaseResult | undefined = evaluation.results[selectedTestCase];

  const getVerdictBadge = () => {
    switch (evaluation.verdict) {
      case "Accepted":
        return (
          <Badge className="bg-emerald-600 text-white flex items-center gap-1.5 px-3 py-1 font-mono text-xs">
            <CheckCircle2 className="h-4 w-4" />
            Accepted
          </Badge>
        );
      case "Wrong Answer":
        return (
          <Badge
            variant="destructive"
            className="flex items-center gap-1.5 px-3 py-1 font-mono text-xs"
          >
            <XCircle className="h-4 w-4" />
            Wrong Answer
          </Badge>
        );
      case "Time Limit Exceeded":
        return (
          <Badge className="bg-amber-600 text-white flex items-center gap-1.5 px-3 py-1 font-mono text-xs">
            <Clock className="h-4 w-4" />
            Time Limit Exceeded
          </Badge>
        );
      case "Compilation Error":
        return (
          <Badge className="bg-purple-600 text-white flex items-center gap-1.5 px-3 py-1 font-mono text-xs">
            <AlertTriangle className="h-4 w-4" />
            Compilation Error
          </Badge>
        );
      default:
        return (
          <Badge
            variant="destructive"
            className="flex items-center gap-1.5 px-3 py-1 font-mono text-xs"
          >
            <XCircle className="h-4 w-4" />
            Runtime Error
          </Badge>
        );
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4 font-mono text-xs">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-3">
          {getVerdictBadge()}
          <span className="text-muted-foreground text-xs font-semibold">
            {evaluation.passedCount} / {evaluation.totalCount} Test Cases Passed
          </span>
          <span className="text-muted-foreground text-[11px]">
            ({evaluation.totalDurationMs}ms total)
          </span>
        </div>

        {onRunAgain && (
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onRunAgain}>
            Run Again
          </Button>
        )}
      </div>

      {/* Test Case Selectors */}
      <div className="flex flex-wrap items-center gap-2">
        {evaluation.results.map((res, idx) => (
          <button
            key={res.testCaseId}
            type="button"
            onClick={() => setSelectedTestCase(idx)}
            className={`px-3 py-1 rounded text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              selectedTestCase === idx
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-muted/40 hover:bg-muted text-muted-foreground"
            }`}
          >
            {res.passed ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            ) : (
              <XCircle className="h-3 w-3 text-destructive" />
            )}
            Case {idx + 1}
            {res.isHidden && <span className="text-[10px] opacity-70">(Hidden)</span>}
          </button>
        ))}
      </div>

      {/* Selected Test Case Details */}
      {currentResult && (
        <div className="rounded-md border border-border bg-muted/30 p-3 space-y-3">
          {currentResult.isHidden ? (
            <div className="text-center py-4 space-y-1">
              <p className="font-semibold text-foreground">Hidden Test Case</p>
              <p className="text-muted-foreground text-[11px]">
                {currentResult.passed
                  ? "✓ Your solution passed this private evaluation test case."
                  : "✗ Your solution failed on this hidden boundary or performance test case."}
              </p>
            </div>
          ) : (
            <>
              {currentResult.description && (
                <p className="text-muted-foreground font-sans text-xs italic">
                  Note: {currentResult.description}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold text-[11px]">Input:</span>
                  <pre className="p-2 rounded bg-background border border-border overflow-x-auto text-[11px]">
                    {currentResult.input || "(No input / empty)"}
                  </pre>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold text-[11px]">
                    Expected Output:
                  </span>
                  <pre className="p-2 rounded bg-background border border-border overflow-x-auto text-[11px]">
                    {currentResult.expectedOutput}
                  </pre>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[11px] text-muted-foreground">
                    Your Output:
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${currentResult.passed ? "text-emerald-500" : "text-destructive"}`}
                  >
                    {currentResult.passed ? "MATCHED" : "MISMATCH"}
                  </span>
                </div>
                <pre
                  className={`p-2 rounded border overflow-x-auto text-[11px] ${
                    currentResult.passed
                      ? "bg-emerald-500/5 border-emerald-500/30 text-foreground"
                      : "bg-destructive/10 border-destructive/30 text-destructive"
                  }`}
                >
                  {currentResult.actualOutput}
                </pre>
              </div>

              {currentResult.error && (
                <div className="space-y-1">
                  <span className="text-destructive font-semibold text-[11px]">
                    Diagnostic Trace:
                  </span>
                  <pre className="p-2 rounded bg-destructive/10 text-destructive border border-destructive/20 overflow-x-auto text-[11px]">
                    {currentResult.error}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
