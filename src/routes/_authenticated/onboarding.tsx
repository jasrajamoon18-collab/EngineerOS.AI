import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { branchesQuery, profileQuery } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your student profile — EngineerOS" },
      {
        name: "description",
        content: "Tell EngineerOS your branch, year and goal so your daily mission fits you.",
      },
      { property: "og:title", content: "Set up your student profile — EngineerOS" },
      {
        property: "og:description",
        content: "A short setup that personalises your learning plan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

const goals = [
  { value: "placement", label: "Campus placement", hint: "Get interview-ready this year." },
  { value: "core-skills", label: "Strong fundamentals", hint: "Depth over shortcuts." },
  { value: "projects", label: "Build real projects", hint: "A portfolio that proves skill." },
  { value: "higher-studies", label: "Higher studies", hint: "Research and graduate programs." },
];

const years = [1, 2, 3, 4];

function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: branches = [] } = useQuery(branchesQuery());
  const { data: profile } = useQuery(profileQuery(user?.id));

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? "",
    branch_slug: profile?.branch_slug ?? "",
    academic_year: profile?.academic_year ?? 1,
    college: profile?.college ?? "",
    career_goal: profile?.career_goal ?? "",
    visibility: profile?.visibility ?? "private",
    show_progress: profile?.show_progress ?? false,
  });

  const totalSteps = 4;
  const canAdvance =
    (step === 0 && form.full_name.trim().length > 1) ||
    (step === 1 && form.branch_slug !== "") ||
    (step === 2 && form.career_goal !== "") ||
    step === 3;

  async function finish() {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name.trim(),
        branch_slug: form.branch_slug,
        academic_year: form.academic_year,
        college: form.college.trim() || null,
        career_goal: form.career_goal,
        visibility: form.visibility as "private" | "students" | "public",
        show_progress: form.show_progress,
        onboarding_completed: true,
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    toast.success("Your system is configured.");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="grid-field absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="panel relative w-full max-w-xl p-6 sm:p-8">
        <p className="label-mono text-primary">
          Setup · step {step + 1} of {totalSteps}
        </p>
        <Progress value={((step + 1) / totalSteps) * 100} className="mt-3 h-1.5" />

        {step === 0 && (
          <div className="mt-8 space-y-4">
            <h1 className="text-2xl font-bold">Let's calibrate your system</h1>
            <p className="text-sm text-muted-foreground">
              EngineerOS personalises everything around who you are. Start with the basics.
            </p>
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={form.full_name}
                onChange={(event) => setForm({ ...form, full_name: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college">College (optional)</Label>
              <Input
                id="college"
                value={form.college}
                onChange={(event) => setForm({ ...form, college: event.target.value })}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="mt-8 space-y-4">
            <h1 className="text-2xl font-bold">Which branch are you in?</h1>
            <p className="text-sm text-muted-foreground">
              Your branch shapes recommendations. You can change it later.
            </p>
            <div
              className="grid gap-2 sm:grid-cols-2"
              role="radiogroup"
              aria-label="Engineering branch"
            >
              {branches.map((branch) => (
                <button
                  key={branch.slug}
                  type="button"
                  role="radio"
                  aria-checked={form.branch_slug === branch.slug}
                  onClick={() => setForm({ ...form, branch_slug: branch.slug })}
                  className={cn(
                    "rounded-lg border p-3 text-left text-sm transition-colors",
                    form.branch_slug === branch.slug
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-surface",
                  )}
                >
                  <span className="font-medium">{branch.name}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {branch.description}
                  </span>
                </button>
              ))}
            </div>
            <div className="space-y-2 pt-2">
              <Label>Academic year</Label>
              <div className="flex gap-2">
                {years.map((year) => (
                  <Button
                    key={year}
                    type="button"
                    variant={form.academic_year === year ? "default" : "outline"}
                    size="sm"
                    onClick={() => setForm({ ...form, academic_year: year })}
                  >
                    Year {year}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-8 space-y-4">
            <h1 className="text-2xl font-bold">What are you optimising for?</h1>
            <p className="text-sm text-muted-foreground">
              Your goal drives Today's Mission and the Next Best Action.
            </p>
            <div className="grid gap-2" role="radiogroup" aria-label="Primary goal">
              {goals.map((goal) => (
                <button
                  key={goal.value}
                  type="button"
                  role="radio"
                  aria-checked={form.career_goal === goal.value}
                  onClick={() => setForm({ ...form, career_goal: goal.value })}
                  className={cn(
                    "rounded-lg border p-3 text-left text-sm transition-colors",
                    form.career_goal === goal.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-surface",
                  )}
                >
                  <span className="font-medium">{goal.label}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{goal.hint}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-8 space-y-5">
            <h1 className="text-2xl font-bold">Privacy, your call</h1>
            <p className="text-sm text-muted-foreground">
              Your profile is private by default. Nothing is shared until you say so.
            </p>
            <div className="space-y-3">
              {(
                [
                  ["private", "Private", "Only you can see your profile."],
                  ["students", "Signed-in students", "Other EngineerOS students can view it."],
                  ["public", "Public profile", "Visible to any signed-in visitor."],
                ] as const
              ).map(([value, label, hint]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={form.visibility === value}
                  onClick={() => setForm({ ...form, visibility: value })}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left text-sm transition-colors",
                    form.visibility === value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-surface",
                  )}
                >
                  <span className="font-medium">{label}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label htmlFor="show-progress">Show my progress on my profile</Label>
                <p className="text-xs text-muted-foreground">XP, streak and completed lessons.</p>
              </div>
              <Switch
                id="show-progress"
                checked={form.show_progress}
                onCheckedChange={(checked) => setForm({ ...form, show_progress: checked })}
              />
            </div>
            <Textarea className="hidden" readOnly value="" aria-hidden="true" />
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            disabled={step === 0 || busy}
          >
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back
          </Button>
          {step < totalSteps - 1 ? (
            <Button onClick={() => setStep((value) => value + 1)} disabled={!canAdvance}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button onClick={finish} disabled={busy}>
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              Enter EngineerOS
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
