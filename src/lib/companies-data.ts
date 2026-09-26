export interface CompanyRound {
  title: string;
  duration: string;
  focus: string;
  tips: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  slug: string;
  category: "Tier-1 Product" | "Enterprise Tech" | "Core Engineering" | "IT Services";
  tierBadge: string;
  logoInitial: string;
  overview: string;
  hiringCriteria: string;
  rounds: CompanyRound[];
  coreTopics: string[];
  frequentQuestions: string[];
  resumeKeywords: string[];
  suggestedProjects: string[];
}

export const COMPANY_PROFILES: CompanyProfile[] = [
  {
    id: "comp-google",
    name: "Google",
    slug: "google",
    category: "Tier-1 Product",
    tierBadge: "FAANG / Big Tech",
    logoInitial: "G",
    overview:
      "Focuses on deep algorithmic problem solving, clean code, scalability thinking, and Googleyness (intellectual humility, collaboration, and bias to action).",
    hiringCriteria:
      "Strong DSA, Big-O edge case mastery, concurrency, clean idiomatic coding, system design.",
    rounds: [
      {
        title: "Round 1: Online Assessment / Screen",
        duration: "45-60 mins",
        focus:
          "2 medium/hard algorithmic problems on platforms like Google hiring portal or HackerEarth.",
        tips: "Prioritize clean code, handle edge cases (empty inputs, integer overflow, duplicates) before pressing run.",
      },
      {
        title: "Round 2 & 3: Technical Coding Rounds",
        duration: "45 mins each",
        focus:
          "Graphs (BFS/DFS, Dijkstra, Topological Sort), Dynamic Programming, Trees, Sliding Window.",
        tips: "Think out loud continuously. Clarify constraints first. State brute force, then optimize to target Big-O.",
      },
      {
        title: "Round 4: Systems / Object Design or Advanced Algo",
        duration: "45 mins",
        focus:
          "For new grads: API design, data structure design (LRU cache, Trie). For experienced: Distributed design.",
        tips: "Discuss trade-offs: latency vs throughput, consistency vs availability.",
      },
      {
        title: "Round 5: Googleyness & Leadership",
        duration: "45 mins",
        focus: "Navigating ambiguity, constructive disagreement, mentoring peers, and ethics.",
        tips: "Use the STAR method (Situation, Task, Action, Result) with honest introspection.",
      },
    ],
    coreTopics: [
      "Graphs & Trees",
      "Dynamic Programming",
      "Sliding Window",
      "Tries & Heaps",
      "Concurrency",
    ],
    frequentQuestions: [
      "Word Ladder II (Shortest transformation sequence via BFS)",
      "Trapping Rain Water (Two pointers / Stack)",
      "Design In-Memory File System with Trie",
      "Course Schedule / Topological Sorting with Cycle Detection",
      "Serialize and Deserialize Binary Tree",
    ],
    resumeKeywords: [
      "Distributed Systems",
      "Algorithms",
      "C++20",
      "Go",
      "Kubernetes",
      "gRPC",
      "Low Latency",
    ],
    suggestedProjects: [
      "Distributed key-value store with Raft consensus",
      "Custom compiler or bytecode interpreter with AST",
    ],
  },

  {
    id: "comp-microsoft",
    name: "Microsoft",
    slug: "microsoft",
    category: "Tier-1 Product",
    tierBadge: "FAANG / Big Tech",
    logoInitial: "M",
    overview:
      "Emphasizes Growth Mindset, customer obsession, solid systems fundamentals, object-oriented design, and reliable software engineering.",
    hiringCriteria:
      "Solid OOP, balanced trees, linked lists, string manipulation, system design, and cultural alignment.",
    rounds: [
      {
        title: "Round 1: Codility Online Assessment",
        duration: "60-90 mins",
        focus: "2 to 3 coding problems testing arrays, strings, and mathematical logic.",
        tips: "100% test case correctness matters. Pay special attention to O(n) and O(n log n) constraints.",
      },
      {
        title: "Round 2 & 3: Technical Problem Solving",
        duration: "45-60 mins",
        focus:
          "Data structures (Binary Trees, BST, Linked Lists, Matrix traversal) and OOP design.",
        tips: "Demonstrate modular code with well-named variables and helper functions.",
      },
      {
        title: "Round 4: As-Appropriate (AA / Hiring Manager)",
        duration: "45-60 mins",
        focus: "System architecture, behavioral culture, and past project deep-dive.",
        tips: "Be prepared to explain every single technical decision in your resume projects down to the database schema.",
      },
    ],
    coreTopics: [
      "Binary Search Trees",
      "Linked Lists",
      "OOP Design Principles",
      "Dynamic Programming",
      "Strings",
    ],
    frequentQuestions: [
      "Reverse Nodes in k-Group",
      "Lowest Common Ancestor in Binary Tree",
      "LRU Cache implementation with Doubly Linked List + Hash Map",
      "Spiral Matrix traversal",
      "Design an elevator system or parking lot using OOP",
    ],
    resumeKeywords: ["Azure", "TypeScript", "C#", ".NET", "React", "CI/CD", "Design Patterns"],
    suggestedProjects: [
      "Real-time collaborative document editor with WebSockets and CRDTs",
      "Enterprise task management dashboard with RBAC and Azure Cloud integration",
    ],
  },

  {
    id: "comp-amazon",
    name: "Amazon",
    slug: "amazon",
    category: "Tier-1 Product",
    tierBadge: "FAANG / Big Tech",
    logoInitial: "A",
    overview:
      "Driven strictly by 16 Leadership Principles (Customer Obsession, Ownership, Bias for Action, Dive Deep). Every interview round evaluates both coding and Leadership Principles.",
    hiringCriteria:
      "50% Technical DSA + 50% Leadership Principles (STAR stories required for every round).",
    rounds: [
      {
        title: "Round 1: Online Assessment (OA)",
        duration: "90 mins",
        focus: "2 coding questions on HackerRank + Amazon Work Style behavioral simulation.",
        tips: "Answer the work-style assessment strictly aligned with Amazon Leadership Principles.",
      },
      {
        title: "Rounds 2-4: Onsite / Loop Interviews",
        duration: "60 mins each",
        focus:
          "First 20 mins: 2 Leadership Principle behavioral questions. Next 35 mins: Coding. Final 5 mins: Questions.",
        tips: "Prepare at least 6 distinct STAR stories covering customer impact, failure/ownership, and pushing back with data.",
      },
      {
        title: "Bar Raiser Round",
        duration: "60 mins",
        focus:
          "Independent interviewer assessing if candidate raises the median talent bar of the company.",
        tips: "Maintain enthusiasm, demonstrate high standards, and explain the 'why' behind architectural choices.",
      },
    ],
    coreTopics: [
      "BFS / DFS",
      "Priority Queue / Heap",
      "Hash Maps & Two Pointers",
      "OOP Design",
      "Leadership Principles",
    ],
    frequentQuestions: [
      "Number of Islands (BFS/DFS grid traversal)",
      "Top K Frequent Elements (Min-Heap / QuickSelect)",
      "Reorganize String (Greedy with Priority Queue)",
      "Merge Intervals",
      "Design a Shopping Cart checkout system with inventory lock",
    ],
    resumeKeywords: ["AWS", "Microservices", "Scalability", "Event-Driven", "Docker", "DynamoDB"],
    suggestedProjects: [
      "Event-driven e-commerce microservices with Kafka / Redis and Stripe webhook integration",
      "Distributed cache node with consistent hashing and TTL invalidation",
    ],
  },

  {
    id: "comp-nvidia",
    name: "NVIDIA",
    slug: "nvidia",
    category: "Core Engineering",
    tierBadge: "Hardware & AI Infrastructure",
    logoInitial: "N",
    overview:
      "World leader in accelerated computing, GPUs, CUDA, and AI infrastructure. Requires deep C/C++, computer architecture, memory hierarchy, and math/parallel computing knowledge.",
    hiringCriteria:
      "C/C++, Computer Architecture, Cache Coherence, Operating Systems, CUDA/Parallelism, Linear Algebra.",
    rounds: [
      {
        title: "Round 1: Technical Screening",
        duration: "60 mins",
        focus:
          "C/C++ memory management, bitwise operations, cache lines, pointer arithmetic, and operating systems.",
        tips: "Brush up on virtual memory, memory alignment, volatile keywords, and race condition debugging.",
      },
      {
        title: "Round 2 & 3: Deep Systems & Architecture",
        duration: "60 mins each",
        focus:
          "Multithreading, mutex vs spinlock, SIMD/vectorization, memory barrier, and algorithmic optimizations.",
        tips: "Explain how cache misses impact runtime. Write assembly-friendly or cache-aligned algorithms.",
      },
      {
        title: "Round 4: Managerial & Project Architecture",
        duration: "45 mins",
        focus: "Deep dive into your low-level hardware or systems engineering projects.",
        tips: "Discuss latency bottlenecks you profiled using tools like GDB, Valgrind, or Perf.",
      },
    ],
    coreTopics: [
      "C / C++ Internals",
      "Computer Architecture",
      "Bitwise Tricks",
      "Multithreading & Concurrency",
      "Operating Systems",
    ],
    frequentQuestions: [
      "Implement a custom memory allocator (malloc/free with block header and alignment)",
      "Bit manipulation: Count set bits in O(1) or find the non-repeating number in array",
      "Explain Cache Coherence protocols (MESI) and False Sharing in multithreaded code",
      "Matrix multiplication optimization using loop tiling / blocking for L1 cache",
      "Deadlock detection and resolution in parallel thread pools",
    ],
    resumeKeywords: [
      "C++17/20",
      "CUDA",
      "SIMD",
      "Computer Architecture",
      "Linux Kernel",
      "Valgrind",
      "Multithreading",
    ],
    suggestedProjects: [
      "High-performance matrix algebra engine optimized with SIMD intrinsics and cache blocking",
      "Custom Linux kernel character device driver or memory allocator",
    ],
  },

  {
    id: "comp-tcs",
    name: "Tata Consultancy Services (TCS)",
    slug: "tcs",
    category: "IT Services",
    tierBadge: "Ninja & Digital & Prime",
    logoInitial: "T",
    overview:
      "One of the largest global IT employers with tiered hiring streams: Ninja (Foundation), Digital (Higher package for strong coders), and Prime (Top tier for advanced engineering).",
    hiringCriteria:
      "Quantitative Aptitude, Logical Reasoning, Verbal, DSA (Digital/Prime), Core CS subjects (DBMS, OS, CN).",
    rounds: [
      {
        title: "Round 1: TCS NQT (National Qualifier Test)",
        duration: "180 mins",
        focus:
          "Cognitive skills (Numerical, Verbal, Reasoning) + Advanced Coding (2 problems in C/C++/Java/Python).",
        tips: "Speed in aptitude counts heavily. Digital/Prime qualification depends on clearing both coding questions.",
      },
      {
        title: "Round 2: Technical Interview",
        duration: "30-45 mins",
        focus: "OOP concepts, DBMS normalization, SQL queries, basic DSA, project viva.",
        tips: "Be fluent in your resume project. Write clean SQL queries with JOINs and GROUP BY on paper or editor.",
      },
      {
        title: "Round 3: HR & Managerial Round",
        duration: "20-30 mins",
        focus:
          "Relocation flexibility, willingness to work in shifts, communication confidence, company knowledge.",
        tips: "Express adaptability, willingness to learn new technology stacks, and clear career aspirations.",
      },
    ],
    coreTopics: [
      "Quantitative Aptitude",
      "SQL & DBMS",
      "Object-Oriented Programming",
      "Array & String Manipulation",
      "Core CS",
    ],
    frequentQuestions: [
      "Find the second largest element in an array without sorting",
      "Write a SQL query to find the Nth highest salary in an employee table",
      "Explain the 4 pillars of OOP with real-world examples (Car / Animal)",
      "Difference between Primary Key, Unique Key, and Foreign Key in DBMS",
      "Reverse words in a given string without using split() library function",
    ],
    resumeKeywords: [
      "Java",
      "Python",
      "SQL",
      "Spring Boot",
      "Git",
      "Problem Solving",
      "Web Development",
    ],
    suggestedProjects: [
      "Hospital management portal with role-based access and database schema",
      "Student academic grade tracking application with REST APIs",
    ],
  },
];
