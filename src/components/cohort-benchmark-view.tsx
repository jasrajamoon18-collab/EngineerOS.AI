import { useState } from "react";
import { Users2, BarChart2, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { getCohortBenchmarks, type StudentCohortBenchmark } from "@/lib/cohort-benchmarks";
import { loadKernelState, saveKernelState } from "@/lib/kernel";

export function CohortBenchmarkView() {
  const kernel = loadKernelState();
  const [optIn, setOptIn] = useState(kernel.cohortOptIn);
  const [data] = useState<StudentCohortBenchmark>(
    getCohortBenchmarks(kernel.branch, kernel.year, kernel.collegeTier),
  );

  const handleToggleOptIn = (val: boolean) => {
    setOptIn(val);
    saveKernelState({ ...kernel, cohortOptIn: val });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <Users2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold tracking-tight">
                  Cohort Calibration (Non-toxic Peer Benchmarks)
                </h3>
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] text-purple-600 border-purple-500/30"
                >
                  ZERO PUBLIC LEADERBOARD
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Anonymized percentile distribution against {data.totalBatchSample} verified students
                in your exact branch, year, and college tier.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="font-mono text-xs text-muted-foreground">Peer Calibration:</span>
            <Switch checked={optIn} onCheckedChange={handleToggleOptIn} />
          </div>
        </div>

        {optIn ? (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3 border-t border-border pt-4">
            <div>
              <span className="text-[11px] font-mono text-muted-foreground uppercase">
                Comparison Group
              </span>
              <p className="font-semibold text-sm mt-0.5">{kernel.branch}</p>
              <p className="text-xs text-muted-foreground">
                {kernel.collegeTier} · Year {kernel.year}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-mono text-muted-foreground uppercase">
                Overall Batch Standing
              </span>
              <p className="font-semibold text-sm mt-0.5 text-purple-600 dark:text-purple-400">
                Top {100 - data.overallPercentile}% of Cohort
              </p>
              <p className="text-xs text-muted-foreground">Based on verified proofs & execution</p>
            </div>
            <div>
              <span className="text-[11px] font-mono text-muted-foreground uppercase">
                Calibration Sample
              </span>
              <p className="font-semibold text-sm mt-0.5">
                {data.totalBatchSample} Anonymous Peers
              </p>
              <p className="text-xs text-muted-foreground">Double-blind privacy guaranteed</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-muted/40 p-4 text-xs text-muted-foreground text-center">
            Cohort calibration is currently paused. Toggle on to benchmark your skills against
            same-year peers without public rankings.
          </div>
        )}
      </div>

      {/* Benchmark Metrics List */}
      {optIn && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-sm font-bold tracking-tight">
              Topic-Wise Competency Distribution
            </h4>
            <span className="font-mono text-xs text-muted-foreground">
              Updated {data.lastCalculatedDate}
            </span>
          </div>

          <div className="divide-y divide-border">
            {data.metrics.map((m) => (
              <div key={m.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-foreground">{m.topic}</span>
                    <Badge variant="secondary" className="font-mono text-[9px] px-1 py-0">
                      {m.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      Top {100 - m.percentile}%
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      ({m.percentile}th percentile)
                    </span>
                  </div>
                </div>

                <Progress value={m.percentile} className="h-2" />

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {m.status === "strong" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  )}
                  <span>{m.insight}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
