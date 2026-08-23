import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { profileQuery, roadmapsQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/roadmaps")({
  head: () => ({
    meta: [
      { title: "Roadmaps — EngineerOS" },
      {
        name: "description",
        content: "Branch-aware engineering roadmaps that sequence what to learn and when.",
      },
      { property: "og:title", content: "Roadmaps — EngineerOS" },
      { property: "og:description", content: "Ordered learning paths per branch and goal." },
    ],
  }),
  component: RoadmapsPage,
});

function RoadmapsPage() {
  const { user } = useAuth();
  const { data } = useQuery(roadmapsQuery());
  const { data: profile } = useQuery(profileQuery(user?.id));
  const roadmaps = data?.roadmaps ?? [];
  const steps = data?.steps ?? [];

  const sorted = [...roadmaps].sort((a, b) => {
    const score = (slug: string | null) => (slug && slug === profile?.branch_slug ? -1 : 0);
    return score(a.branch_slug) - score(b.branch_slug) || a.order_index - b.order_index;
  });

  return (
    <>
      <PageHeader
        eyebrow="Direction"
        title="Roadmaps"
        description="Sequenced paths so you never have to guess the order. Roadmaps matching your branch appear first."
      />
      <div className="space-y-6">
        {sorted.map((roadmap) => (
          <section key={roadmap.id} className="panel p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">{roadmap.title}</h2>
              {roadmap.branch_slug ? (
                <Badge
                  variant={roadmap.branch_slug === profile?.branch_slug ? "default" : "outline"}
                  className="label-mono uppercase"
                >
                  {roadmap.branch_slug}
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{roadmap.description}</p>
            <ol className="mt-5 space-y-3">
              {steps
                .filter((step) => step.roadmap_id === roadmap.id)
                .map((step, index) => (
                  <li key={step.id} className="flex gap-4">
                    <span className="label-mono mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/40 text-primary">
                      {index + 1}
                    </span>
                    <div className="flex-1 border-b border-border pb-3">
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
                      {step.course_slug ? (
                        <Link
                          to="/learn/$courseSlug"
                          params={{ courseSlug: step.course_slug }}
                          className="label-mono mt-2 inline-block text-primary hover:underline"
                        >
                          Open course →
                        </Link>
                      ) : null}
                    </div>
                  </li>
                ))}
            </ol>
          </section>
        ))}
        {sorted.length === 0 ? (
          <p className="panel p-8 text-center text-sm text-muted-foreground">
            No roadmaps published yet.
          </p>
        ) : null}
      </div>
    </>
  );
}
