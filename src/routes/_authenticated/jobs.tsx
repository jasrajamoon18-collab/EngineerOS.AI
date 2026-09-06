import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { jobApplicationsQuery } from "@/lib/queries";
import type { JobApplication } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/jobs")({
  head: () => ({
    meta: [
      { title: "Application Tracker — EngineerOS" },
      {
        name: "description",
        content:
          "Track every internship and job application you send: stage, deadline, source and notes, all owned by you.",
      },
      { property: "og:title", content: "Application Tracker — EngineerOS" },
      {
        property: "og:description",
        content: "A private pipeline for the roles you apply to.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JobsPage,
});

const STATUSES = [
  "saved",
  "applied",
  "assessment",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;

type Status = (typeof STATUSES)[number];

const emptyForm = {
  company: "",
  role_title: "",
  job_url: "",
  source: "",
  status: "saved" as Status,
  applied_on: "",
  deadline: "",
  notes: "",
};

function JobsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: applications = [] } = useQuery(jobApplicationsQuery(user?.id));
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["job-applications", user?.id] });
  }

  async function addApplication(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !form.company.trim() || !form.role_title.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("job_applications").insert({
      user_id: user.id,
      company: form.company.trim(),
      role_title: form.role_title.trim(),
      job_url: form.job_url.trim() || null,
      source: form.source.trim() || null,
      status: form.status,
      applied_on: form.applied_on || null,
      deadline: form.deadline || null,
      notes: form.notes.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setForm(emptyForm);
    toast.success("Application saved");
    await refresh();
  }

  async function updateStatus(application: JobApplication, status: Status) {
    const { error } = await supabase
      .from("job_applications")
      .update({ status })
      .eq("id", application.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refresh();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("job_applications").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refresh();
  }

  const counts = STATUSES.map((status) => ({
    status,
    count: applications.filter((a) => a.status === status).length,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Placement"
        title="Application Tracker"
        description="Every role you apply to, in one private pipeline. You enter the data; nothing is scraped or imported."
      />

      <Alert className="mb-8">
        <AlertTitle>No job boards are connected</AlertTitle>
        <AlertDescription>
          EngineerOS does not fetch live vacancies or company data. This tracker records what you
          apply to yourself, so deadlines and follow-ups do not get lost.
        </AlertDescription>
      </Alert>

      <div className="mb-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {counts.map((item) => (
          <div key={item.status} className="panel p-3">
            <p className="label-mono text-muted-foreground">{item.status}</p>
            <p className="mt-1 text-xl font-semibold">{item.count}</p>
          </div>
        ))}
      </div>

      <section className="panel mb-10 p-5" aria-labelledby="add-application">
        <h2 id="add-application" className="text-sm font-semibold">
          Log an application
        </h2>
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={addApplication}>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              required
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role title</Label>
            <Input
              id="role"
              required
              value={form.role_title}
              onChange={(e) => setForm({ ...form, role_title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">Job link (optional)</Label>
            <Input
              id="url"
              type="url"
              value={form.job_url}
              onChange={(e) => setForm({ ...form, job_url: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">Source (optional)</Label>
            <Input
              id="source"
              placeholder="Campus drive, referral, careers page…"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Stage</Label>
            <Select
              value={form.status}
              onValueChange={(value) => setForm({ ...form, status: value as Status })}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="applied">Applied on</Label>
              <Input
                id="applied"
                type="date"
                value={form.applied_on}
                onChange={(e) => setForm({ ...form, applied_on: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Contact person, prep needed, interview format…"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save application"}
            </Button>
          </div>
        </form>
      </section>

      <section aria-labelledby="pipeline">
        <h2 id="pipeline" className="label-mono mb-3 text-primary">
          Your pipeline
        </h2>
        {applications.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing logged yet. Add the first role above — even one you have only saved.
          </p>
        ) : (
          <ul className="space-y-4">
            {applications.map((application) => (
              <li key={application.id} className="panel p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">
                      {application.role_title} · {application.company}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {application.source ? `via ${application.source}` : "source not recorded"}
                      {application.applied_on ? ` · applied ${application.applied_on}` : ""}
                      {application.deadline ? ` · deadline ${application.deadline}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={application.status}
                      onValueChange={(value) => updateStatus(application, value as Status)}
                    >
                      <SelectTrigger
                        className="w-[150px]"
                        aria-label={`Stage for ${application.role_title} at ${application.company}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete application for ${application.role_title}`}
                      onClick={() => remove(application.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {application.notes ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                    {application.notes}
                  </p>
                ) : null}
                {application.job_url ? (
                  <a
                    className="mt-3 inline-block text-xs text-primary underline"
                    href={application.job_url}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Open job posting
                  </a>
                ) : null}
                <div className="mt-3">
                  <Badge variant="outline" className="label-mono">
                    {application.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
