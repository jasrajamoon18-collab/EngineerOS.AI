export interface SkillTreeNode {
  id: string;
  title: string;
  description: string;
  xpRequired: number;
  dependencies: string[];
  track: "python" | "cpp" | "java" | "dsa";
  tier: number; // 1 to 5
}

export const SKILL_TREES: Record<
  string,
  { name: string; description: string; nodes: SkillTreeNode[] }
> = {
  python: {
    name: "Python Mastery Tree",
    description:
      "Progressive skill tree from syntax fundamentals to async microservices and profiling.",
    nodes: [
      {
        id: "py-1",
        title: "Syntax & Primitives",
        description: "Variables, data types, control flow, loops, and basic functions.",
        xpRequired: 0,
        dependencies: [],
        track: "python",
        tier: 1,
      },
      {
        id: "py-2",
        title: "Data Structures & Comprehensions",
        description: "Lists, dicts, sets, tuples, list comprehensions, and generators.",
        xpRequired: 50,
        dependencies: ["py-1"],
        track: "python",
        tier: 2,
      },
      {
        id: "py-3",
        title: "OOP & Modular Architecture",
        description: "Classes, dunder methods, inheritance, polymorphism, and packages.",
        xpRequired: 120,
        dependencies: ["py-2"],
        track: "python",
        tier: 3,
      },
      {
        id: "py-4",
        title: "Async I/O & Networking",
        description: "asyncio, coroutines, event loops, tasks, and non-blocking I/O.",
        xpRequired: 220,
        dependencies: ["py-3"],
        track: "python",
        tier: 4,
      },
      {
        id: "py-5",
        title: "Production APIs & Profiling",
        description: "FastAPI, Pydantic, cProfile, memory profiling, and Docker deployment.",
        xpRequired: 350,
        dependencies: ["py-4"],
        track: "python",
        tier: 5,
      },
    ],
  },

  cpp: {
    name: "C & C++ Systems Tree",
    description:
      "Low-level memory management, pointers, modern C++20, and high-performance systems.",
    nodes: [
      {
        id: "cpp-1",
        title: "C Syntax & Procedural Flow",
        description: "Standard I/O, compilation flags, header files, and numeric representations.",
        xpRequired: 0,
        dependencies: [],
        track: "cpp",
        tier: 1,
      },
      {
        id: "cpp-2",
        title: "Pointers & Manual Memory",
        description: "Pointer arithmetic, stack vs heap, malloc/free, and memory layout.",
        xpRequired: 60,
        dependencies: ["cpp-1"],
        track: "cpp",
        tier: 2,
      },
      {
        id: "cpp-3",
        title: "Structs & Memory Alignment",
        description: "Data alignment, padding, bitfields, function pointers, and unions.",
        xpRequired: 130,
        dependencies: ["cpp-2"],
        track: "cpp",
        tier: 3,
      },
      {
        id: "cpp-4",
        title: "Modern C++ & STL",
        description:
          "RAII, smart pointers, templates, vectors, unordered_maps, and move semantics.",
        xpRequired: 240,
        dependencies: ["cpp-3"],
        track: "cpp",
        tier: 4,
      },
      {
        id: "cpp-5",
        title: "Concurrency & POSIX Systems",
        description: "std::thread, mutexes, condition variables, sockets, and syscalls.",
        xpRequired: 380,
        dependencies: ["cpp-4"],
        track: "cpp",
        tier: 5,
      },
    ],
  },

  java: {
    name: "Java Enterprise Architecture",
    description: "Object-oriented design, Collections, JVM memory models, and enterprise backends.",
    nodes: [
      {
        id: "java-1",
        title: "Java Fundamentals & JVM",
        description:
          "Bytecode, classloading, primitive vs reference types, and garbage collection.",
        xpRequired: 0,
        dependencies: [],
        track: "java",
        tier: 1,
      },
      {
        id: "java-2",
        title: "OOP & SOLID Principles",
        description: "Interfaces, abstract classes, encapsulation, and clean design patterns.",
        xpRequired: 50,
        dependencies: ["java-1"],
        track: "java",
        tier: 2,
      },
      {
        id: "java-3",
        title: "Collections & Streams",
        description: "HashMap internals, ArrayList vs LinkedList, Stream API, and lambdas.",
        xpRequired: 120,
        dependencies: ["java-2"],
        track: "java",
        tier: 3,
      },
      {
        id: "java-4",
        title: "Multithreading & Locks",
        description: "Thread pools, ExecutorService, ReentrantLock, and volatile semantics.",
        xpRequired: 230,
        dependencies: ["java-3"],
        track: "java",
        tier: 4,
      },
      {
        id: "java-5",
        title: "Spring Boot & Microservices",
        description: "Dependency injection, JPA/Hibernate, REST controllers, and transactions.",
        xpRequired: 360,
        dependencies: ["java-4"],
        track: "java",
        tier: 5,
      },
    ],
  },

  dsa: {
    name: "Data Structures & Algorithms Tree",
    description: "Algorithm patterns, computational complexity, and technical interview mastery.",
    nodes: [
      {
        id: "dsa-1",
        title: "Arrays & Two Pointers",
        description: "In-place array manipulation, sliding window, and two-pointer inwards scan.",
        xpRequired: 0,
        dependencies: [],
        track: "dsa",
        tier: 1,
      },
      {
        id: "dsa-2",
        title: "Hash Maps & Strings",
        description: "Frequency counting, anagram verification, and collision resolution.",
        xpRequired: 60,
        dependencies: ["dsa-1"],
        track: "dsa",
        tier: 2,
      },
      {
        id: "dsa-3",
        title: "Linked Lists & Binary Search",
        description: "Fast & slow pointers, reversing lists, and logarithmic boundary search.",
        xpRequired: 140,
        dependencies: ["dsa-2"],
        track: "dsa",
        tier: 3,
      },
      {
        id: "dsa-4",
        title: "Trees & Graph Traversals",
        description: "BFS level-order, DFS recursion, BST properties, and shortest paths.",
        xpRequired: 250,
        dependencies: ["dsa-3"],
        track: "dsa",
        tier: 4,
      },
      {
        id: "dsa-5",
        title: "Dynamic Programming & Greedy",
        description: "Top-down memoization, bottom-up tabular DP, state transitions, and knapsack.",
        xpRequired: 390,
        dependencies: ["dsa-4"],
        track: "dsa",
        tier: 5,
      },
    ],
  },
};

export function computeNodeStatus(
  node: SkillTreeNode,
  userXp: number,
  allNodes: SkillTreeNode[],
): "mastered" | "in-progress" | "locked" {
  // Check if dependencies are met
  const depNodes = allNodes.filter((n) => node.dependencies.includes(n.id));
  const depsMet = depNodes.every((n) => userXp >= n.xpRequired);

  if (!depsMet) return "locked";
  if (userXp >= node.xpRequired + 40) return "mastered";
  if (userXp >= node.xpRequired) return "in-progress";
  return "locked";
}
