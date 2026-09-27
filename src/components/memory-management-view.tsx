import { useState } from "react";
import { toast } from "sonner";
import {
  Layers,
  HardDrive,
  RefreshCw,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Code,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { loadSkillMemoryPages, pageInSkill, type SkillMemoryPage } from "@/lib/memory-management";

export function MemoryManagementView() {
  const [pages, setPages] = useState<SkillMemoryPage[]>(loadSkillMemoryPages());
  const [activeDrillPage, setActiveDrillPage] = useState<SkillMemoryPage | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [drillAnswered, setDrillAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const resident = pages.filter((p) => p.state === "RESIDENT_RAM");
  const dirty = pages.filter((p) => p.state === "DIRTY_PAGE");
  const swapped = pages.filter((p) => p.state === "SWAPPED_TO_DISK");
  const atRisk = pages.filter((p) => p.state === "AT_RISK_OOM_KILL");

  const totalPages = Math.max(1, pages.length);
  const avgRetention = Math.round(
    pages.reduce((acc, p) => acc + p.retentionPercent, 0) / totalPages,
  );

  const handleStartDrill = (page: SkillMemoryPage) => {
    setActiveDrillPage(page);
    setSelectedOption(null);
    setDrillAnswered(false);
    setIsCorrect(false);
  };

  const handleAnswerDrill = () => {
    if (selectedOption === null || !activeDrillPage) return;
    const correct = selectedOption === activeDrillPage.refresherDrill.correctIndex;
    setIsCorrect(correct);
    setDrillAnswered(true);

    if (correct) {
      pageInSkill(activeDrillPage.id);
      setPages(loadSkillMemoryPages());
      toast.success(`PAGE IN SUCCESS: [${activeDrillPage.skillName}]`, {
        description: `Concept restored to Resident RAM at ${activeDrillPage.virtualAddress}. Retention set to 100%.`,
      });
    } else {
      toast.error("Incorrect Retrieval", {
        description: "Review the explanation below and re-attempt to warm the memory cache.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* MMU Header & Allocation Bar */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold tracking-tight">
                  Virtual Memory Manager (Spaced Repetition MMU)
                </h3>
                <Badge variant="outline" className="font-mono text-[10px]">
                  Avg Retention: {avgRetention}%
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Your brain visualized as physical RAM & disk swap. Skills decay if not accessed.
                Proactively page them in.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs">
              {pages.length} Pages Allocated
            </Badge>
          </div>
        </div>

        {/* Visual Memory Blocks (Defrag / RAM Table Style) */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span>Physical Memory Frames (0x7FFF0000 - 0x7FFF0FFF)</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-emerald-500" /> Resident RAM
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-amber-400" /> Dirty Page
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-rose-500" /> Swapped to Disk
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-red-800" /> OOM Kill Risk
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 p-2 rounded-xl bg-muted/40 border border-border/60">
            {pages.map((p) => {
              const bg =
                p.state === "RESIDENT_RAM"
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : p.state === "DIRTY_PAGE"
                    ? "bg-amber-400 hover:bg-amber-500 text-zinc-900"
                    : p.state === "SWAPPED_TO_DISK"
                      ? "bg-rose-500 hover:bg-rose-600 text-white"
                      : "bg-red-800 hover:bg-red-900 text-white animate-pulse";

              return (
                <button
                  key={p.id}
                  onClick={() => handleStartDrill(p)}
                  className={`h-12 rounded-lg p-1.5 font-mono text-[10px] text-left transition-all flex flex-col justify-between ${bg}`}
                  title={`${p.skillName} (${p.retentionPercent}% retention, ${p.state})`}
                >
                  <span className="truncate font-semibold">{p.virtualAddress.slice(-4)}</span>
                  <span className="truncate">{p.retentionPercent}%</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pages Table & Page In Actions */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between pb-4">
          <h4 className="font-display text-sm font-bold tracking-tight">
            Skill Memory Pages Table
          </h4>
          <span className="font-mono text-xs text-muted-foreground">
            {swapped.length + atRisk.length} Skill(s) in Disk Swap
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-[11px]">
                <th className="pb-2 font-medium">Virtual Addr</th>
                <th className="pb-2 font-medium">Concept Page</th>
                <th className="pb-2 font-medium">State</th>
                <th className="pb-2 font-medium">Retention</th>
                <th className="pb-2 font-medium">Last Recall</th>
                <th className="pb-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 text-muted-foreground">{p.virtualAddress}</td>
                  <td className="py-3 font-semibold text-foreground">{p.skillName}</td>
                  <td className="py-3">
                    <Badge
                      variant={
                        p.state === "RESIDENT_RAM"
                          ? "default"
                          : p.state === "DIRTY_PAGE"
                            ? "secondary"
                            : p.state === "SWAPPED_TO_DISK"
                              ? "outline"
                              : "destructive"
                      }
                      className="font-mono text-[9px] uppercase px-1.5 py-0"
                    >
                      {p.state.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Progress value={p.retentionPercent} className="w-16 h-1.5" />
                      <span className="text-[11px]">{p.retentionPercent}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {p.daysSinceLastRecall === 0 ? "Today" : `${p.daysSinceLastRecall}d ago`}
                  </td>
                  <td className="py-3 text-right">
                    <Button
                      size="sm"
                      variant={p.state === "RESIDENT_RAM" ? "ghost" : "default"}
                      className="h-7 text-xs font-mono px-2.5"
                      onClick={() => handleStartDrill(p)}
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
                      {p.state === "RESIDENT_RAM" ? "Refresh" : "Page In (5m)"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Page In Interactive Modal */}
      {activeDrillPage && (
        <Dialog open={!!activeDrillPage} onOpenChange={(open) => !open && setActiveDrillPage(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2 text-primary font-mono text-xs">
                <RefreshCw className="h-4 w-4" />
                <span>PAGE FAULT RESOLUTION: 5-MIN RETRIEVAL DRILL</span>
              </div>
              <DialogTitle className="text-lg">
                Restore {activeDrillPage.skillName} to RAM
              </DialogTitle>
              <DialogDescription className="text-xs">
                Virtual Address: {activeDrillPage.virtualAddress} · Current Retention:{" "}
                {activeDrillPage.retentionPercent}%
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <p className="text-sm font-medium text-foreground">
                {activeDrillPage.refresherDrill.question}
              </p>

              {activeDrillPage.refresherDrill.codeSnippet && (
                <pre className="rounded-lg bg-zinc-950 p-3 font-mono text-xs text-zinc-100 overflow-x-auto border border-zinc-800">
                  {activeDrillPage.refresherDrill.codeSnippet}
                </pre>
              )}

              <div className="space-y-2">
                {activeDrillPage.refresherDrill.options.map((opt, idx) => {
                  let optStyle = "border-border hover:bg-muted/60";
                  if (drillAnswered) {
                    if (idx === activeDrillPage.refresherDrill.correctIndex) {
                      optStyle =
                        "border-emerald-500 bg-emerald-500/10 text-emerald-600 font-semibold";
                    } else if (idx === selectedOption) {
                      optStyle = "border-destructive bg-destructive/10 text-destructive";
                    }
                  } else if (selectedOption === idx) {
                    optStyle = "border-primary bg-primary/10 text-primary font-semibold";
                  }

                  return (
                    <button
                      key={opt}
                      disabled={drillAnswered}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full rounded-xl border p-3 text-left text-xs transition-all flex items-center justify-between ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {drillAnswered && idx === activeDrillPage.refresherDrill.correctIndex && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 ml-2" />
                      )}
                      {drillAnswered && idx === selectedOption && !isCorrect && (
                        <XCircle className="h-4 w-4 text-destructive shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {drillAnswered && (
                <div
                  className={`rounded-xl p-3 text-xs ${
                    isCorrect
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                      : "bg-destructive/10 border border-destructive/30 text-destructive"
                  }`}
                >
                  <p className="font-semibold">
                    {isCorrect ? "Correct!" : "Retrieval Gap Detected"}
                  </p>
                  <p className="mt-1">{activeDrillPage.refresherDrill.explanation}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {!drillAnswered ? (
                <Button
                  onClick={handleAnswerDrill}
                  disabled={selectedOption === null}
                  className="font-mono text-xs"
                >
                  Verify Page In
                </Button>
              ) : (
                <Button onClick={() => setActiveDrillPage(null)} className="font-mono text-xs">
                  Close & Continue
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
