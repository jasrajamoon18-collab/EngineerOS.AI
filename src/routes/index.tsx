import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  CalendarCheck,
  Compass,
  GraduationCap,
  ListTree,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EngineerOS — Learn. Build. Practice. Grow. Get Hired." },
      {
        name: "description",
        content:
          "An operating system for engineering students: guided courses, a Programming and Linux academy, DSA practice, daily missions and an AI mentor that always tells you what to do next.",
      },
      { property: "og:title", content: "EngineerOS — Learn. Build. Practice. Grow. Get Hired." },
      {
        property: "og:description",
        content:
          "Guided learning, daily missions, DSA practice and an AI mentor for engineering students.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Landing,
});

const pillars = [
  {
    icon: GraduationCap,
    title: "Structured learning",
    body: "Courses broken into modules and lessons with real progress tracking, not a video dump.",
  },
  {
    icon: Brain,
    title: "Programming Academy",
    body: "C, Python and Java tracks that build fundamentals you can actually defend in an interview.",
  },
  {
    icon: Terminal,
    title: "Linux Academy",
    body: "The terminal, the filesystem, permissions and scripting — the environment engineering runs on.",
  },
  {
    icon: ListTree,
    title: "DSA practice",
    body: "A curated problem set organised by pattern, with your own status and notes per problem.",
  },
  {
    icon: CalendarCheck,
    title: "Daily missions",
    body: "A small, finishable set of tasks each day. Streaks and XP that reward consistency.",
  },
  {
    icon: Compass,
    title: "AI Mentor",
    body: "Ask what to learn next and get an answer grounded in your branch, year and actual progress.",
  },
];

function Landing() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Terminal className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">EngineerOS</span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {loading ? null : user ? (
              <Button asChild size="sm">
                <Link to="/dashboard">Open dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/auth" search={{ mode: "signup" }}>
                    Create account
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border">
        <div className="grid-field absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <Badge variant="outline" className="label-mono mb-6 border-primary/40 text-primary">
            Phase 1 · Core learning system
          </Badge>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
            An operating system for engineering students.
          </h1>
          <p className="label-mono mt-5 text-primary">
            Learn. Build. Practice. Grow. Get&nbsp;Hired.
          </p>
          <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Most students don't lack effort — they lack a system. EngineerOS gives you one screen
            that always knows your branch, your progress and the single next thing worth doing.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/auth" search={{ mode: "signup" }}>
                Start your onboarding
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">I already have an account</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold sm:text-3xl">What's live right now</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Phase 1 is a working system, not a mockup. Everything below stores real progress against
          your account.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="panel p-6">
              <pillar.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="mt-4 text-base font-semibold">{pillar.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface/60">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex items-start gap-4">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-semibold">What EngineerOS does not pretend to do</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  · No live job listings. Placement and job features are planned, not simulated.
                </li>
                <li>· No certificates issued. Progress is yours to point at, not a credential.</li>
                <li>
                  · No in-browser code execution yet. Practice happens in your own environment.
                </li>
                <li>
                  · The AI Mentor is a guidance assistant. It can be wrong; verify before you act.
                </li>
                <li>· Your profile is private by default. You choose what other students see.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>EngineerOS · Built for engineering students.</span>
          <span className="label-mono">Phase 1 · Core learning system</span>
        </div>
      </footer>
    </div>
  );
}
