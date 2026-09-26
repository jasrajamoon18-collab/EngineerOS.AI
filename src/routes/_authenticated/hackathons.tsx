import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  HelpCircle,
  Lightbulb,
  Presentation,
  Rocket,
  Search,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  COMPETITIONS_DATA,
  RESEARCH_GUIDE_STEPS,
  type HackathonCompetition,
} from "@/lib/hackathons-data";

export const Route = createFileRoute("/_authenticated/hackathons")({
  head: () => ({
    meta: [
      { title: "Hackathons, Competitions & Research — EngineerOS" },
      {
        name: "description",
        content:
          "Hackathon idea generator, 24/48h MVP execution guides, engineering competition tracking, and undergraduate IEEE/ACM research methodology.",
      },
      {
        property: "og:title",
        content: "Hackathons, Competitions & Research — EngineerOS",
      },
      {
        property: "og:description",
        content: "Build hackathon-winning prototypes and navigate academic research.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HackathonsPage,
});

function HackathonsPage() {
  const [themeInput, setThemeInput] = useState("AI in Healthcare / Environmental Sustainability");
  const [techStackInput, setTechStackInput] = useState("Python, FastAPI, React, Gemini API, IoT");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPitch, setGeneratedPitch] = useState<string | null>(null);

  function handleGeneratePitch() {
    if (!themeInput.trim()) {
      toast.error("Please enter a theme or domain.");
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedPitch(`### 🏆 Winning Hackathon Blueprint: "${themeInput}"

#### 1. The Hook (Problem Statement - First 30 Seconds)
"Over 65% of field operators experience critical diagnostic delays because existing systems rely on manual logging. We built **SentinelEdge** to automate anomaly detection in real time."

#### 2. The Solution & Architecture (Next 60 Seconds)
- **Edge Layer:** Lightweight telemetry sensors streaming metrics over MQTT/WebSockets.
- **Intelligence Engine:** Local sliding-window anomaly detection with AI root-cause synthesis using ${techStackInput}.
- **Dashboard:** Real-time triage console with sub-100ms push alerts and webhook dispatch.

#### 3. 24-Hour MVP Milestones:
- **Hour 0–4:** Git repo setup, mock API contracts, UI wireframes.
- **Hour 4–12:** Core data ingestion pipeline & algorithm implementation.
- **Hour 12–18:** Frontend dashboard integration & alert dispatch engine.
- **Hour 18–22:** Seed realistic demo dataset & write 2-minute video pitch script.
- **Hour 22–24:** Practice presentation, freeze code, record backup video!

#### 4. The Live Demo Rule (What Judges Love):
Never show a login screen or empty dashboard. Pre-seed the system with realistic historical anomalies so the judge sees immediate value within 5 seconds of the demo.`);
      setIsGenerating(false);
      toast.success("Hackathon blueprint generated!");
    }, 700);
  }

  return (
    <>
      <PageHeader
        eyebrow="Innovation & National Recognition"
        title="Hackathons, Competitions & Research Hub"
        description="Master the hackathon winning formula, build high-speed MVPs, discover prestigious engineering competitions, and publish undergraduate research."
      />

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-9">
          <TabsTrigger value="generator" className="text-xs gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Hackathon Blueprint AI
          </TabsTrigger>
          <TabsTrigger value="playbook" className="text-xs gap-1.5">
            <Rocket className="h-3.5 w-3.5" />
            24h / 48h Playbook
          </TabsTrigger>
          <TabsTrigger value="competitions" className="text-xs gap-1.5">
            <Trophy className="h-3.5 w-3.5" />
            Competitions Tracker
          </TabsTrigger>
          <TabsTrigger value="research" className="text-xs gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Research & Patents
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: AI Idea & Pitch Generator */}
        <TabsContent value="generator" className="space-y-6">
          <section className="panel p-6 border-primary/20 bg-primary/5 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold">Hackathon Idea & Pitch Deck Generator</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your hackathon theme or track, and our engine generates a problem statement
              hook, technical architecture, 24-hour execution milestones, and demo script.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Hackathon Theme / Domain
                </label>
                <Input
                  value={themeInput}
                  onChange={(e) => setThemeInput(e.target.value)}
                  placeholder="e.g. Smart Cities, FinTech, Women Safety, Healthcare"
                  className="h-9 text-xs bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Team Tech Stack</label>
                <Input
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  placeholder="e.g. React, Node.js, Python, PostgreSQL, Gemini API"
                  className="h-9 text-xs bg-background"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleGeneratePitch}
                disabled={isGenerating}
                className="gap-2 text-xs font-semibold"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {isGenerating ? "Synthesizing Blueprint…" : "Generate Hackathon Blueprint"}
              </Button>
            </div>
          </section>

          {generatedPitch && (
            <section className="panel p-6 border-primary/30 bg-card space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Trophy className="h-4 w-4" />
                  Generated Pitch Deck & Execution Blueprint
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPitch);
                    toast.success("Blueprint copied!");
                  }}
                >
                  Copy to Clipboard
                </Button>
              </div>
              <div className="prose prose-sm dark:prose-invert text-xs leading-relaxed whitespace-pre-line text-foreground">
                {generatedPitch}
              </div>
            </section>
          )}
        </TabsContent>

        {/* Tab 2: 24h / 48h Playbook */}
        <TabsContent value="playbook" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="panel p-5 border-border space-y-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                1
              </div>
              <h3 className="text-sm font-bold">Team Role Allocation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Never have 4 people trying to code the frontend at once. Assign: 1 Frontend Lead, 1
                Backend/API Lead, 1 Data/AI/Systems Specialist, and 1 Pitch & Demo Czar.
              </p>
            </div>

            <div className="panel p-5 border-border space-y-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                2
              </div>
              <h3 className="text-sm font-bold">The 3-Minute Winning Pitch</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Minute 1: Relatable real-world problem with an alarming metric. Minute 2: Live
                interactive demo showing core value proposition. Minute 3: Business viability & tech
                scalability.
              </p>
            </div>

            <div className="panel p-5 border-border space-y-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                3
              </div>
              <h3 className="text-sm font-bold">Pre-Recorded Fallback Video</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                At hour 22, screen-record a 90-second video of your app working end-to-end. If venue
                Wi-Fi fails or APIs rate-limit during judging, your demo is saved.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Competitions Tracker */}
        <TabsContent value="competitions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {COMPETITIONS_DATA.map((comp) => (
              <article
                key={comp.id}
                className="panel p-5 border-border flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-bold">{comp.name}</h3>
                    <div className="flex gap-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        {comp.category}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {comp.mode}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-primary font-medium mt-1">
                    Organized by: {comp.organizer}
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {comp.overview}
                  </p>

                  <div className="mt-3 p-2.5 rounded bg-muted/30 border border-border text-[11px] space-y-1">
                    <div>
                      <strong className="text-foreground">Eligibility: </strong>
                      <span className="text-muted-foreground">{comp.eligibility}</span>
                    </div>
                    <div>
                      <strong className="text-foreground">Rewards: </strong>
                      <span className="text-primary font-medium">{comp.rewards}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-[11px] font-semibold text-foreground mb-1">
                      Winning Strategy Tips:
                    </p>
                    <ul className="space-y-1 list-disc list-inside text-[11px] text-muted-foreground">
                      {comp.winningTips.map((tip, tIdx) => (
                        <li key={tIdx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono text-[11px]">{comp.linkHint}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {comp.frequency}
                  </Badge>
                </div>
              </article>
            ))}
          </div>
        </TabsContent>

        {/* Tab 4: Research & Patents */}
        <TabsContent value="research" className="space-y-4">
          <section className="panel p-6 border-border space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold">Undergraduate Research & Patent Playbook</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              How to discover research gaps, digest peer-reviewed literature in IEEE/ACM, formulate
              novel algorithms, and file student patents.
            </p>

            <div className="grid gap-4 md:grid-cols-2 pt-2">
              {RESEARCH_GUIDE_STEPS.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-4 rounded-lg border border-border bg-card/40 space-y-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20">
                      {step.stepNumber}
                    </span>
                    <h3 className="text-xs font-bold text-foreground">{step.title}</h3>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{step.summary}</p>

                  <div className="p-2.5 rounded bg-surface border border-border text-[11px] text-foreground font-medium">
                    <span className="text-primary font-semibold">Actionable Technique: </span>
                    {step.actionableTechnique}
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">
                      Checklist:
                    </p>
                    <ul className="space-y-1 list-disc list-inside text-[11px] text-muted-foreground">
                      {step.studentChecklist.map((c, cIdx) => (
                        <li key={cIdx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </>
  );
}
