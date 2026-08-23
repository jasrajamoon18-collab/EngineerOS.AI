import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Terminal } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { CourseGrid } from "@/components/course-grid";
import { useAuth } from "@/hooks/useAuth";
import { coursesQuery, lessonProgressQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/linux")({
  head: () => ({
    meta: [
      { title: "Linux Academy — EngineerOS" },
      {
        name: "description",
        content: "Filesystem, permissions, processes and shell scripting for engineering students.",
      },
      { property: "og:title", content: "Linux Academy — EngineerOS" },
      { property: "og:description", content: "Terminal fundamentals and automation tracks." },
    ],
  }),
  component: LinuxAcademy,
});

const commands = [
  { cmd: "pwd / ls -la", note: "Where am I, and what is actually here." },
  { cmd: "cd / mkdir / rm -r", note: "Move and shape the filesystem." },
  { cmd: "chmod / chown", note: "Permissions: the source of most 'it works on my machine'." },
  { cmd: "ps aux / kill", note: "See processes, end the misbehaving ones." },
  { cmd: "grep / find", note: "Search text and files like an engineer, not a tourist." },
  { cmd: "ssh / scp", note: "Work on machines that are not yours." },
];

function LinuxAcademy() {
  const { user } = useAuth();
  const { data: courses = [] } = useQuery(coursesQuery("linux"));
  const { data: lessonProgress = [] } = useQuery(lessonProgressQuery(user?.id));

  return (
    <>
      <PageHeader
        eyebrow="Academy"
        title="Linux Academy"
        description="Servers, embedded boards, CI runners and clusters all speak Linux. Get fluent in the environment engineering actually runs on."
      />
      <CourseGrid courses={courses} lessonProgress={lessonProgress} />

      <section className="panel mt-8 p-6">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Command reference</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          A static reference to practise in your own terminal. There is no simulated shell here —
          run these on a real machine or VM.
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {commands.map((item) => (
            <li key={item.cmd} className="rounded-lg border border-border p-3">
              <code className="font-mono text-sm text-primary">{item.cmd}</code>
              <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
