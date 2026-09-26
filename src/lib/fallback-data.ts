import type {
  Course,
  Module,
  Lesson,
  Branch,
  DsaProblem,
  DailyTask,
  Roadmap,
  RoadmapStep,
} from "@/lib/queries";
import type { CodeChallenge } from "@/lib/queries";

export const DEFAULT_BRANCHES: Branch[] = [
  {
    id: "branch-cse",
    slug: "cse",
    name: "Computer Science & Engineering",
    description: "Software systems, algorithms, architectures, and full-stack computing.",
    icon: "cpu",
    order_index: 1,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "branch-aids",
    slug: "aids",
    name: "AI & Machine Learning / Data Science",
    description: "Machine learning, neural networks, deep learning, NLP, and intelligent agents.",
    icon: "brain",
    order_index: 2,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "branch-cyber",
    slug: "cyber",
    name: "Cybersecurity & Information Security",
    description:
      "Network defense, digital forensics, ethical hacking, cryptography, and secure architectures.",
    icon: "shield",
    order_index: 3,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "branch-ece",
    slug: "ece",
    name: "Electronics & Communication (ECE)",
    description:
      "Circuits, signal processing, VLSI design, wireless networks, and embedded systems.",
    icon: "radio",
    order_index: 4,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "branch-eee",
    slug: "eee",
    name: "Electrical & Electronics (EEE)",
    description: "Power grids, electrical machines, renewable energy, and control engineering.",
    icon: "zap",
    order_index: 5,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "branch-mech",
    slug: "mech",
    name: "Mechanical Engineering",
    description:
      "CAD/CAM, thermodynamics, fluid mechanics, robotics, and industrial manufacturing.",
    icon: "cog",
    order_index: 6,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "branch-civil",
    slug: "civil",
    name: "Civil Engineering",
    description:
      "Structural design, geotech, transportation, smart infrastructure, and environmental engineering.",
    icon: "building-2",
    order_index: 7,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "branch-robotics",
    slug: "robotics",
    name: "Robotics & Mechatronics",
    description: "Kinematics, sensors, ROS2, computer vision, actuators, and autonomous systems.",
    icon: "bot",
    order_index: 8,
    created_at: "2026-01-01T00:00:00Z",
  },
];

export const DEFAULT_COURSES: Course[] = [
  {
    id: "course-c-programming",
    slug: "c-programming",
    title: "C Programming & Memory Foundations",
    summary: "Master memory allocation, pointers, structs, and hardware-near thinking.",
    description:
      "C is the foundation of operating systems, runtimes, game engines, and embedded systems. Learn syntax, pointers, heap vs stack, and systems thinking.",
    track: "programming",
    level: "beginner",
    branch_slug: "cse",
    tags: ["c", "pointers", "memory", "systems"],
    estimated_hours: 12,
    order_index: 1,
    is_published: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "course-python-essentials",
    slug: "python-essentials",
    title: "Python Essentials & Automation",
    summary: "From syntax to scripting real-world automation, data pipelines, and CLI tools.",
    description:
      "Python is the world's most versatile language for scripting, AI, automation, and backend development. Build clean syntax, data structures, and modular programs.",
    track: "programming",
    level: "beginner",
    branch_slug: "cse",
    tags: ["python", "automation", "scripting"],
    estimated_hours: 14,
    order_index: 2,
    is_published: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "course-java-oop",
    slug: "java-oop",
    title: "Java & Object-Oriented Design",
    summary: "Classes, inheritance, polymorphism, design patterns, and interview thinking.",
    description:
      "Java powers enterprise backends, Android applications, and technical interviews. Understand SOLID principles, encapsulation, memory management, and interfaces.",
    track: "programming",
    level: "intermediate",
    branch_slug: "cse",
    tags: ["java", "oop", "solid", "design-patterns"],
    estimated_hours: 16,
    order_index: 3,
    is_published: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "course-linux-basics",
    slug: "linux-basics",
    title: "Linux Fundamentals & Command Mastery",
    summary: "Filesystem hierarchy, permissions, process control, and terminal power habits.",
    description:
      "Every cloud server, container, and embedded board runs Linux. Master bash commands, file permissions, pipe manipulation, and grep/awk/sed diagnostics.",
    track: "linux",
    level: "beginner",
    branch_slug: null,
    tags: ["linux", "bash", "cli", "terminal"],
    estimated_hours: 10,
    order_index: 4,
    is_published: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "course-linux-shell",
    slug: "linux-shell",
    title: "Shell Scripting & Server Automation",
    summary: "Write robust bash scripts, automate cron jobs, and monitor live systems.",
    description:
      "Turn hours of repetitive manual maintenance into automated shell scripts. Learn error handling, trap signals, environment configurations, and server diagnostics.",
    track: "linux",
    level: "intermediate",
    branch_slug: null,
    tags: ["bash", "cron", "automation", "devops"],
    estimated_hours: 10,
    order_index: 5,
    is_published: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "course-dsa-foundations",
    slug: "dsa-foundations",
    title: "Data Structures & Algorithms Foundations",
    summary: "Asymptotic notation, arrays, hash maps, trees, recursion, and interview patterns.",
    description:
      "The core technical interview requirement for engineering candidates. Learn Big-O complexity, two-pointer techniques, sliding windows, recursion, and graph traversals.",
    track: "dsa",
    level: "beginner",
    branch_slug: "cse",
    tags: ["dsa", "algorithms", "big-o", "leetcode"],
    estimated_hours: 20,
    order_index: 6,
    is_published: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "course-dbms-sql",
    slug: "dbms-sql",
    title: "Database Management & SQL Academy",
    summary: "Relational modeling, indexing, joins, transactions, ACID, and query optimization.",
    description:
      "Data is the lifeblood of software. Learn relational schema design, 3NF normalization, foreign key constraints, complex joins, window functions, and indexing strategies.",
    track: "core",
    level: "beginner",
    branch_slug: "cse",
    tags: ["sql", "dbms", "postgresql", "indexing"],
    estimated_hours: 14,
    order_index: 7,
    is_published: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "course-operating-systems",
    slug: "operating-systems",
    title: "Operating Systems & Concurrency",
    summary: "Processes, threads, CPU scheduling, synchronization, deadlocks, and virtual memory.",
    description:
      "Understand how hardware turns into software execution. Master process lifecycle, mutexes, semaphores, paging, and kernel vs user space.",
    track: "core",
    level: "intermediate",
    branch_slug: "cse",
    tags: ["os", "threads", "virtual-memory", "deadlocks"],
    estimated_hours: 14,
    order_index: 8,
    is_published: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "course-computer-networks",
    slug: "computer-networks",
    title: "Computer Networks & Protocols",
    summary: "OSI model, TCP/IP, DNS, HTTP/HTTPS, routing, socket programming, and security.",
    description:
      "How data flows across the planet. Master packet encapsulation, TCP three-way handshakes, UDP reliability trade-offs, DNS resolution, and TLS handshakes.",
    track: "core",
    level: "intermediate",
    branch_slug: "cse",
    tags: ["networking", "tcp-ip", "http", "sockets"],
    estimated_hours: 12,
    order_index: 9,
    is_published: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "course-career-readiness",
    slug: "career-readiness",
    title: "Career Readiness & Interview Mastery",
    summary:
      "ATS resume crafting, portfolio deployment, LinkedIn presence, and technical interviews.",
    description:
      "Turn technical ability into job offers. Learn STAR technique for behavioral questions, whiteboard coding communication, ATS keyword alignment, and compensation negotiation.",
    track: "career",
    level: "beginner",
    branch_slug: null,
    tags: ["career", "resume", "ats", "interviews", "jobs"],
    estimated_hours: 8,
    order_index: 10,
    is_published: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

export function getFallbackCourseDetail(slug: string): {
  course: Course;
  modules: Module[];
  lessons: Lesson[];
} | null {
  const course = DEFAULT_COURSES.find((c) => c.slug === slug);
  if (!course) return null;

  const modules: Module[] = [
    {
      id: `${course.id}-m1`,
      course_id: course.id,
      title: "Foundations & Mental Models",
      summary: "Understanding the core architecture, mental models, and environment setup.",
      order_index: 1,
      created_at: "2026-01-01T00:00:00Z",
    },
    {
      id: `${course.id}-m2`,
      course_id: course.id,
      title: "Core Mechanics & Hands-On Practice",
      summary: "Deep dive into syntax, operations, error handling, and real code patterns.",
      order_index: 2,
      created_at: "2026-01-01T00:00:00Z",
    },
    {
      id: `${course.id}-m3`,
      course_id: course.id,
      title: "Real-World Projects & Interview Questions",
      summary: "Architecting a production artifact, testing, documentation, and interview viva.",
      order_index: 3,
      created_at: "2026-01-01T00:00:00Z",
    },
  ];

  const lessons: Lesson[] = [
    {
      id: `${course.id}-l1`,
      module_id: `${course.id}-m1`,
      slug: `${course.slug}-why-it-matters`,
      title: "1. Why This Matters & Industry Landscape",
      est_minutes: 12,
      order_index: 1,
      created_at: "2026-01-01T00:00:00Z",
      content_md: `## Why ${course.title} Matters in Engineering

Every serious software and hardware system is built on a layered architecture. When you master **${course.title}**, you stop memorizing syntax and start reasoning like a systems architect.

### Key Takeaways
- **First-Principles Thinking**: How this topic bridges human intent and computational hardware.
- **Where It Appears in Industry**: Production servers, cloud runtimes, embedded platforms, and technical interview stages.
- **The EngineerOS Loop**: Read the concept once, experiment in Code Lab, inspect the output, and add the project milestone to your portfolio.

> "A great engineer is not someone who never makes errors; it is someone who knows exactly which layer of abstraction failed."
`,
    },
    {
      id: `${course.id}-l2`,
      module_id: `${course.id}-m1`,
      slug: `${course.slug}-environment-setup`,
      title: "2. Setting Up Your Diagnostic Environment",
      est_minutes: 15,
      order_index: 2,
      created_at: "2026-01-01T00:00:00Z",
      content_md: `## Environment Setup & Essential Tooling

Before building, verify your compiler, runtime, or terminal toolchain.

### Step-by-Step Configuration
1. **Verification Command**: Run your version flags (\`--version\`) to verify PATH availability.
2. **Editor Extensions**: Enable linter warnings, syntax highlighting, and format-on-save.
3. **Execution Sandbox**: Use our integrated **Code Lab** or local terminal.
4. **Git Tracking**: Initialize your repository immediately:
\`\`\`bash
git init
echo "# Notes on ${course.title}" > README.md
git add . && git commit -m "initial commit"
\`\`\`
`,
    },
    {
      id: `${course.id}-l3`,
      module_id: `${course.id}-m2`,
      slug: `${course.slug}-core-mechanics`,
      title: "3. Deep Dive: Core Primitives & Syntax",
      est_minutes: 25,
      order_index: 3,
      created_at: "2026-01-01T00:00:00Z",
      content_md: `## Core Building Blocks of ${course.title}

Understanding the core primitives gives you 80% of the daily capability needed to build production features.

### Architecture Breakdown
- **Memory & Scope**: How identifiers are declared, referenced, and garbage-collected or freed.
- **Control Flow**: Conditionals, guarded returns, loops, and edge condition handling.
- **Error Propagation**: Defensive programming, status codes, try/catch blocks, and clean logging.

\`\`\`typescript
// Production pattern: Explicit error handling and clean contracts
export function processInput<T>(input: T): { success: boolean; data: T | null; error?: string } {
  if (!input) {
    return { success: false, data: null, error: "Missing required payload" };
  }
  return { success: true, data: input };
}
\`\`\`
`,
    },
    {
      id: `${course.id}-l4`,
      module_id: `${course.id}-m2`,
      slug: `${course.slug}-anti-patterns`,
      title: "4. Common Pitfalls & Anti-Patterns",
      est_minutes: 20,
      order_index: 4,
      created_at: "2026-01-01T00:00:00Z",
      content_md: `## Pitfalls Every Beginner and Junior Falls Into

Avoid these common traps to write senior-grade, resilient code from day one:

1. **Premature Optimization**: Optimize for clarity first, profile with benchmarks second.
2. **Silent Failure**: Never suppress exceptions with empty catch clauses or unhandled promises.
3. **Unbounded Growth**: Watch for memory leaks in persistent event listeners or uncapped arrays.
4. **Hardcoded Secrets**: Always use environment configuration and secret managers.
`,
    },
    {
      id: `${course.id}-l5`,
      module_id: `${course.id}-m3`,
      slug: `${course.slug}-mini-project`,
      title: "5. Capstone Project Brief & Milestones",
      est_minutes: 40,
      order_index: 5,
      created_at: "2026-01-01T00:00:00Z",
      content_md: `## Capstone Milestone Project

Time to turn knowledge into a verified portfolio artifact.

### Requirements:
- Build an end-to-end working program that solves a real problem.
- Include structured unit tests or input test cases.
- Write a professional \`README.md\` with architecture diagram and setup instructions.
- Push your project to GitHub and showcase it on your **EngineerOS Portfolio**.
`,
    },
    {
      id: `${course.id}-l6`,
      module_id: `${course.id}-m3`,
      slug: `${course.slug}-interview-viva`,
      title: "6. Interview Questions & Viva Defense",
      est_minutes: 20,
      order_index: 6,
      created_at: "2026-01-01T00:00:00Z",
      content_md: `## Top Technical Interview Questions on ${course.title}

Prepare for campus placement tests, college vivas, and senior technical interviews.

### High-Yield Questions:
1. **Explain the trade-offs**: Why choose this approach over alternatives in high-throughput systems?
2. **Complexity Analysis**: What are the worst-case and average-case time and space complexities?
3. **Failure Scenarios**: What happens if the network disconnects, memory overflows, or concurrent writes collide?

Use the **Interview Academy** in EngineerOS to practice answering these questions aloud with our AI coach!
`,
    },
  ];

  return { course, modules, lessons };
}

export const DEFAULT_DSA_PROBLEMS: DsaProblem[] = [
  {
    id: "dsa-two-sum",
    slug: "two-sum",
    title: "Two Sum",
    topic: "Arrays & Hash Maps",
    level: "beginner",
    statement:
      "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume each input has exactly one solution.",
    hint: "Use a hash map to store elements you have already inspected. For each number x, check if (target - x) is already in the map.",
    pattern: "Hash Map Complement Lookup",
    order_index: 1,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "dsa-valid-parentheses",
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    topic: "Stacks",
    level: "beginner",
    statement:
      "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. Open brackets must be closed by the same type of brackets in the correct order.",
    hint: "Push opening brackets onto a stack. When an opening bracket is matched by a closing bracket, pop the stack and verify that the types match.",
    pattern: "LIFO Stack Matching",
    order_index: 2,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "dsa-reverse-string",
    slug: "reverse-string",
    title: "Reverse String In-Place",
    topic: "Strings & Two Pointers",
    level: "beginner",
    statement:
      "Write a function that reverses an array of characters in-place using O(1) extra memory.",
    hint: "Initialize two pointers: left at index 0 and right at index n-1. Swap elements and advance towards the center until left >= right.",
    pattern: "Two Pointers Opposing Walk",
    order_index: 3,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "dsa-binary-search",
    slug: "binary-search",
    title: "Binary Search",
    topic: "Searching & Divide & Conquer",
    level: "beginner",
    statement:
      "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, return its index; otherwise, return -1. Time complexity must be O(log n).",
    hint: "Calculate mid = left + Math.floor((right - left) / 2) to prevent integer overflow. Compare nums[mid] with target.",
    pattern: "Binary Search Divide & Conquer",
    order_index: 4,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "dsa-max-subarray",
    slug: "max-subarray",
    title: "Maximum Subarray (Kadane's)",
    topic: "Arrays & Dynamic Programming",
    level: "intermediate",
    statement:
      "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
    hint: "Kadane's algorithm: at each index, decide whether to start a new subarray or extend the existing running sum.",
    pattern: "Kadane's Algorithm",
    order_index: 5,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "dsa-linked-list-cycle",
    slug: "linked-list-cycle",
    title: "Linked List Cycle Detection",
    topic: "Linked Lists",
    level: "intermediate",
    statement:
      "Given `head`, the head of a linked list, determine if the linked list has a cycle in it using O(1) memory.",
    hint: "Floyd's cycle-finding algorithm: maintain a slow pointer moving 1 step and a fast pointer moving 2 steps. If they meet, a cycle exists.",
    pattern: "Floyd's Tortoise and Hare",
    order_index: 6,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "dsa-merge-intervals",
    slug: "merge-intervals",
    title: "Merge Overlapping Intervals",
    topic: "Intervals & Sorting",
    level: "intermediate",
    statement:
      "Given an array of `intervals` where intervals[i] = [start_i, end_i], merge all overlapping intervals, and return an array of the non-overlapping intervals.",
    hint: "Sort intervals by start time. Iterate through sorted intervals; if the current interval starts before the previous one ends, merge them.",
    pattern: "Sort & Sweep Line",
    order_index: 7,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "dsa-bfs-grid",
    slug: "bfs-grid",
    title: "Shortest Path in Binary Matrix",
    topic: "Graphs & BFS",
    level: "intermediate",
    statement:
      "Given an n x n binary matrix `grid`, return the length of the shortest clear path from top-left (0,0) to bottom-right (n-1,n-1). Path can move in 8 directions.",
    hint: "Standard Breadth-First Search (BFS) using a queue guarantees shortest path in an unweighted grid. Track visited cells immediately when enqueued.",
    pattern: "Breadth-First Search (Queue)",
    order_index: 8,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "dsa-lru-cache",
    slug: "lru-cache",
    title: "LRU Cache Design",
    topic: "System Design & Data Structures",
    level: "advanced",
    statement:
      "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) `get` and `put` operations.",
    hint: "Combine a Hash Map (for O(1) key-to-node lookup) with a Doubly Linked List (for O(1) insertion at head and eviction from tail).",
    pattern: "Hash Map + Doubly Linked List",
    order_index: 9,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "dsa-trapping-rain-water",
    slug: "trapping-rain-water",
    title: "Trapping Rain Water",
    topic: "Two Pointers & Arrays",
    level: "advanced",
    statement:
      "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    hint: "Water trapped at index i is bounded by min(max_left, max_right) - height[i]. Use two pointers moving inward.",
    pattern: "Two Pointers Inward Scan",
    order_index: 10,
    created_at: "2026-01-01T00:00:00Z",
  },
];

export const DEFAULT_DAILY_TASKS: DailyTask[] = [
  {
    id: "task-daily-dsa",
    slug: "daily-dsa",
    title: "Solve 1 DSA Algorithm Challenge",
    description:
      "Strengthen pattern recognition and write clean code with optimal time complexity.",
    track: "dsa",
    xp: 35,
    est_minutes: 30,
    order_index: 1,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "task-daily-lesson",
    slug: "daily-lesson",
    title: "Complete 1 Course Lesson",
    description: "Advance your core engineering or programming fundamentals curriculum.",
    track: "core",
    xp: 25,
    est_minutes: 20,
    order_index: 2,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "task-daily-terminal",
    slug: "daily-terminal",
    title: "15 Minutes Linux Terminal & Bash Drill",
    description: "Practice file navigation, piping, grep, chmod, and process diagnosis commands.",
    track: "linux",
    xp: 20,
    est_minutes: 15,
    order_index: 3,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "task-daily-code",
    slug: "daily-code",
    title: "Ship 1 Project Commit or Code Lab Snippet",
    description:
      "Write code, verify in Code Lab, and commit real progress to your project repository.",
    track: "programming",
    xp: 30,
    est_minutes: 35,
    order_index: 4,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "task-daily-comm",
    slug: "daily-comm",
    title: "Daily Speaking or 5 Technical Vocabulary Drill",
    description:
      "Record 2 minutes explaining a technical architecture concept or learn 5 industry words.",
    track: "career",
    xp: 15,
    est_minutes: 10,
    order_index: 5,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "task-daily-resume",
    slug: "daily-resume",
    title: "Improve 1 Resume Bullet with Action Verbs",
    description: "Quantify an achievement with numbers, metrics, or specific tech stack tools.",
    track: "career",
    xp: 20,
    est_minutes: 10,
    order_index: 6,
    created_at: "2026-01-01T00:00:00Z",
  },
];

export const DEFAULT_ROADMAPS: Array<Roadmap & { steps: RoadmapStep[] }> = [
  {
    id: "roadmap-software-engineer",
    slug: "software-engineer",
    title: "Software Engineer / SDE Track",
    description:
      "A staged path from foundational programming to full-stack architecture, algorithms, and interview mastery.",
    branch_slug: "cse",
    order_index: 1,
    created_at: "2026-01-01T00:00:00Z",
    steps: [
      {
        id: "s1",
        roadmap_id: "roadmap-software-engineer",
        title: "1. Master a Core Language (Python / C++ / Java)",
        description: "Syntax, data structures, memory models, and standard libraries.",
        course_slug: "python-essentials",
        order_index: 1,
      },
      {
        id: "s2",
        roadmap_id: "roadmap-software-engineer",
        title: "2. Linux Command Line & Git Version Control",
        description: "Terminal fluency, branching, pull requests, and automation.",
        course_slug: "linux-basics",
        order_index: 2,
      },
      {
        id: "s3",
        roadmap_id: "roadmap-software-engineer",
        title: "3. Data Structures & Algorithm Patterns",
        description:
          "Solve 100+ high-yield problems across arrays, trees, graphs, and dynamic programming.",
        course_slug: "dsa-foundations",
        order_index: 3,
      },
      {
        id: "s4",
        roadmap_id: "roadmap-software-engineer",
        title: "4. Database Design & SQL Querying",
        description: "Relational modeling, indexing, ACID transactions, and query plans.",
        course_slug: "dbms-sql",
        order_index: 4,
      },
      {
        id: "s5",
        roadmap_id: "roadmap-software-engineer",
        title: "5. Build 2 Production-Grade Projects",
        description: "Full-stack apps with authentication, automated tests, and CI/CD deployment.",
        course_slug: null,
        order_index: 5,
      },
      {
        id: "s6",
        roadmap_id: "roadmap-software-engineer",
        title: "6. ATS Resume, Portfolio & Mock Interviews",
        description: "STAR method preparation, portfolio URL, and targeted job applications.",
        course_slug: "career-readiness",
        order_index: 6,
      },
    ],
  },
  {
    id: "roadmap-ai-data-scientist",
    slug: "ai-data-scientist",
    title: "AI & Machine Learning Engineer",
    description:
      "Mathematics, Python scientific stack, neural networks, LLMs, and deploying AI models.",
    branch_slug: "aids",
    order_index: 2,
    created_at: "2026-01-01T00:00:00Z",
    steps: [
      {
        id: "ai-s1",
        roadmap_id: "roadmap-ai-data-scientist",
        title: "1. Linear Algebra, Calculus & Statistics",
        description: "Vectors, matrix operations, derivatives, probability distributions.",
        course_slug: "engineering-math",
        order_index: 1,
      },
      {
        id: "ai-s2",
        roadmap_id: "roadmap-ai-data-scientist",
        title: "2. Python for Data (NumPy, Pandas, Matplotlib)",
        description: "Data wrangling, exploratory data analysis, and visualization.",
        course_slug: "python-essentials",
        order_index: 2,
      },
      {
        id: "ai-s3",
        roadmap_id: "roadmap-ai-data-scientist",
        title: "3. Classical Machine Learning Algorithms",
        description: "Linear/logistic regression, decision trees, random forests, clustering.",
        course_slug: null,
        order_index: 3,
      },
      {
        id: "ai-s4",
        roadmap_id: "roadmap-ai-data-scientist",
        title: "4. Deep Learning & Computer Vision / NLP",
        description: "PyTorch, backpropagation, CNNs, Transformers, and embeddings.",
        course_slug: null,
        order_index: 4,
      },
      {
        id: "ai-s5",
        roadmap_id: "roadmap-ai-data-scientist",
        title: "5. GenAI, Prompt Engineering & AI Agents",
        description: "Gemini API, RAG architectures, vector databases, and evaluation.",
        course_slug: null,
        order_index: 5,
      },
    ],
  },
  {
    id: "roadmap-devops-cloud",
    slug: "devops-cloud",
    title: "Cloud & DevOps Engineer",
    description:
      "Linux systems, Docker containerization, Kubernetes orchestration, CI/CD, and Terraform.",
    branch_slug: "cse",
    order_index: 3,
    created_at: "2026-01-01T00:00:00Z",
    steps: [
      {
        id: "dev-s1",
        roadmap_id: "roadmap-devops-cloud",
        title: "1. Advanced Linux & Shell Automation",
        description: "Systemd, networking, bash scripting, cron, and kernel logs.",
        course_slug: "linux-basics",
        order_index: 1,
      },
      {
        id: "dev-s2",
        roadmap_id: "roadmap-devops-cloud",
        title: "2. Git Workflows & GitHub Actions CI/CD",
        description: "Automated testing, build pipelines, and release management.",
        course_slug: "linux-shell",
        order_index: 2,
      },
      {
        id: "dev-s3",
        roadmap_id: "roadmap-devops-cloud",
        title: "3. Docker & Container Internals",
        description: "Namespaces, cgroups, multi-stage builds, and Docker Compose.",
        course_slug: null,
        order_index: 3,
      },
      {
        id: "dev-s4",
        roadmap_id: "roadmap-devops-cloud",
        title: "4. Cloud Architecture (GCP / AWS)",
        description: "Compute instances, VPC networks, IAM security, and serverless.",
        course_slug: null,
        order_index: 4,
      },
      {
        id: "dev-s5",
        roadmap_id: "roadmap-devops-cloud",
        title: "5. Kubernetes & Infrastructure as Code (Terraform)",
        description: "Pods, services, ingress, Helm charts, and declarative infra.",
        course_slug: null,
        order_index: 5,
      },
    ],
  },
  {
    id: "roadmap-cybersecurity",
    slug: "cybersecurity",
    title: "Cybersecurity & Security Operations (SOC)",
    description:
      "Network forensics, cryptography, Linux hardening, web application security, and incident response.",
    branch_slug: "cyber",
    order_index: 4,
    created_at: "2026-01-01T00:00:00Z",
    steps: [
      {
        id: "sec-s1",
        roadmap_id: "roadmap-cybersecurity",
        title: "1. Computer Networks & Packet Inspection",
        description: "Wireshark, TCP handshakes, DNS, TLS, firewalls, and ports.",
        course_slug: "computer-networks",
        order_index: 1,
      },
      {
        id: "sec-s2",
        roadmap_id: "roadmap-cybersecurity",
        title: "2. Linux Administration & System Hardening",
        description: "Permissions, iptables, SSH hardening, and log inspection.",
        course_slug: "linux-basics",
        order_index: 2,
      },
      {
        id: "sec-s3",
        roadmap_id: "roadmap-cybersecurity",
        title: "3. Cryptography & Authentication Protocols",
        description: "Symmetric vs asymmetric ciphers, hashing, JWT, OAuth2, and PKI.",
        course_slug: null,
        order_index: 3,
      },
      {
        id: "sec-s4",
        roadmap_id: "roadmap-cybersecurity",
        title: "4. OWASP Top 10 Web Vulnerabilities",
        description: "SQL injection, XSS, CSRF, SSRF, IDOR, and secure code practices.",
        course_slug: null,
        order_index: 4,
      },
      {
        id: "sec-s5",
        roadmap_id: "roadmap-cybersecurity",
        title: "5. SOC Analysis & Incident Response",
        description: "SIEM log analysis, threat intelligence, and digital forensics.",
        course_slug: null,
        order_index: 5,
      },
    ],
  },
];

export const DEFAULT_CODE_CHALLENGES: CodeChallenge[] = [
  {
    id: "cc-fizzbuzz",
    slug: "fizzbuzz",
    title: "FizzBuzz Multiples",
    summary:
      "Return 'Fizz' for multiples of 3, 'Buzz' for multiples of 5, 'FizzBuzz' for both, or the number.",
    level: "beginner",
    language: "python",
    starter_code: `def fizz_buzz(n: int) -> list[str]:
    result = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
        else:
            result.append(str(i))
    return result

# Test run
print(fizz_buzz(15))`,
    solution_code: `def fizz_buzz(n: int) -> list[str]:
    return ["FizzBuzz" if i % 15 == 0 else "Fizz" if i % 3 == 0 else "Buzz" if i % 5 == 0 else str(i) for i in range(1, n + 1)]

print(fizz_buzz(15))`,
    order_index: 1,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "cc-palindrome",
    slug: "is-palindrome",
    title: "Valid Palindrome Cleaner",
    summary:
      "Verify if a string reads the same forwards and backwards after removing non-alphanumeric characters.",
    level: "beginner",
    language: "javascript",
    starter_code: `function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0;
  let right = clean.length - 1;
  while (left < right) {
    if (clean[left] !== clean[right]) return false;
    left++;
    right--;
  }
  return true;
}

console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
console.log(isPalindrome("race a car")); // false`,
    solution_code: `function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === clean.split('').reverse().join('');
}`,
    order_index: 2,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "cc-fibonacci",
    slug: "fibonacci-memo",
    title: "Fibonacci with Dynamic Programming",
    summary:
      "Compute the nth Fibonacci number in O(n) time using memoization or bottom-up tabulation.",
    level: "intermediate",
    language: "python",
    starter_code: `def fib(n: int) -> int:
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

print("Fib(10) =", fib(10)) # 55`,
    solution_code: `def fib(n: int) -> int:
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a`,
    order_index: 3,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "cc-quicksort",
    slug: "quicksort-cpp",
    title: "QuickSort Implementation in C++",
    summary: "Partition an array around a pivot and sort in O(n log n) expected time.",
    level: "intermediate",
    language: "cpp",
    starter_code: `#include <iostream>
#include <vector>

int partition(std::vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            std::swap(arr[i], arr[j]);
        }
    }
    std::swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(std::vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

int main() {
    std::vector<int> nums = {64, 34, 25, 12, 22, 11, 90};
    quickSort(nums, 0, nums.size() - 1);
    for (int n : nums) std::cout << n << " ";
    std::cout << std::endl;
    return 0;
}`,
    solution_code: `// Verified standard Lomuto partition QuickSort`,
    order_index: 4,
    created_at: "2026-01-01T00:00:00Z",
  },
];

export const DEFAULT_PROJECT_IDEAS: Array<{
  id: string;
  slug: string;
  title: string;
  summary: string;
  domain: string;
  level: "beginner" | "intermediate" | "advanced";
  skills: string[];
  suggested_milestones: string[];
  order_index: number;
  created_at: string;
}> = [
  {
    id: "idea-log-sentinel",
    slug: "log-sentinel",
    title: "Server Access Log Analyzer & Rate-Limit Anomaly Sentinel",
    summary:
      "Ingest streaming server logs, detect DDoS/brute-force bursts with sliding window counters, and trigger webhook alerts.",
    domain: "Software / DevOps",
    level: "intermediate",
    skills: ["Python", "FastAPI", "SQLite", "Regex", "Docker"],
    suggested_milestones: [
      "1. Implement regex parser for standard Common Log Format (Nginx/Apache)",
      "2. Create rolling time window frequency aggregator for client IPs",
      "3. Trigger JSON alert payload when threshold exceeded (>100 req/min)",
      "4. Containerize service with Dockerfile and write integration tests",
    ],
    order_index: 1,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "idea-task-queue",
    slug: "task-queue",
    title: "Distributed Fault-Tolerant Job Queue",
    summary:
      "Producer-consumer async task queue with exponential backoff retries, heartbeat health checks, and dead-letter queue.",
    domain: "Systems / Backend",
    level: "advanced",
    skills: ["TypeScript / Go", "Redis", "Concurrency", "WebSockets"],
    suggested_milestones: [
      "1. Define job contract and state machine (queued, running, done, dead)",
      "2. Implement worker pool with concurrency limit and heartbeat ping",
      "3. Add exponential backoff retry mechanism for network drops",
      "4. Build minimal web monitoring dashboard showing queue throughput",
    ],
    order_index: 2,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "idea-rag-mentor",
    slug: "rag-mentor",
    title: "Domain Knowledge RAG Assistant with Vector Search",
    summary:
      "Index course textbooks or syllabus PDFs using embeddings and provide cited technical answers with Gemini API.",
    domain: "AI / Machine Learning",
    level: "intermediate",
    skills: ["Python", "Gemini API", "ChromaDB", "LangChain / Native"],
    suggested_milestones: [
      "1. Extract text and chunk documents into 500-token semantically bounded segments",
      "2. Generate text embeddings and store in local vector index",
      "3. Perform cosine similarity top-k search on user queries",
      "4. Synthesize answer with citations using Gemini 3.8 Flash",
    ],
    order_index: 3,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "idea-cve-scanner",
    slug: "cve-scanner",
    title: "Network Vulnerability & Port Scanner",
    summary:
      "Multi-threaded socket auditor discovering open services and matching versions against known CVE vulnerabilities.",
    domain: "Cybersecurity",
    level: "advanced",
    skills: ["Python / C++", "Sockets", "NVD Database", "Linux"],
    suggested_milestones: [
      "1. Construct multi-threaded TCP SYN / connect scanner with configurable timeouts",
      "2. Implement service banner grabbing for SSH, HTTP, FTP, and SMTP",
      "3. Query local CVE vulnerability database for outdated software versions",
      "4. Export professional executive audit report in PDF / Markdown",
    ],
    order_index: 4,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "idea-embedded-iot",
    slug: "embedded-iot",
    title: "Industrial Telemetry & Environmental Sentinel Node",
    summary:
      "Microcontroller telemetry station transmitting vibration, temperature, and current metrics over MQTT to a live dashboard.",
    domain: "IoT / Embedded",
    level: "intermediate",
    skills: ["C++ / Arduino", "MQTT", "Sensors", "Grafana / React"],
    suggested_milestones: [
      "1. Interface sensors (I2C / SPI) and sample ADC metrics every 100ms",
      "2. Publish structured telemetry packets over MQTT broker",
      "3. Create alert engine when temperature/vibration thresholds are exceeded",
      "4. Document power consumption profile and circuit schematic",
    ],
    order_index: 5,
    created_at: "2026-01-01T00:00:00Z",
  },
];
