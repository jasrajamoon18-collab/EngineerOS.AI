import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Copy, Download, XCircle } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Json } from "@/integrations/supabase/types";
import { profileQuery, resumeAnalysesQuery, resumesQuery } from "@/lib/queries";
import {
  analyseResume,
  emptyResume,
  normaliseResume,
  renderResumeText,
  type ResumeAnalysisResult,
  type ResumeData,
} from "@/lib/resume";

export const Route = createFileRoute("/_authenticated/resume")({
  head: () => ({
    meta: [
      { title: "Resume Builder & Analyzer — EngineerOS" },
      {
        name: "description",
        content:
          "Write an ATS-friendly single-column resume and check it against transparent, rule-based structure and keyword checks.",
      },
      { property: "og:title", content: "Resume Builder & Analyzer — EngineerOS" },
      {
        property: "og:description",
        content: "Single-column resume writing plus explainable rule-based checks.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResumePage,
});

const listToText = (items: string[]) => items.join("\n");
const textToList = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

function ResumePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: resumes = [] } = useQuery(resumesQuery(user?.id));
  const { data: analyses = [] } = useQuery(resumeAnalysesQuery(user?.id));
  const { data: profile } = useQuery(profileQuery(user?.id));

  const [resumeId, setResumeId] = useState<string | null>(null);
  const [title, setTitle] = useState("My resume");
  const [data, setData] = useState<ResumeData>(emptyResume);
  const [saving, setSaving] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);

  useEffect(() => {
    if (resumeId || resumes.length === 0) return;
    const first = resumes[0];
    if (!first) return;
    setResumeId(first.id);
    setTitle(first.title);
    setData(normaliseResume(first.data));
  }, [resumes, resumeId]);

  useEffect(() => {
    if (resumeId || resumes.length || !profile) return;
    setData((prev) => (prev.fullName ? prev : { ...prev, fullName: profile.full_name ?? "" }));
  }, [profile, resumes.length, resumeId]);

  const plainText = useMemo(() => renderResumeText(data), [data]);
  const update = (patch: Partial<ResumeData>) => setData((prev) => ({ ...prev, ...patch }));

  async function saveResume() {
    if (!user) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      title: title.trim() || "My resume",
      data: data as unknown as Json,
    };
    const response = resumeId
      ? await supabase.from("resumes").update(payload).eq("id", resumeId).select("id").maybeSingle()
      : await supabase.from("resumes").insert(payload).select("id").maybeSingle();
    setSaving(false);
    if (response.error) {
      toast.error(response.error.message);
      return;
    }
    if (response.data?.id) setResumeId(response.data.id);
    await queryClient.invalidateQueries({ queryKey: ["resumes", user.id] });
    toast.success("Resume saved.");
  }

  function downloadText() {
    const blob = new Blob([plainText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${(data.fullName || "resume").replace(/\s+/g, "-").toLowerCase()}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function runAnalysis() {
    if (!user) return;
    if (!jobDescription.trim()) {
      toast.error("Paste the job description you want to be measured against.");
      return;
    }
    const analysis = analyseResume(data, jobDescription);
    setResult(analysis);
    const { error } = await supabase.from("resume_analyses").insert({
      user_id: user.id,
      resume_id: resumeId,
      job_title: jobTitle.trim() || "Untitled role",
      job_description: jobDescription.trim(),
      score: analysis.score,
      results: analysis as unknown as Json,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["resume-analyses", user.id] });
    toast.success("Analysis saved.");
  }

  return (
    <>
      <PageHeader
        eyebrow="Get hired"
        title="Resume Builder & Analyzer"
        description="Write once in a single-column, parser-friendly structure, then run explainable checks against a specific job description."
      />

      <Tabs defaultValue="builder">
        <TabsList>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="analyzer">ATS Analyzer</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="mt-6 space-y-6">
          <Alert>
            <AlertTitle>Plain text, on purpose</AlertTitle>
            <AlertDescription>
              Export is a single-column text file with no tables, columns, icons or images — the
              layout resume parsers read most reliably. Paste it into your preferred document tool
              for final formatting.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <section className="panel space-y-4 p-4" aria-labelledby="header-section">
                <h2 id="header-section" className="text-sm font-semibold">
                  Header
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="r-title">Resume name (internal)</Label>
                    <Input id="r-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="r-name">Full name</Label>
                    <Input
                      id="r-name"
                      value={data.fullName}
                      onChange={(e) => update({ fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="r-headline">Headline</Label>
                    <Input
                      id="r-headline"
                      value={data.headline}
                      onChange={(e) => update({ headline: e.target.value })}
                      placeholder="Backend engineer · Python, Postgres"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="r-email">Email</Label>
                    <Input
                      id="r-email"
                      type="email"
                      value={data.email}
                      onChange={(e) => update({ email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="r-phone">Phone</Label>
                    <Input
                      id="r-phone"
                      value={data.phone}
                      onChange={(e) => update({ phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="r-location">Location</Label>
                    <Input
                      id="r-location"
                      value={data.location}
                      onChange={(e) => update({ location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="r-links">Links (one per line)</Label>
                    <Textarea
                      id="r-links"
                      value={listToText(data.links)}
                      onChange={(e) => update({ links: textToList(e.target.value) })}
                    />
                  </div>
                </div>
              </section>

              <section className="panel space-y-4 p-4" aria-labelledby="content-section">
                <h2 id="content-section" className="text-sm font-semibold">
                  Content
                </h2>
                <div className="space-y-2">
                  <Label htmlFor="r-summary">Summary</Label>
                  <Textarea
                    id="r-summary"
                    value={data.summary}
                    onChange={(e) => update({ summary: e.target.value })}
                    placeholder="Two lines: what you build, and what you are looking for."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="r-skills">Skills (one per line)</Label>
                  <Textarea
                    id="r-skills"
                    value={listToText(data.skills)}
                    onChange={(e) => update({ skills: textToList(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="r-achievements">Achievements (one per line)</Label>
                  <Textarea
                    id="r-achievements"
                    value={listToText(data.achievements)}
                    onChange={(e) => update({ achievements: textToList(e.target.value) })}
                  />
                </div>
              </section>

              <RepeatableSection
                id="experience"
                title="Experience"
                addLabel="Add experience"
                items={data.experience}
                onAdd={() =>
                  update({
                    experience: [
                      ...data.experience,
                      { role: "", organisation: "", period: "", bullets: [] },
                    ],
                  })
                }
                onRemove={(index) =>
                  update({ experience: data.experience.filter((_, i) => i !== index) })
                }
                render={(item, index) => (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <FieldInput
                      label="Role"
                      value={item.role}
                      id={`exp-role-${index}`}
                      onChange={(value) =>
                        update({
                          experience: data.experience.map((e, i) =>
                            i === index ? { ...e, role: value } : e,
                          ),
                        })
                      }
                    />
                    <FieldInput
                      label="Organisation"
                      value={item.organisation}
                      id={`exp-org-${index}`}
                      onChange={(value) =>
                        update({
                          experience: data.experience.map((e, i) =>
                            i === index ? { ...e, organisation: value } : e,
                          ),
                        })
                      }
                    />
                    <FieldInput
                      label="Period"
                      value={item.period}
                      id={`exp-period-${index}`}
                      onChange={(value) =>
                        update({
                          experience: data.experience.map((e, i) =>
                            i === index ? { ...e, period: value } : e,
                          ),
                        })
                      }
                    />
                    <div className="space-y-2 sm:col-span-3">
                      <Label htmlFor={`exp-bullets-${index}`}>Bullets (one per line)</Label>
                      <Textarea
                        id={`exp-bullets-${index}`}
                        value={listToText(item.bullets)}
                        onChange={(e) =>
                          update({
                            experience: data.experience.map((entry, i) =>
                              i === index
                                ? { ...entry, bullets: textToList(e.target.value) }
                                : entry,
                            ),
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              />

              <RepeatableSection
                id="projects"
                title="Projects"
                addLabel="Add project"
                items={data.projects}
                onAdd={() =>
                  update({
                    projects: [...data.projects, { title: "", tech: "", link: "", bullets: [] }],
                  })
                }
                onRemove={(index) =>
                  update({ projects: data.projects.filter((_, i) => i !== index) })
                }
                render={(item, index) => (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <FieldInput
                      label="Title"
                      id={`prj-title-${index}`}
                      value={item.title}
                      onChange={(value) =>
                        update({
                          projects: data.projects.map((p, i) =>
                            i === index ? { ...p, title: value } : p,
                          ),
                        })
                      }
                    />
                    <FieldInput
                      label="Tech"
                      id={`prj-tech-${index}`}
                      value={item.tech}
                      onChange={(value) =>
                        update({
                          projects: data.projects.map((p, i) =>
                            i === index ? { ...p, tech: value } : p,
                          ),
                        })
                      }
                    />
                    <FieldInput
                      label="Link"
                      id={`prj-link-${index}`}
                      value={item.link}
                      onChange={(value) =>
                        update({
                          projects: data.projects.map((p, i) =>
                            i === index ? { ...p, link: value } : p,
                          ),
                        })
                      }
                    />
                    <div className="space-y-2 sm:col-span-3">
                      <Label htmlFor={`prj-bullets-${index}`}>Bullets (one per line)</Label>
                      <Textarea
                        id={`prj-bullets-${index}`}
                        value={listToText(item.bullets)}
                        onChange={(e) =>
                          update({
                            projects: data.projects.map((entry, i) =>
                              i === index
                                ? { ...entry, bullets: textToList(e.target.value) }
                                : entry,
                            ),
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              />

              <RepeatableSection
                id="education"
                title="Education"
                addLabel="Add education"
                items={data.education}
                onAdd={() =>
                  update({
                    education: [
                      ...data.education,
                      { qualification: "", institution: "", period: "", detail: "" },
                    ],
                  })
                }
                onRemove={(index) =>
                  update({ education: data.education.filter((_, i) => i !== index) })
                }
                render={(item, index) => (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FieldInput
                      label="Qualification"
                      id={`edu-q-${index}`}
                      value={item.qualification}
                      onChange={(value) =>
                        update({
                          education: data.education.map((e, i) =>
                            i === index ? { ...e, qualification: value } : e,
                          ),
                        })
                      }
                    />
                    <FieldInput
                      label="Institution"
                      id={`edu-i-${index}`}
                      value={item.institution}
                      onChange={(value) =>
                        update({
                          education: data.education.map((e, i) =>
                            i === index ? { ...e, institution: value } : e,
                          ),
                        })
                      }
                    />
                    <FieldInput
                      label="Period"
                      id={`edu-p-${index}`}
                      value={item.period}
                      onChange={(value) =>
                        update({
                          education: data.education.map((e, i) =>
                            i === index ? { ...e, period: value } : e,
                          ),
                        })
                      }
                    />
                    <FieldInput
                      label="Detail"
                      id={`edu-d-${index}`}
                      value={item.detail}
                      onChange={(value) =>
                        update({
                          education: data.education.map((e, i) =>
                            i === index ? { ...e, detail: value } : e,
                          ),
                        })
                      }
                    />
                  </div>
                )}
              />

              <div className="flex flex-wrap gap-2">
                <Button onClick={saveResume} disabled={saving}>
                  {saving ? "Saving…" : "Save resume"}
                </Button>
                <Button variant="outline" onClick={downloadText}>
                  <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                  Download .txt
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await navigator.clipboard.writeText(plainText);
                    toast.success("Resume text copied.");
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                  Copy text
                </Button>
              </div>
            </div>

            <aside aria-label="Resume preview" className="panel h-fit p-4 lg:sticky lg:top-20">
              <p className="label-mono text-muted-foreground">Parser-view preview</p>
              <pre className="mt-3 max-h-[70vh] overflow-auto whitespace-pre-wrap font-mono text-xs">
                {plainText || "Start filling the form to see your resume."}
              </pre>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="analyzer" className="mt-6 space-y-6">
          <Alert>
            <AlertTitle>These are our rules, not a real ATS</AlertTitle>
            <AlertDescription>
              EngineerOS is not connected to any applicant tracking system. Every check below is a
              deterministic rule in this app — structure, action verbs, quantification and keyword
              overlap with the description you paste. The score predicts nothing about a real hiring
              decision.
            </AlertDescription>
          </Alert>

          <section className="panel space-y-4 p-4" aria-labelledby="jd-section">
            <h2 id="jd-section" className="text-sm font-semibold">
              Target role
            </h2>
            <div className="space-y-2">
              <Label htmlFor="jd-title">Job title</Label>
              <Input
                id="jd-title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Graduate Backend Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jd-body">Job description</Label>
              <Textarea
                id="jd-body"
                className="min-h-40"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full posting here."
              />
            </div>
            <Button onClick={runAnalysis}>Run checks</Button>
          </section>

          {result ? (
            <section className="panel p-4" aria-labelledby="result-section">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="result-section" className="text-sm font-semibold">
                  Rule-based score
                </h2>
                <p className="text-2xl font-bold">{result.score}/100</p>
              </div>
              <Progress className="mt-3 h-1.5" value={result.score} />

              <ul className="mt-5 space-y-3">
                {result.checks.map((check) => (
                  <li key={check.id} className="flex gap-3">
                    {check.status === "pass" ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                    ) : check.status === "warn" ? (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {check.label}
                        <span className="sr-only"> — {check.status}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">{check.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {result.missingKeywords.length ? (
                <div className="mt-6">
                  <p className="label-mono text-muted-foreground">
                    Terms from the posting not found in your resume
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-1">
                    {result.missingKeywords.map((word) => (
                      <li key={word}>
                        <Badge variant="outline" className="label-mono">
                          {word}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Only add a term if it is genuinely true of your experience.
                  </p>
                </div>
              ) : null}
            </section>
          ) : null}

          {analyses.length ? (
            <section className="panel p-4" aria-labelledby="history">
              <h2 id="history" className="text-sm font-semibold">
                Previous checks
              </h2>
              <ul className="mt-3 space-y-2">
                {analyses.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate">{item.job_title}</span>
                    <Badge variant="secondary" className="label-mono">
                      {item.score}/100
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </TabsContent>
      </Tabs>
    </>
  );
}

function FieldInput({
  label,
  id,
  value,
  onChange,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function RepeatableSection<T>({
  id,
  title,
  addLabel,
  items,
  onAdd,
  onRemove,
  render,
}: {
  id: string;
  title: string;
  addLabel: string;
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  render: (item: T, index: number) => React.ReactNode;
}) {
  return (
    <section className="panel space-y-4 p-4" aria-labelledby={`${id}-heading`}>
      <div className="flex items-center justify-between">
        <h2 id={`${id}-heading`} className="text-sm font-semibold">
          {title}
        </h2>
        <Button size="sm" variant="outline" onClick={onAdd}>
          {addLabel}
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing added yet.</p>
      ) : null}
      {items.map((item, index) => (
        <div key={`${id}-${index}`} className="rounded-lg border border-border p-3">
          {render(item, index)}
          <Button
            size="sm"
            variant="ghost"
            className="mt-3"
            onClick={() => onRemove(index)}
            aria-label={`Remove ${title} entry ${index + 1}`}
          >
            Remove
          </Button>
        </div>
      ))}
    </section>
  );
}
