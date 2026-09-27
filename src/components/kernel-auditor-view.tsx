import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  ArrowRight,
  Flame,
  FileCheck,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { runKernelSystemAudit, type SystemAuditReport, type AuditFinding } from "@/lib/auditor";

export function KernelAuditorView() {
  const [report, setReport] = useState<SystemAuditReport>(runKernelSystemAudit());
  const [isAuditing, setIsAuditing] = useState(false);

  const handleRunAudit = () => {
    setIsAuditing(true);
    toast.info("Auditor IPC Active: Scanning Proof-of-Work receipts...");
    setTimeout(() => {
      const fresh = runKernelSystemAudit();
      setReport(fresh);
      setIsAuditing(false);
      toast.success("Kernel Audit Complete", {
        description: `Verified ${fresh.verifiedCount} claims. Flagged ${fresh.discrepanciesCount} claim contradictions.`,
      });
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Auditor Header */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold tracking-tight">
                  The Kernel Auditor (AI Mentor v3)
                </h3>
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] text-rose-500 border-rose-500/30"
                >
                  SYSTEM INTEGRITY AUDIT
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Zero generic lectures. The Auditor cross-references your claimed skills against
                immutable Proof Wall receipts and issues 1 corrective mission for every gap.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="default"
              className="font-mono text-xs shadow-sm"
              onClick={handleRunAudit}
              disabled={isAuditing}
            >
              <RotateCw className={`mr-1.5 h-3.5 w-3.5 ${isAuditing ? "animate-spin" : ""}`} />
              {isAuditing ? "Scanning Ledger..." : "Run Audit Now"}
            </Button>
          </div>
        </div>

        {/* Audit Health Overview */}
        <div className="mt-5 rounded-xl border border-border/80 bg-muted/40 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-mono text-xs font-semibold">
              Claim Integrity Score: {report.overallHealthPercent}%
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {report.verifiedCount} Verified · {report.discrepanciesCount} Contradictions Flagged
            </span>
          </div>
          <Progress value={report.overallHealthPercent} className="h-2 mt-2" />
          <p className="mt-2 text-xs text-muted-foreground">{report.auditorSummary}</p>
        </div>
      </div>

      {/* Findings Stream */}
      <div className="space-y-4">
        <h4 className="font-display text-sm font-bold tracking-tight">
          Audit Ledger Findings & Corrective Directives
        </h4>

        {report.findings.map((f) => (
          <div
            key={f.id}
            className={`rounded-2xl border p-5 shadow-sm transition-all ${
              f.severity === "CRITICAL"
                ? "border-rose-500/40 bg-rose-500/5"
                : f.severity === "WARNING"
                  ? "border-amber-500/40 bg-amber-500/5"
                  : "border-border bg-card"
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      f.severity === "CRITICAL"
                        ? "destructive"
                        : f.severity === "WARNING"
                          ? "secondary"
                          : "outline"
                    }
                    className="font-mono text-[9px] uppercase px-1.5 py-0"
                  >
                    {f.severity}
                  </Badge>
                  <span className="font-semibold text-sm text-foreground">{f.skillClaim}</span>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="text-muted-foreground font-mono">
                    <strong className="text-foreground">Proof Evidence:</strong> {f.proofEvidence}
                  </p>
                  <p
                    className={`font-mono font-medium ${
                      f.severity === "CRITICAL"
                        ? "text-rose-500 dark:text-rose-400"
                        : f.severity === "WARNING"
                          ? "text-amber-500 dark:text-amber-400"
                          : "text-emerald-500 dark:text-emerald-400"
                    }`}
                  >
                    {f.auditVerdict}
                  </p>
                </div>
              </div>
            </div>

            {/* Corrective Action Box */}
            <div className="mt-4 rounded-xl border border-border/80 bg-background/80 p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-primary">
                  Kernel Corrective Directive: {f.correctiveMission.title}
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {f.correctiveMission.description}
                </p>
              </div>
              <Button
                size="sm"
                asChild
                className="font-mono text-xs shrink-0 self-end sm:self-auto"
              >
                <Link to={f.correctiveMission.route}>
                  {f.correctiveMission.actionLabel}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
