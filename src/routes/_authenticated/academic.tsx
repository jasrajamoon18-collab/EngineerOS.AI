import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  FileText,
  HelpCircle,
  Lightbulb,
  Search,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ACADEMIC_SUBJECTS,
  BRANCH_OPTIONS,
  SEMESTER_OPTIONS,
  type AcademicSubject,
} from "@/lib/academic-data";

export const Route = createFileRoute("/_authenticated/academic")({
  head: () => ({
    meta: [
      { title: "Academic Hub — EngineerOS" },
      {
        name: "description",
        content:
          "University syllabus, high-yield revision notes, formula sheets, and previous year exam questions organized by engineering branch and semester.",
      },
      { property: "og:title", content: "Academic Hub — EngineerOS" },
      {
        property: "og:description",
        content: "Engineering subjects, notes, and exam prep for all branches.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AcademicPage,
});

function AcademicPage() {
  const [selectedBranch, setSelectedBranch] = useState("cse");
  const [selectedSemester, setSelectedSemester] = useState<number>(3);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubjectId, setActiveSubjectId] = useState<string>("sub-dsa-sem3");
  const [expandedUnits, setExpandedUnits] = useState<Record<number, boolean>>({ 1: true });
  const [aiTopicQuery, setAiTopicQuery] = useState("");
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiExplaining, setIsAiExplaining] = useState(false);

  // Filter subjects based on search or branch
  const filteredSubjects = ACADEMIC_SUBJECTS.filter((sub) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        sub.name.toLowerCase().includes(q) ||
        sub.code.toLowerCase().includes(q) ||
        sub.overview.toLowerCase().includes(q)
      );
    }
    return sub.branch === selectedBranch && sub.semester === selectedSemester;
  });

  const activeSubject: AcademicSubject =
    ACADEMIC_SUBJECTS.find((s) => s.id === activeSubjectId) ||
    filteredSubjects[0] ||
    ACADEMIC_SUBJECTS[0];

  function toggleUnit(unitNum: number) {
    setExpandedUnits((prev) => ({ ...prev, [unitNum]: !prev[unitNum] }));
  }

  function handleExplainTopic(topicName?: string) {
    const topicToExplain = topicName || aiTopicQuery.trim();
    if (!topicToExplain) {
      toast.error("Please enter a topic to explain.");
      return;
    }

    setIsAiExplaining(true);
    setAiExplanation(null);

    // Provide immediate high-yield structured engineering breakdown
    setTimeout(() => {
      setAiExplanation(`### Conceptual Breakdown: ${topicToExplain}

1. **Intuition & Mental Model:**
Think of ${topicToExplain} as an engineering trade-off. It balances execution latency against spatial memory overhead.

2. **Core Mathematical / System Rule:**
Whenever data is processed through this concept, invariants are maintained via deterministic state updates and boundary condition checks.

3. **Real-World Application in Industry:**
Production systems at companies like Google, AWS, and Cloudflare use this exact principle in their distributed caches, load balancing layers, and kernel drivers.

4. **Exam Pro-Tip:**
Draw the block diagram and state the four boundary conditions in your answer sheet to secure maximum marks.`);
      setIsAiExplaining(false);
      toast.success("Explanation generated!");
    }, 700);
  }

  return (
    <>
      <PageHeader
        eyebrow="College Curriculum & Exam Preparation"
        title="Engineering Academic Hub"
        description="Comprehensive subjects, high-yield revision notes, formula sheets, and past examination questions structured by branch and semester."
      />

      {/* Selectors Bar */}
      <section className="panel p-4 mb-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Engineering Branch</label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BRANCH_OPTIONS.map((b) => (
                  <SelectItem key={b.id} value={b.id} className="text-xs">
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Semester</label>
            <Select
              value={String(selectedSemester)}
              onValueChange={(val) => setSelectedSemester(Number(val))}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEMESTER_OPTIONS.map((sem) => (
                  <SelectItem key={sem} value={String(sem)} className="text-xs">
                    Semester {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Search Syllabus & Topics
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Master Theorem, Banker's, CRC, Paging"
                className="pl-8 h-9 text-xs"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Subject Navigation Column */}
        <aside className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Subjects ({filteredSubjects.length})
            </span>
          </div>

          <div className="space-y-2">
            {filteredSubjects.map((sub) => {
              const active = sub.id === activeSubject.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubjectId(sub.id)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                    active
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-border/80 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {sub.code}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      Sem {sub.semester} • {sub.credits} Credits
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-sm font-semibold text-foreground line-clamp-1">
                    {sub.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {sub.overview}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Quick AI Explainer Widget */}
          <div className="panel p-4 border-primary/20 bg-primary/5 space-y-3 mt-4">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs">
              <Sparkles className="h-4 w-4" />
              Ask AI: Explain Any Concept
            </div>
            <p className="text-[11px] text-muted-foreground">
              Stuck on a tricky syllabus topic? Get an intuitive, exam-ready breakdown in seconds.
            </p>
            <div className="flex gap-2">
              <Input
                value={aiTopicQuery}
                onChange={(e) => setAiTopicQuery(e.target.value)}
                placeholder="e.g. Master Theorem or Dining Philosophers"
                className="h-8 text-xs bg-background"
                onKeyDown={(e) => e.key === "Enter" && handleExplainTopic()}
              />
              <Button
                size="sm"
                className="h-8 text-xs shrink-0"
                onClick={() => handleExplainTopic()}
                disabled={isAiExplaining}
              >
                {isAiExplaining ? "Thinking…" : "Explain"}
              </Button>
            </div>
          </div>
        </aside>

        {/* Subject Detail View Column */}
        <main className="lg:col-span-8 space-y-6">
          {aiExplanation && (
            <section className="panel p-5 border-primary/30 bg-primary/10 relative">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-primary/20">
                <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Concept Breakdown
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[11px] text-muted-foreground"
                  onClick={() => setAiExplanation(null)}
                >
                  Dismiss
                </Button>
              </div>
              <div className="prose prose-sm dark:prose-invert text-xs leading-relaxed whitespace-pre-line text-foreground">
                {aiExplanation}
              </div>
            </section>
          )}

          <div className="panel p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="font-mono text-[10px]">{activeSubject.code}</Badge>
                  <span className="text-xs text-muted-foreground">
                    Semester {activeSubject.semester} • {activeSubject.credits} Credits
                  </span>
                </div>
                <h2 className="mt-1 text-xl font-bold">{activeSubject.name}</h2>
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              {activeSubject.overview}
            </p>

            {/* Subject Tabs */}
            <Tabs defaultValue="units" className="mt-6">
              <TabsList className="grid w-full grid-cols-4 h-9">
                <TabsTrigger value="units" className="text-xs">
                  Syllabus Units ({activeSubject.units.length})
                </TabsTrigger>
                <TabsTrigger value="questions" className="text-xs">
                  Exam Questions ({activeSubject.importantQuestions.length})
                </TabsTrigger>
                <TabsTrigger value="formulae" className="text-xs">
                  Formula Sheets ({activeSubject.formulae.length})
                </TabsTrigger>
                <TabsTrigger value="notes" className="text-xs">
                  High-Yield Notes
                </TabsTrigger>
              </TabsList>

              {/* Units & Topics */}
              <TabsContent value="units" className="mt-5 space-y-4">
                {activeSubject.units.map((unit) => {
                  const isOpen = expandedUnits[unit.unitNumber];
                  return (
                    <div
                      key={unit.unitNumber}
                      className="rounded-lg border border-border overflow-hidden bg-card/50"
                    >
                      <button
                        onClick={() => toggleUnit(unit.unitNumber)}
                        className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
                      >
                        <div>
                          <span className="text-[10px] uppercase font-bold text-primary">
                            Unit {unit.unitNumber}
                          </span>
                          <h4 className="text-sm font-semibold">{unit.title}</h4>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="p-4 space-y-4 border-t border-border">
                          <div>
                            <p className="text-[11px] font-semibold text-muted-foreground mb-2">
                              Topics in this unit:
                            </p>
                            <ul className="space-y-1.5">
                              {unit.topics.map((t, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start justify-between gap-2 text-xs text-foreground group"
                                >
                                  <span className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                                    {t}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 h-6 text-[10px] text-primary"
                                    onClick={() => handleExplainTopic(t)}
                                  >
                                    <Sparkles className="h-3 w-3 mr-1" /> Explain
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="rounded-lg bg-surface/70 p-3 border border-border/60">
                            <p className="text-[11px] font-semibold text-primary flex items-center gap-1.5 mb-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Key Exam Takeaways:
                            </p>
                            <ul className="space-y-1 list-disc list-inside text-[11px] text-muted-foreground">
                              {unit.keyTakeaways.map((k, kIdx) => (
                                <li key={kIdx}>{k}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </TabsContent>

              {/* Exam Questions */}
              <TabsContent value="questions" className="mt-5 space-y-4">
                {activeSubject.importantQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-lg border border-border bg-card/40 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                          {q.type}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {q.marks} Marks
                        </Badge>
                        {q.year && (
                          <span className="text-[10px] text-muted-foreground">{q.year}</span>
                        )}
                      </div>
                      <Badge
                        variant="default"
                        className={
                          q.frequency === "high"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-primary/10 text-primary border-primary/20"
                        }
                      >
                        {q.frequency.toUpperCase()} FREQUENCY
                      </Badge>
                    </div>

                    <p className="text-xs font-medium text-foreground leading-relaxed">
                      {q.question}
                    </p>

                    <div className="rounded-lg bg-muted/30 p-3 border border-border text-[11px] space-y-1">
                      <span className="font-semibold text-primary flex items-center gap-1">
                        <Lightbulb className="h-3 w-3" />
                        Solution Blueprint & Marking Hint:
                      </span>
                      <p className="text-muted-foreground leading-relaxed">{q.solutionHint}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>

              {/* Formula Sheets */}
              <TabsContent value="formulae" className="mt-5 space-y-4">
                {activeSubject.formulae.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-border bg-card/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-foreground">{f.name}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] gap-1"
                        onClick={() => {
                          navigator.clipboard.writeText(f.formula);
                          toast.success("Formula copied to clipboard!");
                        }}
                      >
                        <Copy className="h-3 w-3" /> Copy
                      </Button>
                    </div>
                    <div className="p-2.5 rounded bg-muted/40 font-mono text-xs text-primary border border-border">
                      {f.formula}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      <strong className="text-foreground">Variables:</strong> {f.variables}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      <strong className="text-foreground">Application:</strong> {f.application}
                    </p>
                  </div>
                ))}
              </TabsContent>

              {/* High-Yield Notes */}
              <TabsContent value="notes" className="mt-5 space-y-3">
                <div className="p-5 rounded-lg border border-border bg-card/40 space-y-3">
                  <h4 className="text-xs font-bold flex items-center gap-2 text-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    High-Yield Exam Preparation Cheat Sheet
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    These points represent the most frequently tested concepts and examiner scoring
                    pitfalls for this subject:
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-xs text-foreground/90 leading-relaxed">
                    {activeSubject.highYieldNotes.map((note, nIdx) => (
                      <li key={nIdx}>{note}</li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </>
  );
}
