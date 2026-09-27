// EngineerOS Kernel - The Single Source of Truth for the Student Career Operating System

export type CollegeTier =
  "Tier 1 (IIT/NIT/BITS/Top)" | "Tier 2 (State Govt/Reputed)" | "Tier 3 (Affiliated/Regional)";

export type TargetRole =
  | "Full Stack Engineer"
  | "Backend Engineer"
  | "Frontend Engineer"
  | "Embedded Systems Engineer"
  | "Systems / Low-Level Engineer"
  | "AI / Machine Learning Engineer"
  | "Data Scientist / Analyst"
  | "DevOps / Cloud Platform Engineer"
  | "Cybersecurity Analyst";

export type KernelOperatingMode = "standard" | "overclock" | "low_power";

export interface AcademicExamPeriod {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  type: "internals" | "labs" | "finals";
  notes?: string;
}

export interface KernelSystemMetrics {
  cpuLoadPercent: number; // 0 - 100 based on active tasks and build activity
  ramTotalMB: number; // Virtual brain capacity (e.g., 100 units / MB)
  ramUsedMB: number; // Active resident skills
  swapUsedMB: number; // Swapped to disk skills
  atRiskCount: number; // Skills near OOM kill / decay
  activeProcessesCount: number; // Today's running missions
  runningDaemonsCount: number; // Background habit daemons
  tutorialHellRatio: number; // Watch/read time divided by build/code time
  tutorialHellDetected: boolean;
  operatingMode: KernelOperatingMode;
  modeReason: string;
}

export interface KernelSyslogEntry {
  id: string;
  timestamp: string;
  subsystem: "KERNEL" | "MMU" | "DAEMON" | "SCHED" | "AUDITOR" | "POW";
  level: "INFO" | "WARN" | "CRIT" | "OK";
  message: string;
}

export interface StudentKernelState {
  version: string;
  initializedAt: string;
  lastSyncAt: string;
  // Core Identity
  branch: string;
  year: number;
  semester: number;
  collegeTier: CollegeTier;
  collegeName: string;
  targetRole: TargetRole;
  availableHoursPerWeek: number;
  // Exam Calendar
  examPeriods: AcademicExamPeriod[];
  // Build vs Watch tracking (seconds)
  buildTimeSeconds7d: number;
  watchTimeSeconds7d: number;
  // Cohort Benchmarking
  cohortOptIn: boolean;
  // Syslog
  syslog: KernelSyslogEntry[];
}

const KERNEL_STORAGE_KEY = "engineeros_kernel_state_v1";

export const DEFAULT_KERNEL_STATE: StudentKernelState = {
  version: "3.2.0-kernel",
  initializedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  lastSyncAt: new Date().toISOString(),
  branch: "Computer Science & Engineering",
  year: 3,
  semester: 5,
  collegeTier: "Tier 2 (State Govt/Reputed)",
  collegeName: "National Engineering Institute",
  targetRole: "Backend Engineer",
  availableHoursPerWeek: 18,
  examPeriods: [
    {
      id: "exam-mid-sem",
      name: "Mid-Semester Internals",
      startDate: new Date(Date.now() + 18 * 86400000).toISOString().split("T")[0]!,
      endDate: new Date(Date.now() + 24 * 86400000).toISOString().split("T")[0]!,
      type: "internals",
      notes: "OS, DBMS, Networks theory papers",
    },
  ],
  buildTimeSeconds7d: 14400, // 4 hours active coding
  watchTimeSeconds7d: 18000, // 5 hours reading
  cohortOptIn: true,
  syslog: [
    {
      id: "log-1",
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
      subsystem: "KERNEL",
      level: "OK",
      message: "Kernel v3.2.0-kernel initialized. Single source of truth active.",
    },
    {
      id: "log-2",
      timestamp: new Date(Date.now() - 90000).toLocaleTimeString(),
      subsystem: "SCHED",
      level: "INFO",
      message:
        "Academic calendar checked: Mid-Semester Internals in 18 days. Standard mode engaged.",
    },
    {
      id: "log-3",
      timestamp: new Date(Date.now() - 45000).toLocaleTimeString(),
      subsystem: "MMU",
      level: "WARN",
      message: "Page fault alert: 3 skills in swap space. Proactive page-in recommended.",
    },
    {
      id: "log-4",
      timestamp: new Date(Date.now() - 15000).toLocaleTimeString(),
      subsystem: "DAEMON",
      level: "OK",
      message: "5 system daemons running in background.",
    },
  ],
};

// Target Role Profiles for automatic whole-app re-planning
export interface RoleReplanPlan {
  role: TargetRole;
  focusKeywords: string[];
  recommendedTrack: string;
  priorityDsaPatterns: string[];
  systemFocusSubjects: string[];
  auditorGuideline: string;
  recommendedFirstCommand: string;
}

export const ROLE_REPLAN_PROFILES: Record<TargetRole, RoleReplanPlan> = {
  "Full Stack Engineer": {
    role: "Full Stack Engineer",
    focusKeywords: ["React", "TypeScript", "Node.js", "PostgreSQL", "REST APIs", "Tailwind CSS"],
    recommendedTrack: "/programming",
    priorityDsaPatterns: ["Hash Maps & Sets", "Two Pointers", "Sliding Window", "BFS/DFS"],
    systemFocusSubjects: ["Web Development", "Database Systems", "Software Engineering"],
    auditorGuideline: "Verify full-stack integration: frontend UI must talk to live API endpoints.",
    recommendedFirstCommand: "cd /career/portfolio && proof sync",
  },
  "Backend Engineer": {
    role: "Backend Engineer",
    focusKeywords: [
      "Go / Python / Java",
      "Concurrency",
      "Database Indexing",
      "Redis",
      "Kafka",
      "Linux Internals",
    ],
    recommendedTrack: "/linux",
    priorityDsaPatterns: [
      "Graphs & Topological Sort",
      "Dynamic Programming",
      "LRU Cache",
      "Priority Queues",
    ],
    systemFocusSubjects: ["Operating Systems", "Computer Networks", "Database Management Systems"],
    auditorGuideline:
      "Verify backend rigor: require benchmarked latency and ACID transaction handling.",
    recommendedFirstCommand: "cd /systems/linux/permissions && man grep",
  },
  "Frontend Engineer": {
    role: "Frontend Engineer",
    focusKeywords: [
      "TypeScript",
      "React",
      "State Management",
      "Performance Optimization",
      "Accessibility",
      "CSS Architecture",
    ],
    recommendedTrack: "/programming",
    priorityDsaPatterns: ["String Manipulation", "Trie", "Tree Traversal", "Sorting"],
    systemFocusSubjects: [
      "Web Technologies",
      "Human Computer Interaction",
      "Software Architecture",
    ],
    auditorGuideline: "Check lighthouse audit proof and component re-render optimization receipts.",
    recommendedFirstCommand: "cd /fundamentals/python/functions && run",
  },
  "Embedded Systems Engineer": {
    role: "Embedded Systems Engineer",
    focusKeywords: [
      "C / C++",
      "Microcontrollers",
      "RTOS",
      "Bit Manipulation",
      "I2C/SPI",
      "Memory Paging",
    ],
    recommendedTrack: "/programming",
    priorityDsaPatterns: [
      "Bit Manipulation",
      "Circular Buffers",
      "Fixed-size Heaps",
      "Linked Lists",
    ],
    systemFocusSubjects: [
      "Microprocessors & Microcontrollers",
      "Operating Systems",
      "Digital Electronics",
    ],
    auditorGuideline:
      "Enforce zero memory leaks: all C code runs must show valgrind or clean pointers execution.",
    recommendedFirstCommand: "cd /fundamentals/c/pointers && solve bit-swap",
  },
  "Systems / Low-Level Engineer": {
    role: "Systems / Low-Level Engineer",
    focusKeywords: ["C", "Rust", "Linux Kernel", "Memory Management", "POSIX Threads", "Assembly"],
    recommendedTrack: "/linux",
    priorityDsaPatterns: ["Segment Trees", "Graph Algorithms", "Memory Pool Allocator", "B-Trees"],
    systemFocusSubjects: ["Operating Systems", "Computer Architecture", "Compiler Design"],
    auditorGuideline:
      "Demand architectural clarity: student must explain cache-miss rates and system call overhead.",
    recommendedFirstCommand: "cd /systems/os/memory-paging && top",
  },
  "AI / Machine Learning Engineer": {
    role: "AI / Machine Learning Engineer",
    focusKeywords: [
      "Python",
      "PyTorch",
      "Linear Algebra",
      "Vector Embeddings",
      "Transformers",
      "Data Pipelines",
    ],
    recommendedTrack: "/academic",
    priorityDsaPatterns: [
      "Matrix Manipulations",
      "Search Trees",
      "Dynamic Programming",
      "Probability Drills",
    ],
    systemFocusSubjects: ["Probability & Statistics", "Artificial Intelligence", "Linear Algebra"],
    auditorGuideline:
      "Audit model evaluations: claims of accuracy must be supported by verifiable confusion matrix logs.",
    recommendedFirstCommand: "cd /fundamentals/python/functions && proof run",
  },
  "Data Scientist / Analyst": {
    role: "Data Scientist / Analyst",
    focusKeywords: [
      "SQL",
      "Python",
      "Pandas",
      "Statistical Modeling",
      "Tableau / PowerBI",
      "A/B Testing",
    ],
    recommendedTrack: "/sql-lab",
    priorityDsaPatterns: ["Sliding Window", "Prefix Sums", "Hash Tables", "Interval Merging"],
    systemFocusSubjects: ["Database Systems", "Applied Statistics", "Data Warehousing"],
    auditorGuideline: "Audit SQL queries: verify multi-table JOINs and window functions.",
    recommendedFirstCommand: "cd /dev/sql-lab && run",
  },
  "DevOps / Cloud Platform Engineer": {
    role: "DevOps / Cloud Platform Engineer",
    focusKeywords: [
      "Docker",
      "Kubernetes",
      "Linux Shell",
      "Terraform",
      "CI/CD Pipelines",
      "Observability",
    ],
    recommendedTrack: "/linux",
    priorityDsaPatterns: [
      "Graph Dependencies",
      "Scheduling Algorithms",
      "String Parsing",
      "Queueing Systems",
    ],
    systemFocusSubjects: ["Cloud Computing", "Computer Networks", "Distributed Systems"],
    auditorGuideline:
      "Check containerization proof: verify Dockerfile builds and CI pipeline pass receipts.",
    recommendedFirstCommand: "cd /systems/linux/permissions && man chmod",
  },
  "Cybersecurity Analyst": {
    role: "Cybersecurity Analyst",
    focusKeywords: [
      "Network Security",
      "Linux Hardening",
      "Cryptography",
      "Wireshark",
      "SOC Analysis",
      "Vulnerability Assessment",
    ],
    recommendedTrack: "/linux",
    priorityDsaPatterns: [
      "Bitwise Cryptography",
      "Graph Traversal",
      "Pattern Matching (KMP)",
      "Trees",
    ],
    systemFocusSubjects: ["Information Security", "Computer Networks", "Cryptography"],
    auditorGuideline:
      "Audit security protocols: verify adherence to OWASP guidelines and ethical security proofs.",
    recommendedFirstCommand: "cd /systems/linux/permissions && cat /career/proof-wall",
  },
};

/**
 * Load student kernel from localStorage or fallback
 */
export function loadKernelState(): StudentKernelState {
  if (typeof window === "undefined") {
    return DEFAULT_KERNEL_STATE;
  }
  try {
    const raw = localStorage.getItem(KERNEL_STORAGE_KEY);
    if (!raw) {
      saveKernelState(DEFAULT_KERNEL_STATE);
      return DEFAULT_KERNEL_STATE;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_KERNEL_STATE, ...parsed };
  } catch (err) {
    console.error("[Kernel] Failed to load state, restoring default:", err);
    return DEFAULT_KERNEL_STATE;
  }
}

/**
 * Save student kernel state
 */
export function saveKernelState(state: StudentKernelState): void {
  if (typeof window === "undefined") return;
  try {
    const toSave: StudentKernelState = {
      ...state,
      lastSyncAt: new Date().toISOString(),
    };
    localStorage.setItem(KERNEL_STORAGE_KEY, JSON.stringify(toSave));
    window.dispatchEvent(new CustomEvent("engineeros:kernel-updated", { detail: toSave }));
  } catch (err) {
    console.error("[Kernel] Failed to save state:", err);
  }
}

/**
 * Append entry to Kernel Syslog
 */
export function logToSyslog(
  subsystem: KernelSyslogEntry["subsystem"],
  level: KernelSyslogEntry["level"],
  message: string,
): void {
  const current = loadKernelState();
  const newEntry: KernelSyslogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toLocaleTimeString(),
    subsystem,
    level,
    message,
  };
  const updatedLogs = [newEntry, ...(current.syslog || [])].slice(0, 50); // Keep last 50
  saveKernelState({ ...current, syslog: updatedLogs });
}

/**
 * Calculate Kernel Operating Mode based on Exam Calendar
 */
export function calculateKernelOperatingMode(examPeriods: AcademicExamPeriod[]): {
  mode: KernelOperatingMode;
  reason: string;
  nextExamName?: string;
  daysUntilNextExam?: number;
} {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let closestFutureExam: { exam: AcademicExamPeriod; days: number } | null = null;
  let currentlyOngoingExam: AcademicExamPeriod | null = null;

  for (const ep of examPeriods) {
    const start = new Date(ep.startDate);
    const end = new Date(ep.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (now >= start && now <= end) {
      currentlyOngoingExam = ep;
      break;
    }

    if (start > now) {
      const diffDays = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (!closestFutureExam || diffDays < closestFutureExam.days) {
        closestFutureExam = { exam: ep, days: diffDays };
      }
    }
  }

  // If exam is ongoing or within 10 days -> Kernel Low-Power / Maintenance Mode
  if (currentlyOngoingExam) {
    return {
      mode: "low_power",
      reason: `Exam in session: ${currentlyOngoingExam.name}. Kernel throttle engaged to prioritize college syllabus.`,
      nextExamName: currentlyOngoingExam.name,
      daysUntilNextExam: 0,
    };
  }

  if (closestFutureExam && closestFutureExam.days <= 10) {
    return {
      mode: "low_power",
      reason: `${closestFutureExam.exam.name} begins in ${closestFutureExam.days} days. High-stress DSA throttled, academic memory refreshers prioritized.`,
      nextExamName: closestFutureExam.exam.name,
      daysUntilNextExam: closestFutureExam.days,
    };
  }

  // If exam ended within last 14 days or user has free sprint -> Overclock mode
  if (closestFutureExam && closestFutureExam.days > 35) {
    return {
      mode: "overclock",
      reason:
        "No upcoming exams in sight. Kernel overclocked: +25% XP bonus for project commits & mock interviews!",
      nextExamName: closestFutureExam.exam.name,
      daysUntilNextExam: closestFutureExam.days,
    };
  }

  return {
    mode: "standard",
    reason: closestFutureExam
      ? `${closestFutureExam.exam.name} scheduled in ${closestFutureExam.days} days. Balanced system execution.`
      : "Steady state academic semester. Standard process allocation.",
    nextExamName: closestFutureExam?.exam.name,
    daysUntilNextExam: closestFutureExam?.days,
  };
}

/**
 * Re-plan the entire Kernel when student changes target role
 */
export function replanCareerKernel(newRole: TargetRole): {
  replanInfo: RoleReplanPlan;
  previousRole: TargetRole;
} {
  const current = loadKernelState();
  const previousRole = current.targetRole;
  const replanInfo = ROLE_REPLAN_PROFILES[newRole];

  logToSyslog(
    "KERNEL",
    "WARN",
    `Target role switched from '${previousRole}' to '${newRole}'. Re-indexing skill graph and priority processes.`,
  );

  saveKernelState({
    ...current,
    targetRole: newRole,
  });

  return { replanInfo, previousRole };
}

/**
 * Record time spent building (coding, terminal, compiling) vs watching/reading
 */
export function recordKernelActivityTime(type: "build" | "watch", deltaSeconds: number): void {
  const current = loadKernelState();
  const updatedBuild =
    type === "build" ? current.buildTimeSeconds7d + deltaSeconds : current.buildTimeSeconds7d;
  const updatedWatch =
    type === "watch" ? current.watchTimeSeconds7d + deltaSeconds : current.watchTimeSeconds7d;

  saveKernelState({
    ...current,
    buildTimeSeconds7d: updatedBuild,
    watchTimeSeconds7d: updatedWatch,
  });
}
