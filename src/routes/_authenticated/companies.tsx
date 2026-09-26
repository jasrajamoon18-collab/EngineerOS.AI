import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Code2,
  FileText,
  FolderGit2,
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
import { COMPANY_PROFILES, type CompanyProfile } from "@/lib/companies-data";

export const Route = createFileRoute("/_authenticated/companies")({
  head: () => ({
    meta: [
      { title: "Company Prep Hub — EngineerOS" },
      {
        name: "description",
        content:
          "Targeted hiring rounds, frequent coding problems, resume keywords, and project ideas for Google, Microsoft, Amazon, NVIDIA, and TCS.",
      },
      { property: "og:title", content: "Company Prep Hub — EngineerOS" },
      {
        property: "og:description",
        content: "Company-specific interview patterns and technical hiring roadmaps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CompaniesPage,
});

function CompaniesPage() {
  const [selectedCompanySlug, setSelectedCompanySlug] = useState<string>("google");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", "Tier-1 Product", "Core Engineering", "IT Services"];

  const filteredCompanies = COMPANY_PROFILES.filter((c) => {
    const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.coreTopics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const activeCompany: CompanyProfile =
    COMPANY_PROFILES.find((c) => c.slug === selectedCompanySlug) ||
    filteredCompanies[0] ||
    COMPANY_PROFILES[0];

  return (
    <>
      <PageHeader
        eyebrow="Targeted Placement & Recruitment Hub"
        title="Company Preparation Playbook"
        description="Interview round blueprints, frequently asked coding questions, recruiter keywords, and capstone project patterns for top engineering employers."
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between mb-6">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className="text-xs h-8"
            >
              {cat === "all" ? "All Companies" : cat}
            </Button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company or topics (e.g. Graphs)…"
            className="pl-8 h-8 text-xs bg-background"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Company Cards List */}
        <aside className="lg:col-span-4 space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
            Companies ({filteredCompanies.length})
          </span>
          {filteredCompanies.map((c) => {
            const active = c.id === activeCompany.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCompanySlug(c.slug)}
                className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                  active
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-border/80 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center font-bold text-xs font-mono text-primary border border-border">
                      {c.logoInitial}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{c.name}</h3>
                      <span className="text-[10px] text-muted-foreground">{c.category}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px]">
                    {c.tierBadge}
                  </Badge>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Right Column: Detailed Playbook */}
        <main className="lg:col-span-8 space-y-6">
          <div className="panel p-6 border-border space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                  {activeCompany.logoInitial}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{activeCompany.name}</h2>
                    <Badge variant="secondary" className="text-[10px]">
                      {activeCompany.tierBadge}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{activeCompany.category}</span>
                </div>
              </div>
            </div>

            {/* Overview & Hiring Criteria */}
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {activeCompany.overview}
              </p>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs space-y-1">
                <span className="font-semibold text-primary flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Primary Hiring Bar:
                </span>
                <p className="text-foreground leading-relaxed text-[11px]">
                  {activeCompany.hiringCriteria}
                </p>
              </div>
            </div>

            {/* Tabs for Rounds, Questions, Resume Keywords, Projects */}
            <Tabs defaultValue="rounds">
              <TabsList className="grid w-full grid-cols-4 h-9">
                <TabsTrigger value="rounds" className="text-xs">
                  Hiring Rounds ({activeCompany.rounds.length})
                </TabsTrigger>
                <TabsTrigger value="questions" className="text-xs">
                  Frequent Coding
                </TabsTrigger>
                <TabsTrigger value="keywords" className="text-xs">
                  Resume Keywords
                </TabsTrigger>
                <TabsTrigger value="projects" className="text-xs">
                  Ideal Projects
                </TabsTrigger>
              </TabsList>

              {/* Rounds Flow */}
              <TabsContent value="rounds" className="mt-5 space-y-4">
                {activeCompany.rounds.map((round, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-4 rounded-lg border border-border bg-card/40 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-foreground">{round.title}</h4>
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Clock className="h-3 w-3" />
                        {round.duration}
                      </Badge>
                    </div>
                    <p className="text-xs text-foreground/90 font-medium">{round.focus}</p>
                    <div className="rounded bg-muted/40 p-2.5 text-[11px] text-muted-foreground border border-border/60">
                      <strong className="text-primary font-medium">EngineerOS Pro-Tip: </strong>
                      {round.tips}
                    </div>
                  </div>
                ))}
              </TabsContent>

              {/* Questions */}
              <TabsContent value="questions" className="mt-5 space-y-3">
                <div className="p-4 rounded-lg border border-border bg-card/40 space-y-3">
                  <span className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                    <Code2 className="h-4 w-4" />
                    Top Core Algorithms & Structures Tested
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCompany.coreTopics.map((t, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs font-mono">
                        {t}
                      </Badge>
                    ))}
                  </div>

                  <h5 className="text-xs font-semibold text-foreground pt-3 border-t border-border">
                    Frequently Repeated Interview Questions:
                  </h5>
                  <ul className="space-y-2 text-xs">
                    {activeCompany.frequentQuestions.map((q, qIdx) => (
                      <li
                        key={qIdx}
                        className="flex items-start gap-2 p-2.5 rounded bg-muted/20 border border-border/50 text-foreground"
                      >
                        <span className="text-primary font-mono font-bold text-xs">
                          {qIdx + 1}.
                        </span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              {/* Keywords */}
              <TabsContent value="keywords" className="mt-5 space-y-3">
                <div className="p-4 rounded-lg border border-border bg-card/40 space-y-3">
                  <span className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                    <FileText className="h-4 w-4" />
                    Recruiter ATS Screening Keywords
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Incorporate these specific technologies and architectural terms into your resume
                    experience bullets and GitHub project summaries:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {activeCompany.resumeKeywords.map((kw, kwIdx) => (
                      <Badge
                        key={kwIdx}
                        variant="outline"
                        className="text-xs px-2.5 py-1 font-mono"
                      >
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Projects */}
              <TabsContent value="projects" className="mt-5 space-y-3">
                <div className="p-4 rounded-lg border border-border bg-card/40 space-y-3">
                  <span className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                    <FolderGit2 className="h-4 w-4" />
                    Target Portfolio Projects
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Candidates who showcase these projects stand out during the technical loop
                    interviews:
                  </p>
                  <ul className="space-y-2.5">
                    {activeCompany.suggestedProjects.map((p, pIdx) => (
                      <li
                        key={pIdx}
                        className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs text-foreground font-medium flex items-center gap-2"
                      >
                        <Lightbulb className="h-4 w-4 text-primary shrink-0" />
                        <span>{p}</span>
                      </li>
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
