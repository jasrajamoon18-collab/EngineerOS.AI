import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Briefcase,
  Building2,
  CalendarCheck,
  CalendarRange,
  ClipboardList,
  Code2,
  Compass,
  Database,
  FileCode2,
  FileText,
  FolderGit2,
  Gauge,
  GitBranch,
  GraduationCap,
  LayoutDashboard,
  Linkedin,
  ListTree,
  MessagesSquare,
  Mic,
  Rocket,
  Route as RouteIcon,
  Terminal,
  Timer,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";

export type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  keywords?: string;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        to: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        keywords: "home mission today",
      },
      { to: "/mentor", label: "AI Mentor", icon: Compass, keywords: "chat guidance help" },
    ],
  },
  {
    title: "Learn & Academy",
    items: [
      {
        to: "/academic",
        label: "Academic Hub",
        icon: BookOpen,
        keywords: "semester branch subjects notes exam",
      },
      {
        to: "/learn",
        label: "Course Library",
        icon: GraduationCap,
        keywords: "courses lessons library",
      },
      {
        to: "/programming",
        label: "Programming Academy",
        icon: Brain,
        keywords: "python java c++",
      },
      { to: "/linux", label: "Linux Academy", icon: Terminal, keywords: "shell bash commands" },
      {
        to: "/cheat-sheets",
        label: "Cheat Sheets",
        icon: FileCode2,
        keywords: "quick reference syntax formulas",
      },
      { to: "/roadmaps", label: "Career Roadmaps", icon: RouteIcon, keywords: "learning path" },
    ],
  },
  {
    title: "Practice & Labs",
    items: [
      { to: "/code-lab", label: "Code Lab", icon: Code2, keywords: "challenges snippets compiler" },
      { to: "/sql-lab", label: "SQL Lab", icon: Database, keywords: "queries database practice" },
      { to: "/dsa", label: "DSA Practice", icon: ListTree, keywords: "algorithms data structures" },
      {
        to: "/aptitude",
        label: "Placement Drills",
        icon: Timer,
        keywords: "quantitative reasoning",
      },
    ],
  },
  {
    title: "Build & Portfolio",
    items: [
      {
        to: "/projects",
        label: "Project Lab",
        icon: FolderGit2,
        keywords: "build ideas milestones",
      },
      {
        to: "/hackathons",
        label: "Hackathons & Research",
        icon: Rocket,
        keywords: "hackathon competitions papers research",
      },
      {
        to: "/git",
        label: "Git & GitHub Hub",
        icon: GitBranch,
        keywords: "version control commits",
      },
      {
        to: "/portfolio",
        label: "Portfolio Builder",
        icon: Briefcase,
        keywords: "public profile showcase",
      },
    ],
  },
  {
    title: "Career & Get Hired",
    items: [
      { to: "/resume", label: "Resume & ATS", icon: FileText, keywords: "cv analyzer keywords" },
      { to: "/linkedin", label: "LinkedIn Center", icon: Linkedin, keywords: "profile headline" },
      {
        to: "/interview",
        label: "Interview Academy",
        icon: Mic,
        keywords: "mock questions answers",
      },
      {
        to: "/companies",
        label: "Company Prep",
        icon: Building2,
        keywords: "faang tcs google interview rounds",
      },
      {
        to: "/communication",
        label: "Communication",
        icon: MessagesSquare,
        keywords: "speaking writing",
      },
      {
        to: "/skills",
        label: "Skill Gap Analyzer",
        icon: Gauge,
        keywords: "self assessment ratings",
      },
      { to: "/career", label: "Career Tracks", icon: RouteIcon, keywords: "roadmap goals" },
      { to: "/jobs", label: "Job Tracker", icon: ClipboardList, keywords: "jobs pipeline" },
    ],
  },
  {
    title: "Productivity",
    items: [
      { to: "/tasks", label: "Daily Mission", icon: CalendarCheck, keywords: "habits streak" },
      {
        to: "/planner",
        label: "Weekly Planner",
        icon: CalendarRange,
        keywords: "study plan schedule",
      },
      { to: "/certifications", label: "Certifications", icon: Award, keywords: "exams planner" },
      {
        to: "/achievements",
        label: "Achievements",
        icon: Trophy,
        keywords: "badges leaderboard xp",
      },
      {
        to: "/insights",
        label: "Insights & Stats",
        icon: BarChart3,
        keywords: "analytics trends export",
      },
    ],
  },
  {
    title: "Community & You",
    items: [
      { to: "/community", label: "Community", icon: Users, keywords: "study groups posts" },
      { to: "/notifications", label: "Notifications", icon: Bell, keywords: "reminders alerts" },
      {
        to: "/profile",
        label: "Profile & Settings",
        icon: UserRound,
        keywords: "account privacy settings",
      },
    ],
  },
];

export const primaryNav: NavItem[] = navSections.flatMap((s) => s.items);
