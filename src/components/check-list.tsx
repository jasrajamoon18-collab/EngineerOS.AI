import { Check as CheckIcon, X } from "lucide-react";
import type { Check } from "@/lib/career";
import { checkScore } from "@/lib/career";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function CheckList({ checks, label }: { checks: Check[]; label?: string }) {
  if (!checks.length) return null;
  const score = checkScore(checks);
  return (
    <div className="mt-4 rounded-lg border border-border bg-muted/40 p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="label-mono text-muted-foreground">{label ?? "Rule-based check"}</p>
        <p className="label-mono text-primary">{score}% of checks passed</p>
      </div>
      <Progress className="mt-2 h-1.5" value={score} />
      <ul className="mt-3 space-y-2">
        {checks.map((check) => (
          <li key={check.id} className="flex gap-2 text-sm">
            <span
              className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                check.passed ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive",
              )}
              aria-hidden="true"
            >
              {check.passed ? <CheckIcon className="h-3 w-3" /> : <X className="h-3 w-3" />}
            </span>
            <span>
              <span className="font-medium">{check.label}</span>
              <span className="sr-only">{check.passed ? " — passed" : " — not passed"}</span>
              <span className="block text-xs text-muted-foreground">{check.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
