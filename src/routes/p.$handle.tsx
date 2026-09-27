import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShieldCheck, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-provider";
import { publicPortfolioQuery } from "@/lib/queries";
import { loadProofArtifacts, type ProofArtifact } from "@/lib/proof-wall";

export const Route = createFileRoute("/p/$handle")({
  ssr: false,
  head: ({ params }) => ({
    meta: [
      { title: `${params.handle} — engineering portfolio · EngineerOS` },
      {
        name: "description",
        content: `Public engineering portfolio shared from EngineerOS by ${params.handle}.`,
      },
      { property: "og:title", content: `${params.handle} — engineering portfolio` },
      {
        property: "og:description",
        content: "Projects, stack and links shared publicly from EngineerOS.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PublicPortfolioPage,
});

function PublicPortfolioPage() {
  const { handle } = Route.useParams();
  const { data, isLoading } = useQuery(publicPortfolioQuery(handle));

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Loading portfolio" />
      </div>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-bold">Portfolio not available</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          There is no public portfolio at /p/{handle}. It may not exist, or its owner has kept it
          private.
        </p>
      </main>
    );
  }

  const { portfolio, projects } = data;
  const links = [
    { label: "GitHub", url: portfolio.github_url },
    { label: "LinkedIn", url: portfolio.linkedin_url },
    { label: "Website", url: portfolio.website_url },
  ].filter((link) => link.url);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <span className="font-display text-sm font-bold tracking-tight">EngineerOS</span>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        <p className="label-mono text-primary">Public portfolio</p>
        <h1 className="mt-2 text-3xl font-bold">{portfolio.display_name}</h1>
        <p className="mt-2 text-base text-muted-foreground">{portfolio.headline}</p>

        {links.length ? (
          <ul className="mt-4 flex flex-wrap gap-4">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  className="text-sm text-primary underline"
                  href={link.url!}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}

        {portfolio.bio ? (
          <section className="mt-10" aria-labelledby="about">
            <h2 id="about" className="label-mono mb-2 text-muted-foreground">
              About
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed">{portfolio.bio}</p>
          </section>
        ) : null}

        {(portfolio.skills ?? []).length ? (
          <section className="mt-10" aria-labelledby="skills">
            <h2 id="skills" className="label-mono mb-2 text-muted-foreground">
              Skills
            </h2>
            <ul className="flex flex-wrap gap-2">
              {portfolio.skills.map((skill) => (
                <li key={skill}>
                  <Badge variant="secondary" className="label-mono">
                    {skill}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-10" aria-labelledby="projects">
          <h2 id="projects" className="label-mono mb-3 text-muted-foreground">
            Projects
          </h2>
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects published yet.</p>
          ) : (
            <ul className="space-y-4">
              {projects.map((project) => (
                <li key={project.id} className="panel p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold">{project.title}</h3>
                    <Badge variant="outline" className="label-mono">
                      {project.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{project.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(project.tech_stack ?? []).map((tech) => (
                      <Badge key={tech} variant="secondary" className="label-mono">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4">
                    {project.repo_url ? (
                      <a
                        className="text-sm text-primary underline"
                        href={project.repo_url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                      >
                        Repository
                      </a>
                    ) : null}
                    {project.live_url ? (
                      <a
                        className="text-sm text-primary underline"
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                      >
                        Live
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-10" aria-labelledby="proof-wall">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <h2 id="proof-wall" className="label-mono text-muted-foreground">
              Verified Proof-of-Work Stream (Anti-Resume)
            </h2>
          </div>
          <div className="space-y-3">
            {loadProofArtifacts()
              .slice(0, 4)
              .map((artifact) => (
                <div
                  key={artifact.id}
                  className="panel p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-emerald-500/20 bg-emerald-500/5"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {artifact.title}
                      </span>
                      <Badge variant="outline" className="font-mono text-[9px] uppercase">
                        {artifact.type.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{artifact.summary}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-3 w-3" /> VERIFIED
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(artifact.shaReceipt);
                        toast.success("Receipt SHA copied");
                      }}
                      className="font-mono text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/40 hover:text-foreground"
                    >
                      {artifact.shaReceipt}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>

        <p className="mt-12 text-xs text-muted-foreground">
          Proof receipts are cryptographically linked to executed test-cases and sandbox terminal
          logs on EngineerOS.
        </p>
      </main>
    </div>
  );
}
