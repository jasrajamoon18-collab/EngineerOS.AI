import { useState } from "react";
import { Check, Copy, Share2, Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MilestoneShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  category: "dsa" | "lesson" | "streak" | "badge" | "interview";
  details: string;
  codeSnippet?: string;
  metric?: string;
}

export function MilestoneShareDialog({
  open,
  onOpenChange,
  title,
  category,
  details,
  codeSnippet,
  metric,
}: MilestoneShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `🚀 Milestone achieved on EngineerOS!\n\n🏆 ${title}\n📌 ${details}\n${metric ? `⚡ Metric: ${metric}\n` : ""}\nBuilding real engineering depth: https://engineeros.ai`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("Milestone card text copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy card");
    }
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleLinkedInShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://engineeros.ai")}&summary=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Trophy className="h-5 w-5 text-amber-500" />
            Share Milestone
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Celebrate your verified progress with your network or study group.
          </DialogDescription>
        </DialogHeader>

        {/* Milestone Preview Card */}
        <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-4 shadow-md space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="font-bold tracking-tight text-primary text-sm flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> EngineerOS Verified
            </span>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase text-[10px] font-semibold">
              {category}
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="font-sans font-bold text-base text-foreground">{title}</h4>
            <p className="text-muted-foreground font-sans text-xs">{details}</p>
            {metric && <p className="text-emerald-500 font-semibold text-xs mt-1">✓ {metric}</p>}
          </div>

          {codeSnippet && (
            <div className="mt-2 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase">
                Accepted Solution:
              </span>
              <pre className="p-2 rounded bg-muted/60 border border-border/80 overflow-x-auto text-[10px] max-h-24">
                {codeSnippet.slice(0, 300) + (codeSnippet.length > 300 ? "\n..." : "")}
              </pre>
            </div>
          )}

          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>engineeros.ai</span>
            <span>Private by default • Verified execution</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1 text-xs">
            {copied ? (
              <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 mr-1.5" />
            )}
            {copied ? "Copied" : "Copy Card Text"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleTwitterShare} className="text-xs">
            Post on 𝕏
          </Button>
          <Button variant="outline" size="sm" onClick={handleLinkedInShare} className="text-xs">
            LinkedIn
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
