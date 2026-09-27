import { useState } from "react";
import { CheckCircle2, Circle, Lock, Sparkles, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SKILL_TREES, computeNodeStatus, type SkillTreeNode } from "@/lib/skill-trees";

interface SkillTreeViewProps {
  userXp?: number;
}

export function SkillTreeView({ userXp = 120 }: SkillTreeViewProps) {
  const [selectedTrack, setSelectedTrack] = useState<string>("python");
  const [activeNode, setActiveNode] = useState<SkillTreeNode | null>(null);

  const currentTree = SKILL_TREES[selectedTrack] || SKILL_TREES.python!;
  const nodes = currentTree.nodes;

  const masteredCount = nodes.filter(
    (n) => computeNodeStatus(n, userXp, nodes) === "mastered",
  ).length;
  const progressPercent = Math.round((masteredCount / nodes.length) * 100);

  return (
    <div className="panel p-5 space-y-5">
      {/* Header & Track Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Interactive Engineering Skill Tree
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visualize your progression along defensible engineering tracks instead of a single flat
            XP number.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {Object.entries(SKILL_TREES).map(([key, tree]) => (
            <Button
              key={key}
              size="sm"
              variant={selectedTrack === key ? "default" : "outline"}
              onClick={() => {
                setSelectedTrack(key);
                setActiveNode(null);
              }}
              className="text-xs h-7 capitalize"
            >
              {key === "cpp" ? "C / C++" : key}
            </Button>
          ))}
        </div>
      </div>

      {/* Track Summary & Progress Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/30 p-3 rounded-lg border border-border">
        <div>
          <h4 className="font-bold text-sm text-foreground">{currentTree.name}</h4>
          <p className="text-xs text-muted-foreground">{currentTree.description}</p>
        </div>

        <div className="min-w-[180px] space-y-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground">Mastery:</span>
            <span className="font-bold text-primary">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </div>
      </div>

      {/* Visual Tree Progression Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
        {nodes.map((node, index) => {
          const status = computeNodeStatus(node, userXp, nodes);
          const isSelected = activeNode?.id === node.id;

          return (
            <div
              key={node.id}
              onClick={() => setActiveNode(node)}
              className={`cursor-pointer rounded-xl border p-3 flex flex-col justify-between space-y-3 transition-all ${
                isSelected
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                  : status === "mastered"
                    ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60"
                    : status === "in-progress"
                      ? "border-blue-500/40 bg-blue-500/5 hover:border-blue-500/60"
                      : "border-border bg-muted/20 opacity-60 hover:opacity-80"
              }`}
            >
              {/* Node Top Header */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-muted-foreground">
                  Tier {node.tier}
                </span>

                {status === "mastered" ? (
                  <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0 h-4 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Mastered
                  </Badge>
                ) : status === "in-progress" ? (
                  <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0 h-4 flex items-center gap-1">
                    <Circle className="h-2 w-2 animate-pulse fill-current" /> Active
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-4 flex items-center gap-1 text-muted-foreground"
                  >
                    <Lock className="h-2.5 w-2.5" /> {node.xpRequired} XP
                  </Badge>
                )}
              </div>

              {/* Node Title */}
              <div>
                <h5 className="font-semibold text-xs text-foreground line-clamp-1">{node.title}</h5>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                  {node.description}
                </p>
              </div>

              {/* Node Footer */}
              <div className="text-[10px] text-muted-foreground font-mono pt-1 border-t border-border/50">
                {status === "mastered"
                  ? "Verified"
                  : `${Math.max(0, node.xpRequired - userXp)} XP to unlock`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Node Details Drawer */}
      {activeNode && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" /> {activeNode.title}
            </h5>
            <Badge variant="outline" className="text-primary font-mono text-[11px]">
              Requirement: {activeNode.xpRequired} XP
            </Badge>
          </div>
          <p className="text-muted-foreground leading-relaxed">{activeNode.description}</p>
        </div>
      )}
    </div>
  );
}
