export interface CheatSheetEntry {
  commandOrSyntax: string;
  explanation: string;
  example: string;
  tag: string;
}

export interface CheatSheetCategory {
  id: string;
  title: string;
  slug: string;
  icon: string;
  badge: string;
  description: string;
  entries: CheatSheetEntry[];
  summaryTable?: {
    headers: string[];
    rows: string[][];
  };
}

export const CHEAT_SHEETS: CheatSheetCategory[] = [
  {
    id: "cs-c-cpp",
    title: "C & C++ Systems Reference",
    slug: "c-cpp",
    icon: "code",
    badge: "Systems / Low-Level",
    description:
      "Memory allocation, pointers, references, smart pointers, structs, and STL containers.",
    entries: [
      {
        commandOrSyntax: "int* ptr = (int*)malloc(n * sizeof(int));",
        explanation: "Allocates contiguous memory on heap in C. Returns void* or NULL on failure.",
        example: "int* arr = (int*)malloc(10 * sizeof(int));\nif (!arr) return -1;\nfree(arr);",
        tag: "Memory",
      },
      {
        commandOrSyntax: "std::unique_ptr<T> p = std::make_unique<T>();",
        explanation:
          "Exclusive ownership smart pointer (C++14). Automatically frees memory when out of scope without manual delete.",
        example: "auto node = std::make_unique<ListNode>(42);\n// No need to call delete node;",
        tag: "Modern C++",
      },
      {
        commandOrSyntax: "std::vector<int> v; v.push_back(val);",
        explanation:
          "Dynamic resizable array in C++ STL with amortized O(1) appending and contiguous cache-friendly storage.",
        example:
          "std::vector<int> nums = {1, 2, 3};\nnums.push_back(4);\nstd::sort(nums.begin(), nums.end());",
        tag: "STL",
      },
      {
        commandOrSyntax: "std::unordered_map<Key, Val> map;",
        explanation:
          "Hash table with average O(1) lookup, insertion, and deletion using chaining buckets.",
        example:
          'std::unordered_map<std::string, int> freq;\nfreq["apple"]++;\nif (freq.count("apple")) { ... }',
        tag: "STL",
      },
      {
        commandOrSyntax: "int& ref = originalVar;",
        explanation:
          "C++ reference: an alias for an existing variable that cannot be null and cannot be reseated.",
        example: "void swap(int& a, int& b) {\n  int temp = a;\n  a = b;\n  b = temp;\n}",
        tag: "Syntax",
      },
      {
        commandOrSyntax: "const int* p vs int* const p",
        explanation:
          "const int* p: pointer to constant integer (data cannot change). int* const p: constant pointer (address cannot change).",
        example:
          "const int x = 10;\nconst int* ptr = &x; // *ptr = 20 is illegal\nint* const cptr = &y; // cptr = &z is illegal",
        tag: "Pointers",
      },
    ],
    summaryTable: {
      headers: ["Container", "Access", "Insertion / Deletion", "Underlying Structure"],
      rows: [
        ["std::vector", "O(1)", "O(1) amortized end, O(n) middle", "Dynamic array"],
        ["std::deque", "O(1)", "O(1) at front and back", "Chunked indexed arrays"],
        ["std::list", "O(n)", "O(1) once iterator positioned", "Doubly linked list"],
        ["std::set / map", "O(log n)", "O(log n)", "Self-balancing Red-Black Tree"],
        ["std::unordered_map", "O(1) avg", "O(1) avg, O(n) worst", "Chained Hash Table"],
      ],
    },
  },

  {
    id: "cs-python",
    title: "Python Essentials & Automation",
    slug: "python",
    icon: "terminal",
    badge: "Scripting / Backend / AI",
    description:
      "List comprehensions, dictionary tricks, generators, file I/O, lambda, and itertools.",
    entries: [
      {
        commandOrSyntax: "[expr for item in iterable if condition]",
        explanation: "List comprehension for concise, vectorized collection transformations.",
        example: "squares = [x**2 for x in range(10) if x % 2 == 0]\n# [0, 4, 16, 36, 64]",
        tag: "Core",
      },
      {
        commandOrSyntax: "from collections import defaultdict, Counter",
        explanation:
          "Counter tallies frequencies automatically; defaultdict provides default missing key values without KeyError.",
        example:
          'counts = Counter(["a", "b", "a"])\n# Counter({\'a\': 2, \'b\': 1})\ngroups = defaultdict(list)\ngroups["eng"].append("CS")',
        tag: "Collections",
      },
      {
        commandOrSyntax: "with open('data.json', 'r') as f:",
        explanation:
          "Context manager guaranteeing file descriptor closure even on unexpected exceptions.",
        example: "import json\nwith open('config.json', 'r') as f:\n    data = json.load(f)",
        tag: "I/O",
      },
      {
        commandOrSyntax: "def gen(): yield item",
        explanation:
          "Generator function that yields items lazily one-by-one without holding the full sequence in memory.",
        example:
          "def fib():\n    a, b = 0, 1\n    while True:\n        yield a\n        a, b = b, a + b",
        tag: "Generators",
      },
      {
        commandOrSyntax: "*args, **kwargs",
        explanation:
          "*args unpacks positional arguments into a tuple; **kwargs unpacks keyword arguments into a dictionary.",
        example: 'def log(tag, *messages, **meta):\n    print(f"[{tag}]", *messages, meta)',
        tag: "Functions",
      },
    ],
  },

  {
    id: "cs-linux",
    title: "Linux CLI & System Administration",
    slug: "linux",
    icon: "server",
    badge: "DevOps / Infrastructure",
    description:
      "File manipulation, permissions, process monitoring, grep, networking, and systemd.",
    entries: [
      {
        commandOrSyntax: "chmod 755 script.sh && chown user:group file",
        explanation:
          "755 gives rwx to owner, rx to group/others. chown changes user and group ownership.",
        example: "chmod +x deploy.sh\n./deploy.sh",
        tag: "Permissions",
      },
      {
        commandOrSyntax: "grep -rnwi 'TODO' src/ --include='*.ts'",
        explanation:
          "Recursive search for exact word 'TODO', case-insensitive, displaying line numbers.",
        example: "grep -rn 'DATABASE_URL' .env* src/",
        tag: "Search",
      },
      {
        commandOrSyntax: "ps aux | grep node | awk '{print $2}'",
        explanation:
          "Piping: lists all running processes, filters for node, and prints just the Process ID (PID).",
        example: "kill -9 $(ps aux | grep 'bad-worker' | awk '{print $2}')",
        tag: "Pipes / Processes",
      },
      {
        commandOrSyntax: "tar -czvf backup.tar.gz /var/www",
        explanation:
          "Creates gzip-compressed archive (-c: create, -z: gzip, -v: verbose, -f: filename). Extract with -xzvf.",
        example: "tar -xzvf archive.tar.gz -C /opt/extracted",
        tag: "Archiving",
      },
      {
        commandOrSyntax: "systemctl status|restart|enable <service>",
        explanation:
          "Controls systemd daemon background services. enable ensures service starts on server reboot.",
        example: "sudo systemctl restart nginx\nsudo systemctl status postgresql",
        tag: "Systemd",
      },
      {
        commandOrSyntax: "netstat -tulnp | grep :3000 or ss -tuln",
        explanation: "Displays listening TCP/UDP ports and identifying socket processes.",
        example: "ss -tulpn | grep 3000\n# Reveals PID locking port 3000",
        tag: "Networking",
      },
    ],
  },

  {
    id: "cs-sql",
    title: "SQL & Relational Databases",
    slug: "sql",
    icon: "database",
    badge: "Data / Backend",
    description: "Joins, aggregations, window functions, indexes, and transactions.",
    entries: [
      {
        commandOrSyntax:
          "SELECT d.name, COUNT(e.id) FROM depts d LEFT JOIN emps e ON d.id = e.dept_id GROUP BY d.id HAVING COUNT(e.id) > 5;",
        explanation:
          "Aggregates employee count per department, including departments with 0 employees, filtering for teams larger than 5.",
        example: "SELECT domain, COUNT(*) FROM projects GROUP BY domain ORDER BY COUNT(*) DESC;",
        tag: "Joins & Groups",
      },
      {
        commandOrSyntax: "ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) as rank",
        explanation:
          "Window function: ranks rows within specific subgroups without collapsing rows like GROUP BY.",
        example:
          "WITH Ranked AS (\n  SELECT *, ROW_NUMBER() OVER (PARTITION BY branch ORDER BY score DESC) as rnk\n  FROM students\n)\nSELECT * FROM Ranked WHERE rnk <= 3;",
        tag: "Window Functions",
      },
      {
        commandOrSyntax: "CREATE INDEX idx_user_email ON users(email);",
        explanation:
          "Creates a B-Tree index on email column to turn O(n) table scans into O(log n) lookups.",
        example: "CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);",
        tag: "Optimization",
      },
      {
        commandOrSyntax: "BEGIN TRANSACTION; ... COMMIT; / ROLLBACK;",
        explanation:
          "Guarantees ACID atomicity: all operations succeed or all changes are rolled back on error.",
        example:
          "BEGIN;\nUPDATE accounts SET bal = bal - 100 WHERE id = 1;\nUPDATE accounts SET bal = bal + 100 WHERE id = 2;\nCOMMIT;",
        tag: "Transactions",
      },
    ],
  },

  {
    id: "cs-git",
    title: "Git & GitHub Version Control",
    slug: "git",
    icon: "git-branch",
    badge: "Collaboration / CI",
    description: "Branching, rebase, cherry-pick, stash, conflict resolution, and undoing commits.",
    entries: [
      {
        commandOrSyntax: "git checkout -b feature/auth && git push -u origin feature/auth",
        explanation:
          "Creates and switches to a new branch, then sets up upstream tracking on GitHub.",
        example: "git switch -c feature/viva-prep",
        tag: "Branching",
      },
      {
        commandOrSyntax: "git stash && git pull --rebase && git stash pop",
        explanation:
          "Temporarily shelves uncommitted changes to pull cleanly, then re-applies your work on top.",
        example: "git stash save 'WIP router'\ngit pull origin main\ngit stash pop",
        tag: "Workflow",
      },
      {
        commandOrSyntax: "git reset --soft HEAD~1",
        explanation:
          "Undoes the last commit while keeping all your modified code staged in your working directory.",
        example: "git reset --soft HEAD~1\ngit commit -m 'Better commit message'",
        tag: "History",
      },
      {
        commandOrSyntax: "git cherry-pick <commit-hash>",
        explanation:
          "Applies a specific single commit from another branch into your current branch.",
        example: "git cherry-pick 8f3b12a",
        tag: "Advanced",
      },
    ],
  },

  {
    id: "cs-docker",
    title: "Docker & Containerization",
    slug: "docker",
    icon: "box",
    badge: "Cloud / DevOps",
    description:
      "Container lifecycles, Dockerfile syntax, multi-stage builds, volumes, and docker-compose.",
    entries: [
      {
        commandOrSyntax:
          "docker build -t app:v1 . && docker run -p 3000:3000 --env-file .env app:v1",
        explanation:
          "Builds Docker image from local Dockerfile and runs it mapping host port 3000 to container port 3000.",
        example:
          "docker run -d --name db -p 5432:5432 -e POSTGRES_PASSWORD=secret postgres:16-alpine",
        tag: "Basics",
      },
      {
        commandOrSyntax: "docker-compose up -d --build",
        explanation:
          "Starts all multi-container services defined in docker-compose.yml in detached background mode.",
        example: "docker compose down -v  # stops containers and removes volumes",
        tag: "Compose",
      },
      {
        commandOrSyntax: "docker system prune -a --volumes",
        explanation:
          "Frees disk space by removing unused dangling images, containers, networks, and volumes.",
        example: "docker system df # view current docker disk usage",
        tag: "Maintenance",
      },
    ],
  },

  {
    id: "cs-dsa-complexity",
    title: "DSA Complexity & Algorithmic Patterns",
    slug: "dsa-patterns",
    icon: "list-tree",
    badge: "Interviews / Algorithms",
    description:
      "Time and space bounds for all fundamental data structures, sorting algorithms, and traversal techniques.",
    entries: [
      {
        commandOrSyntax: "Two Pointers / Sliding Window",
        explanation:
          "Reduces O(n²) nested loop searches into O(n) single passes over sorted arrays or substrings.",
        example:
          "int left = 0;\nfor (int right = 0; right < n; right++) {\n    windowSum += arr[right];\n    while (windowSum > target) windowSum -= arr[left++];\n}",
        tag: "Pattern",
      },
      {
        commandOrSyntax: "Breadth-First Search (Queue)",
        explanation:
          "Guarantees shortest path in unweighted graphs or uniform step lattices. Time: O(V + E), Space: O(V).",
        example:
          "Queue<Node> q = new LinkedList<>();\nq.offer(root);\nwhile (!q.isEmpty()) { ... }",
        tag: "Graphs",
      },
      {
        commandOrSyntax: "Disjoint Set Union (DSU / Union-Find)",
        explanation:
          "Near O(1) α(n) inverse Ackermann complexity for dynamic connectivity and Kruskal's algorithm.",
        example: "int find(int i) { return parent[i] == i ? i : (parent[i] = find(parent[i])); }",
        tag: "Trees",
      },
    ],
    summaryTable: {
      headers: ["Algorithm", "Best Time", "Average Time", "Worst Time", "Space Complexity"],
      rows: [
        ["QuickSort", "O(n log n)", "O(n log n)", "O(n²)", "O(log n) stack"],
        ["MergeSort", "O(n log n)", "O(n log n)", "O(n log n)", "O(n) auxiliary"],
        ["HeapSort", "O(n log n)", "O(n log n)", "O(n log n)", "O(1) in-place"],
        ["Binary Search", "O(1)", "O(log n)", "O(log n)", "O(1) iterative"],
        ["Dijkstra", "O(E log V)", "O(E log V)", "O(E log V)", "O(V)"],
      ],
    },
  },
];
