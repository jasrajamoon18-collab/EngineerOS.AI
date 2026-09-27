// EngineerOS Virtual Filesystem & Command Parser

export type FileSystemNodeType = "directory" | "executable" | "file" | "device" | "proc";

export interface FileSystemNode {
  path: string;
  name: string;
  type: FileSystemNodeType;
  permissions: string;
  sizeBytes: number;
  routeTarget?: string; // Target URL route if cd/opened
  description?: string;
  content?: string; // Text content if cat'd
}

export const CAREER_FILESYSTEM: Record<string, FileSystemNode> = {
  "/": {
    path: "/",
    name: "/",
    type: "directory",
    permissions: "drwxr-xr-x",
    sizeBytes: 4096,
  },
  // Fundamentals
  "/fundamentals": {
    path: "/fundamentals",
    name: "fundamentals",
    type: "directory",
    permissions: "drwxr-xr-x",
    sizeBytes: 4096,
  },
  "/fundamentals/c": {
    path: "/fundamentals/c",
    name: "c",
    type: "directory",
    permissions: "drwxr-xr-x",
    sizeBytes: 4096,
  },
  "/fundamentals/c/pointers": {
    path: "/fundamentals/c/pointers",
    name: "pointers",
    type: "executable",
    permissions: "-rwxr-xr-x",
    sizeBytes: 8192,
    routeTarget: "/programming",
    description: "C Memory Pointers, dereferencing, and address arithmetic.",
    content:
      "C Pointers: Memory addresses in hex. Usage: `int *p = &x; *p = 42;`. Run `solve pointers` to test.",
  },
  "/fundamentals/python": {
    path: "/fundamentals/python",
    name: "python",
    type: "directory",
    permissions: "drwxr-xr-x",
    sizeBytes: 4096,
  },
  "/fundamentals/python/functions": {
    path: "/fundamentals/python/functions",
    name: "functions",
    type: "executable",
    permissions: "-rwxr-xr-x",
    sizeBytes: 4096,
    routeTarget: "/programming",
    description: "Python First-Class Functions, closures, and args/kwargs.",
    content:
      "Python functions: `def compute(*args, **kwargs): return sum(args)`. High readability, first-class citizen.",
  },
  // DSA
  "/dsa": {
    path: "/dsa",
    name: "dsa",
    type: "directory",
    permissions: "drwxr-xr-x",
    sizeBytes: 4096,
  },
  "/dsa/arrays": {
    path: "/dsa/arrays",
    name: "arrays",
    type: "directory",
    permissions: "drwxr-xr-x",
    sizeBytes: 4096,
  },
  "/dsa/arrays/two-pointers": {
    path: "/dsa/arrays/two-pointers",
    name: "two-pointers",
    type: "executable",
    permissions: "-rwxr-xr-x",
    sizeBytes: 12288,
    routeTarget: "/dsa",
    description: "Two Pointers algorithmic pattern: O(N) traversal on sorted datasets.",
    content:
      "Pattern: Two Pointers (Left / Right). Best for: Two Sum, Container With Most Water, 3Sum.",
  },
  "/dsa/graphs": {
    path: "/dsa/graphs",
    name: "graphs",
    type: "directory",
    permissions: "drwxr-xr-x",
    sizeBytes: 4096,
  },
  "/dsa/graphs/toposort": {
    path: "/dsa/graphs/toposort",
    name: "toposort",
    type: "executable",
    permissions: "-rwxr-xr-x",
    sizeBytes: 16384,
    routeTarget: "/dsa",
    description: "Topological Sort (Kahn's Algorithm & DFS). Dependency graph resolution.",
    content:
      "Kahn's Algo: 1. Calculate in-degrees 2. Push 0-indegree to queue 3. Pop, append, decrement neighbors.",
  },
  // Systems & Linux
  "/systems": {
    path: "/systems",
    name: "systems",
    type: "directory",
    permissions: "drwxr-xr-x",
    sizeBytes: 4096,
  },
  "/systems/linux": {
    path: "/systems/linux",
    name: "linux",
    type: "directory",
    permissions: "drwxr-xr-x",
    sizeBytes: 4096,
  },
  "/systems/linux/permissions": {
    path: "/systems/linux/permissions",
    name: "permissions",
    type: "executable",
    permissions: "-rwxr-xr-x",
    sizeBytes: 4096,
    routeTarget: "/linux",
    description: "Linux POSIX permissions: chmod, chown, octal notation (755, 644).",
    content:
      "Octal permissions: 400 (read), 200 (write), 100 (exec). `chmod 755 script.sh` makes it executable.",
  },
  "/systems/os": {
    path: "/systems/os",
    name: "os",
    type: "directory",
    permissions: "drwxr-xr-x",
    sizeBytes: 4096,
  },
  "/systems/os/memory-paging": {
    path: "/systems/os/memory-paging",
    name: "memory-paging",
    type: "executable",
    permissions: "-rwxr-xr-x",
    sizeBytes: 8192,
    routeTarget: "/dashboard",
    description: "Virtual Memory MMU, page tables, swap space, and TLB.",
    content:
      "Memory Management: Page table maps virtual addresses to physical frames. Page fault swaps from disk.",
  },
  // Career
  "/career": {
    path: "/career",
    name: "career",
    type: "directory",
    permissions: "drwxr-xr-x",
    sizeBytes: 4096,
  },
  "/career/resume": {
    path: "/career/resume",
    name: "resume",
    type: "file",
    permissions: "-rw-r--r--",
    sizeBytes: 2048,
    routeTarget: "/resume",
    description: "ATS-optimized student resume with branch-tailored keywords.",
    content:
      "EngineerOS Resume Engine: 12 templates, ATS keyword density analyzer, quantifiable metric validator.",
  },
  "/career/interviews": {
    path: "/career/interviews",
    name: "interviews",
    type: "executable",
    permissions: "-rwxr-xr-x",
    sizeBytes: 4096,
    routeTarget: "/interview",
    description: "AI Mock Interview simulator with speech recognition & rubric evaluation.",
    content:
      "Interview Academy: Role-specific technical & behavioral question banks with real-time feedback.",
  },
  "/career/portfolio": {
    path: "/career/portfolio",
    name: "portfolio",
    type: "file",
    permissions: "-rw-r--r--",
    sizeBytes: 4096,
    routeTarget: "/portfolio",
    description: "Public engineering portfolio with live project demos.",
  },
  "/career/proof-wall": {
    path: "/career/proof-wall",
    name: "proof-wall",
    type: "file",
    permissions: "-rw-r--r--",
    sizeBytes: 16384,
    routeTarget: "/dashboard",
    description:
      "Chronological immutable stream of test runs, terminal receipts, and streak proofs.",
  },
  // Dev & Devices
  "/dev": {
    path: "/dev",
    name: "dev",
    type: "directory",
    permissions: "drwxr-xr-x",
    sizeBytes: 4096,
  },
  "/dev/daemons": {
    path: "/dev/daemons",
    name: "daemons",
    type: "device",
    permissions: "crw-rw-rw-",
    sizeBytes: 0,
    routeTarget: "/dashboard",
    description: "Background habits manager (PIDs, heartbeats, crash recovery).",
  },
  "/dev/code-lab": {
    path: "/dev/code-lab",
    name: "code-lab",
    type: "device",
    permissions: "crw-rw-rw-",
    sizeBytes: 0,
    routeTarget: "/code-lab",
    description: "Isolated multi-language sandbox compiler (C, Python, Java).",
  },
  "/dev/sql-lab": {
    path: "/dev/sql-lab",
    name: "sql-lab",
    type: "device",
    permissions: "crw-rw-rw-",
    sizeBytes: 0,
    routeTarget: "/sql-lab",
    description: "Relational database query sandbox and explain simulator.",
  },
  // Proc (Kernel virtual information)
  "/proc": {
    path: "/proc",
    name: "proc",
    type: "proc",
    permissions: "dr-xr-xr-x",
    sizeBytes: 0,
  },
  "/proc/kernel": {
    path: "/proc/kernel",
    name: "kernel",
    type: "proc",
    permissions: "-r--r--r--",
    sizeBytes: 512,
    content: "EngineerOS Kernel v3.2.0-kernel (x86_64-student-os). Single source of truth online.",
  },
  "/proc/meminfo": {
    path: "/proc/meminfo",
    name: "meminfo",
    type: "proc",
    permissions: "-r--r--r--",
    sizeBytes: 1024,
    content:
      "MemTotal: 100 MB\nMemResident: 64 MB\nSwapTotal: 64 MB\nSwapUsed: 24 MB\nDirtyPages: 12 MB",
  },
  "/proc/cpuinfo": {
    path: "/proc/cpuinfo",
    name: "cpuinfo",
    type: "proc",
    permissions: "-r--r--r--",
    sizeBytes: 512,
    content:
      "model name: Student Focus Core (8-thread adaptive)\ncache size: 1024 KB L1 Working Memory",
  },
};

/**
 * List files in directory
 */
export function listDirectory(dirPath: string): FileSystemNode[] {
  const norm = dirPath === "/" ? "/" : dirPath.replace(/\/$/, "");
  const results: FileSystemNode[] = [];

  for (const [key, node] of Object.entries(CAREER_FILESYSTEM)) {
    if (key === norm) continue;
    // Parent matches
    const lastSlash = key.lastIndexOf("/");
    const parent = lastSlash === 0 ? "/" : key.substring(0, lastSlash);
    if (parent === norm) {
      results.push(node);
    }
  }

  return results.sort((a, b) => {
    if (a.type === "directory" && b.type !== "directory") return -1;
    if (a.type !== "directory" && b.type === "directory") return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Resolve relative or absolute path
 */
export function resolvePath(currentDir: string, targetPath: string): string {
  const trimmed = targetPath.trim();
  if (trimmed === "/") return "/";
  if (trimmed === "~" || trimmed === "") return "/fundamentals";
  if (trimmed === "..") {
    if (currentDir === "/") return "/";
    const lastSlash = currentDir.lastIndexOf("/");
    return lastSlash <= 0 ? "/" : currentDir.substring(0, lastSlash);
  }

  if (trimmed.startsWith("/")) {
    // Absolute
    return trimmed.replace(/\/$/, "");
  }

  // Relative
  const base = currentDir === "/" ? "" : currentDir;
  return `${base}/${trimmed}`.replace(/\/$/, "");
}
