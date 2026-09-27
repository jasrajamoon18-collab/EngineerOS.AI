// EngineerOS Virtual Memory Manager (MMU) - Spaced Repetition reframed as RAM / Swap Paging

import { logToSyslog } from "./kernel";

export type MemoryPageState =
  "RESIDENT_RAM" | "DIRTY_PAGE" | "SWAPPED_TO_DISK" | "AT_RISK_OOM_KILL";

export interface SkillMemoryPage {
  id: string;
  skillName: string;
  category: "Languages" | "DSA" | "Systems" | "Databases" | "Architecture";
  state: MemoryPageState;
  retentionPercent: number; // 0 - 100
  lastAccessDate: string; // ISO string
  daysSinceLastRecall: number;
  memorySizeKB: number; // Virtual footprint (e.g. 64KB, 128KB, 256KB)
  virtualAddress: string; // Hex virtual address e.g. 0x7FFF0010
  pageFaultCount: number;
  refresherDrill: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    codeSnippet?: string;
  };
}

const MEMORY_STORAGE_KEY = "engineeros_memory_pages_v1";

export const DEFAULT_SKILL_PAGES: SkillMemoryPage[] = [
  {
    id: "mem-c-pointers",
    skillName: "Pointers & Memory Addresses",
    category: "Languages",
    state: "SWAPPED_TO_DISK",
    retentionPercent: 48,
    lastAccessDate: new Date(Date.now() - 14 * 86400000).toISOString(),
    daysSinceLastRecall: 14,
    memorySizeKB: 256,
    virtualAddress: "0x7FFF0010",
    pageFaultCount: 3,
    refresherDrill: {
      question: "What does the expression `*(ptr + 2)` evaluate to in C?",
      options: [
        "The memory address 2 bytes after ptr",
        "The value stored at index 2 of the contiguous buffer pointed to by ptr",
        "The dereferenced value of ptr incremented by 2",
        "A segmentation fault unconditionally",
      ],
      correctIndex: 1,
      explanation:
        "Pointer arithmetic in C steps by `sizeof(*ptr)` units. `*(ptr + 2)` is identical to `ptr[2]`.",
      codeSnippet:
        'int arr[4] = {10, 20, 30, 40};\nint *ptr = arr;\nprintf("%d", *(ptr + 2)); // prints 30',
    },
  },
  {
    id: "mem-dsa-two-pointers",
    skillName: "Two Pointers Technique",
    category: "DSA",
    state: "RESIDENT_RAM",
    retentionPercent: 94,
    lastAccessDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    daysSinceLastRecall: 1,
    memorySizeKB: 128,
    virtualAddress: "0x7FFF0120",
    pageFaultCount: 1,
    refresherDrill: {
      question:
        "When applying two pointers (left & right) to Two Sum on a sorted array, if sum < target, what should you do?",
      options: [
        "Decrement right pointer",
        "Increment left pointer to increase sum",
        "Reset both pointers to origin",
        "Perform binary search on the entire remaining slice",
      ],
      correctIndex: 1,
      explanation:
        "Because the array is sorted, incrementing left increases the element value, raising the candidate sum.",
    },
  },
  {
    id: "mem-linux-permissions",
    skillName: "Linux Octal File Permissions",
    category: "Systems",
    state: "RESIDENT_RAM",
    retentionPercent: 91,
    lastAccessDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    daysSinceLastRecall: 2,
    memorySizeKB: 128,
    virtualAddress: "0x7FFF0240",
    pageFaultCount: 0,
    refresherDrill: {
      question: "What permission set does octal mode `754` represent?",
      options: [
        "rwx for owner, r-x for group, r-- for others",
        "rwx for owner, rw- for group, r-x for others",
        "r-x for owner, rwx for group, --- for others",
        "Full read-write-execute for all users",
      ],
      correctIndex: 0,
      explanation: "7 = 4+2+1 (rwx), 5 = 4+0+1 (r-x), 4 = 4+0+0 (r--).",
    },
  },
  {
    id: "mem-dbms-indexing",
    skillName: "B-Tree Database Indexing",
    category: "Databases",
    state: "DIRTY_PAGE",
    retentionPercent: 72,
    lastAccessDate: new Date(Date.now() - 6 * 86400000).toISOString(),
    daysSinceLastRecall: 6,
    memorySizeKB: 256,
    virtualAddress: "0x7FFF0350",
    pageFaultCount: 2,
    refresherDrill: {
      question:
        "Why do relational databases prefer B+ Trees over standard Binary Search Trees for disk-based storage?",
      options: [
        "B+ trees guarantee O(1) in-memory lookups",
        "B+ trees have high fan-out, minimizing expensive disk block I/O operations",
        "Binary search trees cannot store string values",
        "B+ trees prevent database deadlocks automatically",
      ],
      correctIndex: 1,
      explanation:
        "A high branching factor (fan-out of 100+) means a tree of height 3-4 can index billions of rows with minimal disk block reads.",
    },
  },
  {
    id: "mem-os-concurrency",
    skillName: "Deadlock & Dining Philosophers",
    category: "Systems",
    state: "AT_RISK_OOM_KILL",
    retentionPercent: 28,
    lastAccessDate: new Date(Date.now() - 26 * 86400000).toISOString(),
    daysSinceLastRecall: 26,
    memorySizeKB: 256,
    virtualAddress: "0x7FFF0490",
    pageFaultCount: 5,
    refresherDrill: {
      question:
        "Which Coffman condition is eliminated by establishing a strict global ordering of all lock acquisitions?",
      options: ["Mutual Exclusion", "Hold and Wait", "Circular Wait", "No Preemption"],
      correctIndex: 2,
      explanation:
        "Resource hierarchy / strict ordering makes circular resource dependencies mathematically impossible.",
    },
  },
  {
    id: "mem-git-rebasing",
    skillName: "Git Interactive Rebasing & Merge",
    category: "Systems",
    state: "SWAPPED_TO_DISK",
    retentionPercent: 54,
    lastAccessDate: new Date(Date.now() - 16 * 86400000).toISOString(),
    daysSinceLastRecall: 16,
    memorySizeKB: 128,
    virtualAddress: "0x7FFF0580",
    pageFaultCount: 4,
    refresherDrill: {
      question:
        "When running `git rebase -i HEAD~3`, what does the `squash` command do to a commit?",
      options: [
        "Discards the commit diff completely",
        "Melds the commit into the previous commit and allows editing the combined commit message",
        "Splits the commit into two separate atomic commits",
        "Reverts the commit on the remote branch",
      ],
      correctIndex: 1,
      explanation:
        "Squash collapses the commit into the preceding one while prompting to combine commit messages.",
    },
  },
  {
    id: "mem-dsa-graphs-toposort",
    skillName: "Topological Sort (Kahn's Algo)",
    category: "DSA",
    state: "RESIDENT_RAM",
    retentionPercent: 88,
    lastAccessDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    daysSinceLastRecall: 3,
    memorySizeKB: 256,
    virtualAddress: "0x7FFF0670",
    pageFaultCount: 1,
    refresherDrill: {
      question:
        "Kahn's Algorithm for Topological Sort begins by initializing a queue with nodes having what property?",
      options: [
        "Out-degree of 0",
        "In-degree of 0 (no incoming dependencies)",
        "Maximum weight edge",
        "Lowest alphabetical identifier",
      ],
      correctIndex: 1,
      explanation:
        "Nodes with in-degree 0 have no prerequisites and can be processed immediately in the topological ordering.",
    },
  },
  {
    id: "mem-python-generators",
    skillName: "Python Generators & `yield`",
    category: "Languages",
    state: "DIRTY_PAGE",
    retentionPercent: 68,
    lastAccessDate: new Date(Date.now() - 8 * 86400000).toISOString(),
    daysSinceLastRecall: 8,
    memorySizeKB: 128,
    virtualAddress: "0x7FFF07C0",
    pageFaultCount: 2,
    refresherDrill: {
      question:
        "What is the primary memory advantage of a generator function over returning a standard list?",
      options: [
        "Generators are automatically multithreaded",
        "Generators yield elements lazily one-at-a-time, consuming O(1) auxiliary space",
        "Generators compile directly to machine code",
        "Generators can only store primitive integers",
      ],
      correctIndex: 1,
      explanation:
        "Generators pause execution state and yield items on-demand, allowing infinite or multi-gigabyte streams without allocating full memory.",
    },
  },
];

export function loadSkillMemoryPages(): SkillMemoryPage[] {
  if (typeof window === "undefined") return DEFAULT_SKILL_PAGES;
  try {
    const raw = localStorage.getItem(MEMORY_STORAGE_KEY);
    if (!raw) {
      saveSkillMemoryPages(DEFAULT_SKILL_PAGES);
      return DEFAULT_SKILL_PAGES;
    }
    const list: SkillMemoryPage[] = JSON.parse(raw);

    // Auto calculate retention decay based on elapsed days
    const now = Date.now();
    const updated = list.map((item) => {
      const days = Math.max(
        0,
        Math.floor((now - new Date(item.lastAccessDate).getTime()) / 86400000),
      );
      let state: MemoryPageState = "RESIDENT_RAM";
      let retention = Math.max(10, 100 - days * 3.2);

      if (days <= 3) {
        state = "RESIDENT_RAM";
      } else if (days <= 10) {
        state = "DIRTY_PAGE";
      } else if (days <= 21) {
        state = "SWAPPED_TO_DISK";
      } else {
        state = "AT_RISK_OOM_KILL";
        retention = Math.min(32, retention);
      }

      return {
        ...item,
        daysSinceLastRecall: days,
        retentionPercent: Math.round(retention),
        state,
      };
    });

    return updated;
  } catch (err) {
    console.error("[MMU] Failed to load memory pages:", err);
    return DEFAULT_SKILL_PAGES;
  }
}

export function saveSkillMemoryPages(pages: SkillMemoryPage[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(pages));
    window.dispatchEvent(new CustomEvent("engineeros:memory-updated", { detail: pages }));
  } catch (err) {
    console.error("[MMU] Failed to save memory pages:", err);
  }
}

/**
 * Proactively "Page In" a swapped skill:
 * Invoked when student passes the 5-minute refresher drill.
 * Swaps skill back into RESIDENT_RAM with 100% retention!
 */
export function pageInSkill(skillId: string): { success: boolean; skillName: string } {
  const pages = loadSkillMemoryPages();
  const target = pages.find((p) => p.id === skillId);
  if (!target) return { success: false, skillName: "" };

  const updated = pages.map((p) => {
    if (p.id === skillId) {
      return {
        ...p,
        state: "RESIDENT_RAM" as const,
        retentionPercent: 100,
        lastAccessDate: new Date().toISOString(),
        daysSinceLastRecall: 0,
        pageFaultCount: p.pageFaultCount + 1,
      };
    }
    return p;
  });

  saveSkillMemoryPages(updated);
  logToSyslog(
    "MMU",
    "OK",
    `PAGE IN: '${target.skillName}' at ${target.virtualAddress} restored to Resident RAM. Memory cache warm.`,
  );

  return { success: true, skillName: target.skillName };
}
