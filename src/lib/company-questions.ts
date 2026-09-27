export interface CompanyQuestion {
  id: string;
  company:
    "Google" | "Amazon" | "Microsoft" | "TCS" | "Infosys" | "Atlassian" | "Flipkart" | "Startups";
  role: "SDE" | "Backend" | "Frontend" | "Embedded" | "Core Systems";
  topic:
    | "Data Structures & Algos"
    | "System Design"
    | "Operating Systems"
    | "Computer Networks"
    | "DBMS"
    | "Behavioral";
  difficulty: "Easy" | "Medium" | "Hard";
  question: string;
  interviewerContext: string;
  expectedKeywords: string[];
  keyTalkingPoints: string[];
  frequency: "Top 10 Must-Do" | "Frequent" | "Standard";
}

export const COMPANY_QUESTION_BANK: CompanyQuestion[] = [
  {
    id: "goog-1",
    company: "Google",
    role: "SDE",
    topic: "Data Structures & Algos",
    difficulty: "Hard",
    question: "Design an autocomplete system for Google Search handling 100M queries per second.",
    interviewerContext:
      "Tests high-throughput Trie design, frequency serialization, and distributed top-k caching.",
    expectedKeywords: [
      "Trie",
      "Frequency Heap",
      "Inverted Index",
      "Sharding by Prefix",
      "Read-Heavy Cache",
      "Bloom Filter",
    ],
    keyTalkingPoints: [
      "Store prefix tree nodes with pre-computed top 5 queries to turn O(length + matches) into O(length).",
      "Sharded across multiple machines based on hash of the prefix (e.g. 2-3 characters).",
      "Write paths update frequencies asynchronously via Kafka/batch log aggregation.",
    ],
    frequency: "Top 10 Must-Do",
  },
  {
    id: "amzn-1",
    company: "Amazon",
    role: "Backend",
    topic: "Behavioral",
    difficulty: "Medium",
    question:
      "Tell me about a time you had to make an important engineering decision with incomplete data (Bias for Action).",
    interviewerContext:
      "Assessing Amazon Leadership Principle 'Bias for Action' vs 'Frugality' and calculated risk taking.",
    expectedKeywords: [
      "Situation-Task-Action-Result",
      "Two-way Door Decision",
      "Telemetry / Logging",
      "Mitigation Strategy",
      "Rollback Plan",
    ],
    keyTalkingPoints: [
      "Distinguish between irreversible (one-way door) and reversible (two-way door) decisions.",
      "Explain how you gathered minimal viable telemetry to validate assumptions.",
      "Show how you prepared a rollback switch or feature flag in case metrics degraded.",
    ],
    frequency: "Top 10 Must-Do",
  },
  {
    id: "msft-1",
    company: "Microsoft",
    role: "SDE",
    topic: "Operating Systems",
    difficulty: "Medium",
    question:
      "What is the exact distinction between a Process and a Thread? How does context switching overhead differ between them?",
    interviewerContext:
      "Evaluating fundamentals of OS memory layouts, virtual memory mapping, and CPU register caches.",
    expectedKeywords: [
      "Virtual Address Space",
      "PCB vs TCB",
      "TLB Flush",
      "Stack vs Heap Sharing",
      "User-space vs Kernel Threads",
    ],
    keyTalkingPoints: [
      "Processes have independent virtual address spaces; context switch requires flushing the Translation Lookaside Buffer (TLB).",
      "Threads within the same process share heap, code, and global data, having separate program counters and stacks.",
      "Thread context switch preserves CPU cache lines and avoids costly page directory base register reloads.",
    ],
    frequency: "Top 10 Must-Do",
  },
  {
    id: "atls-1",
    company: "Atlassian",
    role: "Fullstack",
    topic: "System Design",
    difficulty: "Medium",
    question:
      "How would you design a real-time collaborative document editor like Confluence or Google Docs?",
    interviewerContext:
      "Tests understanding of concurrent editing conflict resolution: Operational Transformation (OT) vs CRDTs.",
    expectedKeywords: [
      "CRDT",
      "Operational Transformation",
      "WebSockets",
      "Vector Clocks",
      "State Rehydration",
      "Eventual Consistency",
    ],
    keyTalkingPoints: [
      "Explain conflict-free replicated data types (CRDTs) where operations commute and merge deterministically without central locking.",
      "Handle offline disconnection and re-sync via Lamport timestamps / vector clocks.",
      "Keep local optimistic UI updates instant while syncing delta diffs over persistent WebSockets.",
    ],
    frequency: "Frequent",
  },
  {
    id: "tcs-1",
    company: "TCS",
    role: "SDE",
    topic: "DBMS",
    difficulty: "Easy",
    question:
      "Explain ACID properties in relational databases with a real banking transfer scenario.",
    interviewerContext:
      "Core technical screening question across service and tier-1 campus drives.",
    expectedKeywords: [
      "Atomicity",
      "Consistency",
      "Isolation",
      "Durability",
      "WAL",
      "Transaction Commit / Rollback",
    ],
    keyTalkingPoints: [
      "Atomicity: Debit and credit must both happen or neither happens.",
      "Consistency: Total sum of funds remains constant before and after.",
      "Isolation: Concurrent balance queries do not read uncommitted intermediate states.",
      "Durability: Once committed, write-ahead logs (WAL) ensure data survives system crash.",
    ],
    frequency: "Top 10 Must-Do",
  },
  {
    id: "infy-1",
    company: "Infosys",
    role: "SDE",
    topic: "Data Structures & Algos",
    difficulty: "Easy",
    question:
      "How do you detect a cycle in a singly linked list without modifying the list nodes or using extra memory?",
    interviewerContext:
      "Tests pointer manipulation discipline and Floyd's Tortoise & Hare algorithm.",
    expectedKeywords: [
      "Floyd's Algorithm",
      "Two Pointers",
      "Slow & Fast",
      "O(1) Auxiliary Space",
      "Mathematical Proof",
    ],
    keyTalkingPoints: [
      "Initialize slow and fast pointers at head. Move slow by 1 step, fast by 2 steps.",
      "If fast reaches null, no cycle exists; if slow and fast meet, a cycle is guaranteed.",
      "Distance analysis proves meeting occurs in at most N steps.",
    ],
    frequency: "Top 10 Must-Do",
  },
  {
    id: "flpk-1",
    company: "Flipkart",
    role: "Backend",
    topic: "System Design",
    difficulty: "Hard",
    question:
      "How do you architect an inventory reservation system during a Big Billion Days flash sale with 50,000 items and 2 million concurrent buyers?",
    interviewerContext:
      "Evaluates atomic inventory decrement, optimistic concurrency control, and distributed lock degradation.",
    expectedKeywords: [
      "Redis Lua Scripts",
      "Atomic Decrement (DECR)",
      "Pessimistic vs Optimistic Locking",
      "Idempotency",
      "Database Connection Bottleneck",
    ],
    keyTalkingPoints: [
      "Keep live inventory in in-memory Redis cluster; execute atomic Lua scripts to verify stock and decrement in 1 roundtrip.",
      "Never lock relational database rows during peak checkout; write confirmed cart reservations asynchronously via message queues.",
      "Hold temporary 10-minute cart reservation with automated TTL expiration return.",
    ],
    frequency: "Frequent",
  },
  {
    id: "start-1",
    company: "Startups",
    role: "Fullstack",
    topic: "System Design",
    difficulty: "Medium",
    question:
      "Your Node.js/Go backend CPU spikes to 100% in production. Walk me through your first 15 minutes of live triage.",
    interviewerContext: "Real-world debugging maturity vs theoretical trivia.",
    expectedKeywords: [
      "htop / top",
      "CPU Profiling (pprof)",
      "Event Loop Blockers",
      "Garbage Collection Stalls",
      "APM Tracing",
      "Healthcheck Bypass",
    ],
    keyTalkingPoints: [
      "Check server metrics: Is it CPU, RAM, or disk I/O bound? Is single core at 100% (event loop blockage) or all cores?",
      "Temporarily take node out of load balancer rotation to isolate traffic while capturing stack trace / CPU profile.",
      "Inspect recent deployments, database connection pool exhaustion, or unindexed slow queries.",
    ],
    frequency: "Frequent",
  },
];

const BOOKMARKS_KEY = "engineeros_interview_bookmarks";
const REMINDERS_KEY = "engineeros_interview_reminders";

export function getBookmarkedQuestionIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleQuestionBookmark(questionId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getBookmarkedQuestionIds();
    const next = current.includes(questionId)
      ? current.filter((id) => id !== questionId)
      : [...current, questionId];
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
    return next.includes(questionId);
  } catch {
    return false;
  }
}

export function getRevisionReminders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setRevisionReminder(questionId: string, targetDate: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getRevisionReminders();
    current[questionId] = targetDate;
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}
