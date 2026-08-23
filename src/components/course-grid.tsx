import { Link } from "@tanstack/react-router";
import { Clock, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Course, LessonProgress } from "@/lib/queries";

export function CourseGrid({
  courses,
  lessonProgress,
}: {
  courses: Course[];
  lessonProgress: LessonProgress[];
}) {
  if (courses.length === 0) {
    return (
      <p className="panel p-8 text-center text-sm text-muted-foreground">
        No courses published in this track yet.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => {
        const done = lessonProgress.filter(
          (p) => p.course_id === course.id && p.status === "completed",
        ).length;
        return (
          <Link
            key={course.id}
            to="/learn/$courseSlug"
            params={{ courseSlug: course.slug }}
            className="panel flex flex-col p-5 transition-colors hover:border-primary/50 hover:bg-surface"
          >
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="label-mono">
                {course.track}
              </Badge>
              <Badge variant="secondary" className="label-mono">
                {course.level}
              </Badge>
            </div>
            <h3 className="mt-3 text-base font-semibold">{course.title}</h3>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{course.summary}</p>
            <div className="label-mono mt-4 flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {course.estimated_hours}h
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                {done} done
              </span>
            </div>
            {done > 0 ? <Progress className="mt-3 h-1" value={Math.min(done * 16, 100)} /> : null}
          </Link>
        );
      })}
    </div>
  );
}
