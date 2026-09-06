import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Compass, Loader2, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { restartTour } from "@/components/guided-tour";
import { branchesQuery, profileQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile & privacy — EngineerOS" },
      {
        name: "description",
        content: "Control your student profile, learning goal and what other students can see.",
      },
      { property: "og:title", content: "Profile & privacy — EngineerOS" },
      { property: "og:description", content: "Privacy-conscious student profile controls." },
    ],
  }),
  component: ProfilePage,
});

const goals = [
  { value: "placement", label: "Placement / job" },
  { value: "core-skills", label: "Core engineering skills" },
  { value: "projects", label: "Building projects" },
  { value: "higher-studies", label: "Higher studies" },
];

function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile } = useQuery(profileQuery(user?.id));
  const { data: branches = [] } = useQuery(branchesQuery());
  const [form, setForm] = useState({
    full_name: "",
    branch_slug: "",
    academic_year: "1",
    career_goal: "placement",
    bio: "",
    visibility: "private",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      branch_slug: profile.branch_slug ?? "",
      academic_year: String(profile.academic_year ?? 1),
      career_goal: profile.career_goal ?? "placement",
      bio: profile.bio ?? "",
      visibility: profile.visibility ?? "private",
    });
  }, [profile]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name.trim() || null,
        branch_slug: form.branch_slug || null,
        academic_year: Number(form.academic_year),
        career_goal: form.career_goal,
        bio: form.bio.trim() || null,
        visibility: form.visibility as "private" | "public" | "students",
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    toast.success("Profile updated");
  }

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Profile & privacy"
        description="Your data drives your recommendations. You decide what anyone else can see."
      />

      <form onSubmit={save} className="grid max-w-3xl gap-6">
        <div className="panel space-y-5 p-6">
          <div className="grid gap-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(event) => setForm((f) => ({ ...f, full_name: event.target.value }))}
              autoComplete="name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email ?? ""} disabled readOnly />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="branch">Branch</Label>
              <Select
                value={form.branch_slug}
                onValueChange={(value) => setForm((f) => ({ ...f, branch_slug: value }))}
              >
                <SelectTrigger id="branch">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.slug} value={branch.slug}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="year">Academic year</Label>
              <Select
                value={form.academic_year}
                onValueChange={(value) => setForm((f) => ({ ...f, academic_year: value }))}
              >
                <SelectTrigger id="year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["1", "2", "3", "4"].map((year) => (
                    <SelectItem key={year} value={year}>
                      Year {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="goal">Primary goal</Label>
            <Select
              value={form.career_goal}
              onValueChange={(value) => setForm((f) => ({ ...f, career_goal: value }))}
            >
              <SelectTrigger id="goal">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {goals.map((goal) => (
                  <SelectItem key={goal.value} value={goal.value}>
                    {goal.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bio">Short bio</Label>
            <Textarea
              id="bio"
              value={form.bio}
              rows={3}
              maxLength={280}
              onChange={(event) => setForm((f) => ({ ...f, bio: event.target.value }))}
              placeholder="What are you building or aiming for?"
            />
          </div>
        </div>

        <div className="panel space-y-4 p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            <h2 className="text-base font-semibold">Privacy</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Profiles are private by default. Community features are not built yet — this setting
            takes effect the moment they ship, and nothing is shared before then.
          </p>
          <div className="grid gap-2 sm:max-w-xs">
            <Label htmlFor="visibility">Profile visibility</Label>
            <Select
              value={form.visibility}
              onValueChange={(value) => setForm((f) => ({ ...f, visibility: value }))}
            >
              <SelectTrigger id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private — only me</SelectItem>
                <SelectItem value="students">Students — signed-in students</SelectItem>
                <SelectItem value="public">Public — anyone with the link</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="panel space-y-4 p-6">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary" aria-hidden="true" />
            <h2 className="text-base font-semibold">Guided tour</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Replay the five-step walkthrough of the dashboard, learning, building and get-hired
            tools. The page reloads and the tour opens again.
          </p>
          <Button type="button" variant="outline" onClick={() => restartTour()}>
            Replay tour
          </Button>
        </div>

        <div>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Save changes
          </Button>
        </div>
      </form>
    </>
  );
}
