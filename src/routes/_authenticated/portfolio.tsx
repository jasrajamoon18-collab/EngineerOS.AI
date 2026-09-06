import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { portfolioQuery, userProjectsQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio Builder — EngineerOS" },
      {
        name: "description",
        content:
          "Build a shareable engineering portfolio page from your real projects, with a private-by-default public opt-in.",
      },
      { property: "og:title", content: "Portfolio Builder — EngineerOS" },
      { property: "og:description", content: "Private by default, public only when you say so." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: portfolio } = useQuery(portfolioQuery(user?.id));
  const { data: mine } = useQuery(userProjectsQuery(user?.id));
  const projects = mine?.projects ?? [];
  const shown = projects.filter((p) => p.show_in_portfolio);

  const [form, setForm] = useState({
    handle: "",
    display_name: "",
    headline: "",
    bio: "",
    github_url: "",
    linkedin_url: "",
    website_url: "",
    skills: "",
    is_public: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!portfolio) return;
    setForm({
      handle: portfolio.handle,
      display_name: portfolio.display_name,
      headline: portfolio.headline,
      bio: portfolio.bio,
      github_url: portfolio.github_url ?? "",
      linkedin_url: portfolio.linkedin_url ?? "",
      website_url: portfolio.website_url ?? "",
      skills: (portfolio.skills ?? []).join(", "),
      is_public: portfolio.is_public,
    });
  }, [portfolio]);

  const handleValid = /^[a-z0-9-]{3,32}$/.test(form.handle.trim());

  async function save() {
    if (!user) return;
    if (!handleValid) {
      toast.error("Handle must be 3-32 characters: lowercase letters, numbers or hyphens.");
      return;
    }
    if (!form.display_name.trim() || !form.headline.trim()) {
      toast.error("Display name and headline are required.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("portfolio_profiles").upsert(
      {
        user_id: user.id,
        handle: form.handle.trim(),
        display_name: form.display_name.trim(),
        headline: form.headline.trim(),
        bio: form.bio.trim(),
        github_url: form.github_url.trim() || null,
        linkedin_url: form.linkedin_url.trim() || null,
        website_url: form.website_url.trim() || null,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        is_public: form.is_public,
      },
      { onConflict: "user_id" },
    );
    setSaving(false);
    if (error) {
      toast.error(
        error.message.includes("duplicate") ? "That handle is already taken." : error.message,
      );
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["portfolio", user.id] });
    toast.success("Portfolio saved.");
  }

  return (
    <>
      <PageHeader
        eyebrow="Grow"
        title="Portfolio Builder"
        description="One shareable page built from projects you actually registered in the Project Lab."
      />

      <Alert className="mb-8">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        <AlertTitle>Private until you opt in</AlertTitle>
        <AlertDescription>
          Your portfolio is only readable by you until you switch it public. When public, visitors
          see exactly what is below — the projects you ticked "show on portfolio", nothing from your
          account, email or private notes.
        </AlertDescription>
      </Alert>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="panel space-y-4 p-4" aria-labelledby="portfolio-form">
          <h2 id="portfolio-form" className="text-sm font-semibold">
            Page details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="handle">Public handle</Label>
              <Input
                id="handle"
                value={form.handle}
                aria-invalid={form.handle.length > 0 && !handleValid}
                onChange={(e) =>
                  setForm((f) => ({ ...f, handle: e.target.value.toLowerCase().trim() }))
                }
                placeholder="meharaj-j"
              />
              <p className="text-xs text-muted-foreground">
                Your page will live at /p/{form.handle || "your-handle"}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_name">Display name</Label>
              <Input
                id="display_name"
                value={form.display_name}
                onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                value={form.headline}
                onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
                placeholder="Final-year CSE student · backend and data"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bio">About</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Two or three honest sentences about what you build and what you want next."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                id="github_url"
                value={form.github_url}
                onChange={(e) => setForm((f) => ({ ...f, github_url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                value={form.linkedin_url}
                onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                value={form.website_url}
                onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma separated)</Label>
              <Input
                id="skills"
                value={form.skills}
                onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label htmlFor="is_public" className="text-sm">
                Make my portfolio public
              </Label>
              <p className="text-xs text-muted-foreground">
                Anyone with the link can view it. Turn off any time.
              </p>
            </div>
            <Switch
              id="is_public"
              checked={form.is_public}
              onCheckedChange={(checked) => setForm((f) => ({ ...f, is_public: checked }))}
            />
          </div>

          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save portfolio"}
          </Button>
        </section>

        <aside className="space-y-4" aria-label="Portfolio preview">
          <div className="panel p-4">
            <p className="label-mono text-muted-foreground">Share link</p>
            {portfolio?.handle ? (
              <div className="mt-2 space-y-2">
                <Link
                  to="/p/$handle"
                  params={{ handle: portfolio.handle }}
                  className="inline-flex items-center gap-2 text-sm text-primary underline"
                >
                  /p/{portfolio.handle}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <p className="text-xs text-muted-foreground">
                  {portfolio.is_public
                    ? "Live — visible to anyone with the link."
                    : "Private — only you can open it right now."}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Save the page once to reserve your handle.
              </p>
            )}
          </div>

          <div className="panel p-4">
            <p className="label-mono text-muted-foreground">Projects on this page</p>
            {shown.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                None yet. In Project Lab, tick "Show on my public portfolio page" for the builds you
                want to feature.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {shown.map((project) => (
                  <li key={project.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">{project.title}</span>
                    <Badge variant="secondary" className="label-mono">
                      {project.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
