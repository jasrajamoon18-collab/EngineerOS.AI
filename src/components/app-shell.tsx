import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Brain,
  Briefcase,
  CalendarCheck,
  Code2,
  Compass,
  Database,
  FileText,
  GitBranch,
  FolderGit2,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  Linkedin,
  MessagesSquare,
  Mic,
  Route as RouteIcon,
  ListTree,
  LogOut,
  Menu,
  Terminal,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { profileQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const primaryNav: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/learn", label: "Learn", icon: GraduationCap },
  { to: "/programming", label: "Programming Academy", icon: Brain },
  { to: "/linux", label: "Linux Academy", icon: Terminal },
  { to: "/dsa", label: "DSA Practice", icon: ListTree },
  { to: "/code-lab", label: "Code Lab", icon: Code2 },
  { to: "/sql-lab", label: "SQL Lab", icon: Database },
  { to: "/projects", label: "Project Lab", icon: FolderGit2 },
  { to: "/git", label: "Git & GitHub Hub", icon: GitBranch },
  { to: "/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/resume", label: "Resume & ATS", icon: FileText },
  { to: "/linkedin", label: "LinkedIn Center", icon: Linkedin },
  { to: "/communication", label: "Communication", icon: MessagesSquare },
  { to: "/interview", label: "Interview Academy", icon: Mic },
  { to: "/skills", label: "Skill Gap Analyzer", icon: Gauge },
  { to: "/career", label: "Career Tracks", icon: RouteIcon },
  { to: "/tasks", label: "Daily Tasks", icon: CalendarCheck },
  { to: "/mentor", label: "AI Mentor", icon: Compass },
  { to: "/roadmaps", label: "Roadmaps", icon: Compass },
  { to: "/profile", label: "Profile", icon: UserRound },
];

const plannedNav = [{ label: "Community", icon: Users }];

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { data: profile } = useQuery(profileQuery(user?.id));

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    navigate({ to: "/auth", replace: true });
  }

  const nav = (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto p-4" aria-label="Main">
      <div className="space-y-1">
        <p className="label-mono px-3 pb-2 text-muted-foreground">Systems</p>
        {primaryNav.map((item) => {
          const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="space-y-1">
        <p className="label-mono px-3 pb-2 text-muted-foreground">Planned modules</p>
        {plannedNav.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground/60"
            aria-disabled="true"
          >
            <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="flex-1">{item.label}</span>
            <Badge variant="outline" className="label-mono border-dashed">
              Soon
            </Badge>
          </div>
        ))}
      </div>

      <div className="mt-auto space-y-2 border-t border-sidebar-border pt-4">
        <div className="px-3">
          <p className="truncate text-sm font-medium">{profile?.full_name ?? "Student"}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </Button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur lg:pl-[17rem]">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
          <span className="font-display text-base font-bold tracking-tight">EngineerOS</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <span className="label-mono hidden text-muted-foreground sm:block">
            Learn · Build · Practice · Grow · Get Hired
          </span>
          <ThemeToggle />
        </div>
      </header>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-sidebar-border bg-sidebar transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Terminal className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">EngineerOS</span>
        </div>
        <div className="h-[calc(100vh-3.5rem)]">{nav}</div>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <main id="main-content" className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="label-mono mb-2 text-primary">{eyebrow}</p> : null}
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}
