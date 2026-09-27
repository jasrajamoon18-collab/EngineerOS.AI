import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Terminal, FolderTree } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { primaryNav } from "@/lib/nav";
import { coursesQuery, dsaProblemsQuery, projectIdeasQuery } from "@/lib/queries";
import { CAREER_FILESYSTEM } from "@/lib/filesystem";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: courses } = useQuery({ ...coursesQuery(), enabled: open });
  const { data: problems } = useQuery({ ...dsaProblemsQuery(), enabled: open });
  const { data: ideas } = useQuery({ ...projectIdeasQuery(), enabled: open });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(to: string) {
    setOpen(false);
    void navigate({ to });
  }

  const filesystemItems = Object.entries(CAREER_FILESYSTEM)
    .filter(([path, node]) => node.routeTarget && path !== "/")
    .slice(0, 15);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-muted-foreground font-mono"
        onClick={() => setOpen(true)}
        aria-label="Search EngineerOS"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Search & Cmd</span>
        <kbd className="label-mono hidden rounded border border-border px-1.5 text-[10px] md:inline">
          Ctrl K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a path (e.g. cd /dsa/graphs, cat /career/resume) or search..." />
        <CommandList>
          <CommandEmpty>No matches found.</CommandEmpty>
          <CommandGroup heading="Career Filesystem & Terminal Directives">
            {filesystemItems.map(([path, node]) => (
              <CommandItem
                key={path}
                value={`cd ${path} cat ${path} ${node.name} ${node.description || ""}`}
                onSelect={() => node.routeTarget && go(node.routeTarget)}
                className="font-mono text-xs"
              >
                <FolderTree className="mr-2 h-4 w-4 text-emerald-500" aria-hidden="true" />
                <span className="font-semibold text-primary">{path}</span>
                {node.description && (
                  <span className="ml-2 text-muted-foreground truncate text-[11px]">
                    — {node.description}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Pages & Modules">
            {primaryNav.map((item) => (
              <CommandItem
                key={item.to}
                value={`${item.label} ${item.keywords ?? ""} ${item.to}`}
                onSelect={() => go(item.to)}
              >
                <item.icon className="mr-2 h-4 w-4" aria-hidden="true" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>

          {courses?.length ? (
            <CommandGroup heading="Courses">
              {courses.map((course) => (
                <CommandItem
                  key={course.id}
                  value={`course ${course.title}`}
                  onSelect={() => go(`/learn/${course.slug}`)}
                >
                  {course.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {problems?.length ? (
            <CommandGroup heading="DSA problems">
              {problems.slice(0, 40).map((problem) => (
                <CommandItem
                  key={problem.id}
                  value={`dsa ${problem.title}`}
                  onSelect={() => go("/dsa")}
                >
                  {problem.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {ideas?.length ? (
            <CommandGroup heading="Project ideas">
              {ideas.slice(0, 40).map((idea) => (
                <CommandItem
                  key={idea.id}
                  value={`project ${idea.title}`}
                  onSelect={() => go("/projects")}
                >
                  {idea.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  );
}
