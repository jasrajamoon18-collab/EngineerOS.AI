import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { CourseGrid } from "@/components/course-grid";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { coursesQuery, lessonProgressQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/learn/")({
  head: () => ({
    meta: [
      { title: "Learning library — EngineerOS" },
      {
        name: "description",
        content:
          "Every EngineerOS course track: programming, Linux, DSA, core engineering and career readiness.",
      },
      { property: "og:title", content: "Learning library — EngineerOS" },
      {
        property: "og:description",
        content: "Structured engineering courses with real progress tracking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LearnIndex,
});

const filters = [
  { value: "all", label: "All tracks" },
  { value: "programming", label: "Programming" },
  { value: "linux", label: "Linux" },
  { value: "dsa", label: "DSA" },
  { value: "core", label: "Core engineering" },
  { value: "career", label: "Career" },
] as const;

function LearnIndex() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("all");
  const { data: courses = [], isLoading } = useQuery(coursesQuery());
  const { data: lessonProgress = [] } = useQuery(lessonProgressQuery(user?.id));

  const visible = filter === "all" ? courses : courses.filter((course) => course.track === filter);

  return (
    <>
      <PageHeader
        eyebrow="Learning system"
        title="Course library"
        description="Each course is modules → lessons. Complete a lesson and it stays completed, everywhere."
      />
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by track">
        {filters.map((item) => (
          <Button
            key={item.value}
            size="sm"
            variant={filter === item.value ? "default" : "outline"}
            onClick={() => setFilter(item.value)}
            aria-pressed={filter === item.value}
          >
            {item.label}
          </Button>
        ))}
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading courses…</p>
      ) : (
        <CourseGrid courses={visible} lessonProgress={lessonProgress} />
      )}
    </>
  );
}
