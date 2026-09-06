import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Brain } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { CourseGrid } from "@/components/course-grid";
import { useAuth } from "@/hooks/useAuth";
import { coursesQuery, lessonProgressQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/programming")({
  head: () => ({
    meta: [
      { title: "Programming Academy — EngineerOS" },
      {
        name: "description",
        content: "C, Python and Java tracks that build defensible programming fundamentals.",
      },
      { property: "og:title", content: "Programming Academy — EngineerOS" },
      { property: "og:description", content: "Language tracks with lesson-level progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProgrammingAcademy,
});

function ProgrammingAcademy() {
  const { user } = useAuth();
  const { data: courses = [] } = useQuery(coursesQuery("programming"));
  const { data: lessonProgress = [] } = useQuery(lessonProgressQuery(user?.id));

  return (
    <>
      <PageHeader
        eyebrow="Academy"
        title="Programming Academy"
        description="Pick one language and go deep. Breadth without depth is the most common trap in engineering college."
      />
      <div className="panel mb-6 flex gap-3 p-4">
        <Brain className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          Code runs in your own editor or terminal — EngineerOS does not execute code in the
          browser. Every lesson tells you exactly what to build locally.
        </p>
      </div>
      <CourseGrid courses={courses} lessonProgress={lessonProgress} />
    </>
  );
}
