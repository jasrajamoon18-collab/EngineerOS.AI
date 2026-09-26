import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BookOpen,
  Check,
  Copy,
  Mail,
  MessagesSquare,
  PenTool,
  Presentation,
  Send,
  Sparkles,
  Volume2,
} from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { CheckList } from "@/components/check-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { awardXp } from "@/lib/progress";
import { analyseCommunication, wordCount } from "@/lib/career";
import { communicationEntriesQuery, communicationPromptsQuery, profileQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/communication")({
  head: () => ({
    meta: [
      { title: "Communication Academy — EngineerOS" },
      {
        name: "description",
        content:
          "Daily technical writing drills, cold outreach email templates, seminar presentation outlines, and vocabulary builder.",
      },
      { property: "og:title", content: "Communication Academy — EngineerOS" },
      {
        property: "og:description",
        content: "Professional technical communication, emails, presentations, and daily drills.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CommunicationPage,
});

const EMAIL_TEMPLATES = [
  {
    id: "internship-cold",
    title: "Cold Email for Software / Hardware Internship",
    subject: "Application for Summer Engineering Internship — [Your Name]",
    body: `Dear [Hiring Manager / Team Lead Name],

I hope this email finds you well.

I have been following [Company Name]'s recent work on [Specific Product / Project], especially [Specific Feature or Tech Architecture]. As an engineering student at [Your College] with hands-on experience in [Your Core Tech, e.g. Python, Docker, and Distributed Systems], I am writing to express my strong interest in a Summer Engineering Internship with your team.

Recently, I built [Project Name] (GitHub: [Link]), where I implemented [Key Feature] that achieved [Key Result, e.g., reduced response latency by 35%]. 

I would welcome the opportunity to contribute to [Company Name]'s engineering goals. I have attached my resume for your review and would appreciate a brief 10-minute conversation if you have availability.

Thank you for your time and consideration.

Best regards,
[Your Name]
[LinkedIn Profile URL] | [GitHub Profile URL]
[Phone Number]`,
  },
  {
    id: "recruiter-linkedin",
    title: "LinkedIn Recruiter Connection Note (300 char limit)",
    subject: "Connection Request",
    body: `Hi [Recruiter Name], I noticed you lead technical hiring for [Team Name] at [Company]. I am a CS student passionate about backend distributed systems and built a fault-tolerant queue with Redis & Go. I'd love to connect and keep in touch regarding entry-level engineering roles!`,
  },
  {
    id: "prof-research",
    title: "Research Assistantship Request to Professor",
    subject: "Undergraduate Research Assistantship Inquiry — [Your Name]",
    body: `Dear Professor [Professor's Last Name],

I am an engineering student in your [Course Name] class (or at [Department Name]). I recently read your published paper on "[Paper Title]" and found your approach to [Specific Methodology] particularly fascinating.

I have solid background in [Relevant Skills, e.g. Linear Algebra, PyTorch, C++] and have worked on [Brief Project Mention]. I am eager to contribute to your laboratory's ongoing research projects as an undergraduate assistant.

Could I meet with you for 15 minutes during your office hours next week to discuss potential opportunities?

Sincerely,
[Your Name]
[Student ID] | [Your Department]`,
  },
  {
    id: "interview-thanks",
    title: "Post-Interview Thank You Note",
    subject: "Thank You — [Your Name] for [Role Name] Interview",
    body: `Hi [Interviewer Name],

Thank you for taking the time to speak with me today about the [Role Name] position at [Company Name]. I really enjoyed our discussion regarding [Specific Technical Topic Discussed, e.g., scaling database read replicas during traffic spikes].

Our conversation reinforced my enthusiasm for joining your team and tackling [Specific Challenge Mentioned]. 

Please let me know if you need any additional code samples or information from my end.

Best regards,
[Your Name]`,
  },
];

const DAILY_VOCABULARY = [
  {
    word: "Idempotent",
    phonetic: "/ˌaɪ.dəmˈpoʊ.tənt/",
    category: "Systems & APIs",
    definition:
      "An operation that can be applied multiple times without changing the result beyond the initial application (e.g., HTTP PUT/DELETE or database upserts).",
    example:
      "Payment processing webhooks must be strictly idempotent to prevent duplicate credit card charges if network retries occur.",
  },
  {
    word: "Orthogonal",
    phonetic: "/ɔːrˈθɑː.ɡən.əl/",
    category: "Software Architecture",
    definition:
      "Components or design features that can vary independently without side effects on each other.",
    example:
      "Our caching strategy is completely orthogonal to database query logic, allowing us to swap Redis for Memcached seamlessly.",
  },
  {
    word: "Amortized",
    phonetic: "/ˈæm.ər.taɪzd/",
    category: "Algorithms",
    definition:
      "The average cost per operation over a worst-case sequence of operations (e.g. dynamic array resizing).",
    example:
      "Appending to a dynamic array takes amortized O(1) time despite occasional O(n) reallocation spikes.",
  },
  {
    word: "Determinism",
    phonetic: "/dɪˈtɜːr.mɪ.nɪ.zəm/",
    category: "Core Computing",
    definition:
      "Given the exact same initial state and input, the system will always produce the identical output through identical state transitions.",
    example:
      "Automated unit tests must have strict determinism, avoiding non-deterministic sleep timers or random seeds.",
  },
  {
    word: "Latency",
    phonetic: "/ˈleɪ.tən.si/",
    category: "Networking & Performance",
    definition:
      "The time delay between a request initiation and the first byte of response reception.",
    example:
      "By placing CDN edge nodes closer to users, we reduced 99th percentile p99 API latency from 450ms down to 42ms.",
  },
];

function CommunicationPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: prompts = [] } = useQuery(communicationPromptsQuery());
  const { data: entries = [] } = useQuery(communicationEntriesQuery(user?.id));
  const { data: profile } = useQuery(profileQuery(user?.id));

  const [activeId, setActiveId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  // Email template state
  const [selectedTemplate, setSelectedTemplate] = useState(EMAIL_TEMPLATES[0]);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Presentation builder state
  const [presentationTopic, setPresentationTopic] = useState(
    "Microservices vs Monolith Architecture",
  );
  const [presentationDuration, setPresentationDuration] = useState("10 Minutes");
  const [generatedSlides, setGeneratedSlides] = useState<string | null>(null);
  const [isBuildingSlides, setIsBuildingSlides] = useState(false);

  const categories = [...new Set(prompts.map((p) => p.category))];
  const active = prompts.find((p) => p.id === activeId) ?? prompts[0];
  const doneIds = new Set(entries.map((e) => e.prompt_id));
  const checks = active && text.trim() ? analyseCommunication(text, active.min_words) : [];

  async function submit() {
    if (!user || !active) return;
    if (wordCount(text) < 20) {
      toast.error("Write at least 20 words so the checks mean something.");
      return;
    }
    setSaving(true);
    const feedback = analyseCommunication(text, active.min_words);
    const { error } = await supabase.from("communication_entries").insert({
      user_id: user.id,
      prompt_id: active.id,
      response_text: text,
      word_count: wordCount(text),
      feedback: feedback as unknown as Json,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await awardXp(user.id, profile, 15);
    await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    await queryClient.invalidateQueries({ queryKey: ["communication-entries", user.id] });
    toast.success("+15 XP · drill logged");
    setText("");
  }

  function handleBuildPresentation() {
    if (!presentationTopic.trim()) return;
    setIsBuildingSlides(true);
    setTimeout(() => {
      setGeneratedSlides(`### 📊 Technical Seminar Presentation Structure
**Topic:** ${presentationTopic} (${presentationDuration})

---
#### Slide 1: Title & The Hook (1 min)
- **Title:** ${presentationTopic}
- **Subtitle:** Trade-offs, Failure Modes, and Production Realities
- **Speaker Note:** "Start with a 10-second story about a production outage caused by architectural mismatch."

#### Slide 2: Problem Statement & Context (2 mins)
- Why does this technical decision matter to modern software engineering?
- Real-world metrics: Latency overhead, operational complexity, cloud bill cost.

#### Slide 3: Core Architecture & Invariants (3 mins)
- High-level block diagram showing data flow and network boundaries.
- Key protocols and synchronization mechanisms.
- **Speaker Note:** "Walk through a single read request from the client to the database storage engine."

#### Slide 4: Real-World Case Study / Benchmarks (2 mins)
- Comparative table: Monolith vs Microservices across Latency, Developer Velocity, and Maintenance.
- When NOT to use this pattern (edge cases).

#### Slide 5: Summary & Key Engineering Takeaway (1 min)
- The one sentence you want the audience to remember.

#### Slide 6: Anticipated Audience Q&A (1 min prep)
- **Likely Question 1:** "How do you handle distributed transaction rollbacks across services?"
- **Recommended Answer:** "Explain the Saga pattern with compensating transactions rather than 2-Phase Commit."`);
      setIsBuildingSlides(false);
      toast.success("Presentation outline generated!");
    }, 600);
  }

  return (
    <>
      <PageHeader
        eyebrow="Soft Skills & Professional Impact"
        title="Communication Academy"
        description="Daily technical writing drills, cold outreach email templates, seminar presentation builders, and essential engineering vocabulary."
      />

      <Tabs defaultValue="drills" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-9">
          <TabsTrigger value="drills" className="text-xs gap-1.5">
            <PenTool className="h-3.5 w-3.5" />
            Writing Drills
          </TabsTrigger>
          <TabsTrigger value="emails" className="text-xs gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="vocab" className="text-xs gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Daily 5 Vocab
          </TabsTrigger>
          <TabsTrigger value="presentation" className="text-xs gap-1.5">
            <Presentation className="h-3.5 w-3.5" />
            Presentation Builder
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Writing Drills */}
        <TabsContent value="drills" className="space-y-6">
          <Alert>
            <AlertTitle>Honest Rule-Based Feedback</AlertTitle>
            <AlertDescription className="text-xs">
              Checks evaluate length, sentence structure, filler words, and concrete technical
              examples.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <nav aria-label="Prompts" className="space-y-4">
              {categories.map((category) => (
                <div key={category}>
                  <p className="label-mono mb-2 text-xs font-semibold text-primary">{category}</p>
                  <ul className="space-y-1">
                    {prompts
                      .filter((p) => p.category === category)
                      .map((prompt) => (
                        <li key={prompt.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveId(prompt.id);
                              setText("");
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                              active?.id === prompt.id
                                ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                                : "text-muted-foreground hover:bg-sidebar-accent/60"
                            }`}
                          >
                            <span className="truncate flex-1">{prompt.title}</span>
                            {doneIds.has(prompt.id) ? (
                              <Badge variant="secondary" className="text-[10px] ml-1">
                                done
                              </Badge>
                            ) : null}
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </nav>

            {active ? (
              <section className="panel p-5 space-y-4 border-border">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <h2 className="text-base font-bold">{active.title}</h2>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {active.minutes} mins
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {active.min_words}+ words
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-foreground leading-relaxed">{active.prompt}</p>
                <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground border border-border">
                  <strong className="text-primary">Guidance: </strong>
                  {active.guidance}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="response" className="text-xs">
                    Your Draft Response
                  </Label>
                  <Textarea
                    id="response"
                    rows={8}
                    value={text}
                    placeholder="Write clearly as if sending this directly to your team lead or interviewer..."
                    onChange={(e) => setText(e.target.value)}
                    className="text-xs bg-background leading-relaxed"
                  />
                  <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                    <span>{wordCount(text)} words</span>
                    <Button size="sm" onClick={submit} disabled={saving} className="text-xs">
                      {saving ? "Evaluating…" : "Save & Check Drill"}
                    </Button>
                  </div>
                </div>

                <CheckList checks={checks} label="Live Clarity & Structure Check" />
              </section>
            ) : null}
          </div>
        </TabsContent>

        {/* Tab 2: Email Templates */}
        <TabsContent value="emails" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-12">
            <aside className="lg:col-span-4 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                Templates ({EMAIL_TEMPLATES.length})
              </span>
              {EMAIL_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                    selectedTemplate.id === tpl.id
                      ? "border-primary bg-primary/5 font-semibold text-foreground"
                      : "border-border hover:bg-muted/30 text-muted-foreground"
                  }`}
                >
                  {tpl.title}
                </button>
              ))}
            </aside>

            <main className="lg:col-span-8 panel p-5 border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-sm font-bold">{selectedTemplate.title}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    <strong>Subject:</strong> {selectedTemplate.subject}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs h-8"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Subject: ${selectedTemplate.subject}\n\n${selectedTemplate.body}`,
                    );
                    setCopiedEmail(true);
                    toast.success("Email template copied to clipboard!");
                    setTimeout(() => setCopiedEmail(false), 1500);
                  }}
                >
                  {copiedEmail ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedEmail ? "Copied" : "Copy Template"}
                </Button>
              </div>

              <pre className="p-4 rounded-lg bg-surface border border-border text-xs font-sans whitespace-pre-wrap leading-relaxed text-foreground/90">
                {selectedTemplate.body}
              </pre>
            </main>
          </div>
        </TabsContent>

        {/* Tab 3: Daily 5 Vocab */}
        <TabsContent value="vocab" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {DAILY_VOCABULARY.map((v, idx) => (
              <article key={idx} className="panel p-5 border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-base font-bold text-foreground">{v.word}</h3>
                    <span className="text-xs text-muted-foreground font-mono">{v.phonetic}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {v.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{v.definition}</p>
                <div className="p-2.5 rounded bg-muted/30 border border-border text-[11px] text-foreground">
                  <strong className="text-primary">In context: </strong>"{v.example}"
                </div>
              </article>
            ))}
          </div>
        </TabsContent>

        {/* Tab 4: Presentation Builder */}
        <TabsContent value="presentation" className="space-y-6">
          <section className="panel p-6 border-primary/20 bg-primary/5 space-y-4">
            <div className="flex items-center gap-2">
              <Presentation className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold">Seminar & Project Presentation Builder</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Generate an academic slide outline with speaker notes and anticipated examiner
              questions.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Seminar / Project Title</label>
                <Input
                  value={presentationTopic}
                  onChange={(e) => setPresentationTopic(e.target.value)}
                  className="h-9 text-xs bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Target Duration</label>
                <Input
                  value={presentationDuration}
                  onChange={(e) => setPresentationDuration(e.target.value)}
                  className="h-9 text-xs bg-background"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleBuildPresentation}
                disabled={isBuildingSlides}
                className="gap-2 text-xs font-semibold"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {isBuildingSlides ? "Building Structure…" : "Generate Presentation Deck"}
              </Button>
            </div>
          </section>

          {generatedSlides && (
            <div className="panel p-6 border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Presentation className="h-4 w-4" />
                  Generated Slide Deck & Speaker Notes
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedSlides);
                    toast.success("Slides copied!");
                  }}
                >
                  Copy All
                </Button>
              </div>
              <div className="prose prose-sm dark:prose-invert text-xs leading-relaxed whitespace-pre-line text-foreground">
                {generatedSlides}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
