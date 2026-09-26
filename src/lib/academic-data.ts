export interface SubjectUnit {
  unitNumber: number;
  title: string;
  topics: string[];
  keyTakeaways: string[];
}

export interface ExamQuestion {
  id: string;
  year?: string;
  type: "theory" | "numerical" | "derivation" | "coding";
  marks: number;
  question: string;
  solutionHint: string;
  frequency: "high" | "medium" | "core";
}

export interface FormulaItem {
  name: string;
  formula: string;
  variables: string;
  application: string;
}

export interface AcademicSubject {
  id: string;
  code: string;
  name: string;
  branch: string;
  semester: number;
  credits: number;
  overview: string;
  units: SubjectUnit[];
  importantQuestions: ExamQuestion[];
  formulae: FormulaItem[];
  highYieldNotes: string[];
}

export const BRANCH_OPTIONS = [
  { id: "cse", name: "Computer Science & Engineering (CSE)" },
  { id: "aids", name: "AI & Machine Learning / Data Science" },
  { id: "cyber", name: "Cybersecurity & Information Security" },
  { id: "ece", name: "Electronics & Communication (ECE)" },
  { id: "eee", name: "Electrical & Electronics (EEE)" },
  { id: "mech", name: "Mechanical Engineering" },
  { id: "civil", name: "Civil Engineering" },
  { id: "robotics", name: "Robotics & Mechatronics" },
  { id: "iot", name: "Internet of Things (IoT) & Embedded" },
];

export const SEMESTER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

export const ACADEMIC_SUBJECTS: AcademicSubject[] = [
  // Semester 1 / 2 common foundations
  {
    id: "sub-eng-math-1",
    code: "MA101",
    name: "Engineering Mathematics I (Linear Algebra & Calculus)",
    branch: "cse",
    semester: 1,
    credits: 4,
    overview:
      "Core mathematical foundations for computing, signal processing, and 3D graphics: matrices, eigenvalues, partial differentiation, and Taylor series.",
    units: [
      {
        unitNumber: 1,
        title: "Matrices & Linear Systems",
        topics: [
          "Rank of a matrix using echelon form",
          "System of linear equations (homogeneous & non-homogeneous)",
          "Eigenvalues and Eigenvectors",
          "Cayley-Hamilton Theorem & Inverse matrix calculation",
          "Orthogonal transformation and diagonalization",
        ],
        keyTakeaways: [
          "Rank equals number of non-zero rows in row-echelon form.",
          "Ax = λx defines the characteristic equation det(A - λI) = 0.",
          "Cayley-Hamilton states every square matrix satisfies its own characteristic polynomial.",
        ],
      },
      {
        unitNumber: 2,
        title: "Differential Calculus & Multivariable Functions",
        topics: [
          "Rolle's Theorem & Lagrange's Mean Value Theorem",
          "Taylor's and Maclaurin's series expansions",
          "Partial differentiation & Euler's theorem on homogeneous functions",
          "Jacobians and coordinate transformations",
          "Maxima and minima of multivariable functions using Lagrange multipliers",
        ],
        keyTakeaways: [
          "Euler's theorem: x(∂u/∂x) + y(∂u/∂y) = n·u for homogeneous degree n.",
          "Lagrange multipliers identify constrained extrema where ∇f = λ∇g.",
        ],
      },
      {
        unitNumber: 3,
        title: "Integral Calculus & Multiple Integrals",
        topics: [
          "Beta and Gamma functions with properties",
          "Double integrals in Cartesian and polar coordinates",
          "Area calculation by double integration",
          "Triple integrals & volume calculations",
          "Change of order of integration in double integrals",
        ],
        keyTakeaways: [
          "Γ(n+1) = n! for integer n; Γ(1/2) = √π.",
          "Changing order of integration requires sketching the bounding curve region.",
        ],
      },
    ],
    importantQuestions: [
      {
        id: "q-math-1",
        year: "2024 Exam",
        type: "theory",
        marks: 10,
        question:
          "State and prove Cayley-Hamilton Theorem. Verify it for matrix A = [[1, 2], [3, 4]] and calculate A⁻¹ and A⁴.",
        solutionHint:
          "Find det(A - λI) = λ² - 5λ - 2 = 0. Replace λ with A: A² - 5A - 2I = 0. Multiply by A⁻¹ to get A⁻¹ = (A - 5I)/2.",
        frequency: "high",
      },
      {
        id: "q-math-2",
        year: "2023 Exam",
        type: "derivation",
        marks: 8,
        question:
          "Find the maximum and minimum distances from the origin to the surface x² + y² + z² = 1 subject to x + y + z = 0 using Lagrange multipliers.",
        solutionHint:
          "Set F(x, y, z, λ) = x² + y² + z² + λ(x + y + z). Take partial derivatives with respect to x, y, z, λ and solve.",
        frequency: "high",
      },
      {
        id: "q-math-3",
        year: "2024 Exam",
        type: "numerical",
        marks: 8,
        question:
          "Evaluate ∫∫ xy dx dy over the positive quadrant of the circle x² + y² = a² by transforming into polar coordinates.",
        solutionHint:
          "Convert x = r cos θ, y = r sin θ, dx dy = r dr dθ. Limits: r from 0 to a, θ from 0 to π/2. Result is a⁴/8.",
        frequency: "core",
      },
    ],
    formulae: [
      {
        name: "Cayley-Hamilton Characteristic Equation",
        formula: "det(A - λI) = 0 => p(A) = 0",
        variables: "A: Square Matrix, λ: Scalar Eigenvalue, I: Identity Matrix",
        application:
          "Computing matrix powers Aⁿ and matrix inverse A⁻¹ without Gaussian elimination.",
      },
      {
        name: "Euler's Theorem for Homogeneous Functions",
        formula: "x · (∂u/∂x) + y · (∂u/∂y) = n · u",
        variables: "u(x, y): Homogeneous function of degree n",
        application:
          "Quickly simplifying partial differential expressions in physics and thermodynamics.",
      },
      {
        name: "Beta-Gamma Relationship",
        formula: "B(m, n) = [Γ(m) · Γ(n)] / Γ(m + n)",
        variables: "m, n > 0",
        application: "Evaluating complex definite trigonometric and algebraic integrals.",
      },
    ],
    highYieldNotes: [
      "Always verify Cayley-Hamilton by writing down characteristic polynomial coefficients: λ² - Tr(A)λ + det(A) = 0 for 2x2.",
      "In double integrals, draw the bounding region first. Slicing vertically means x is constant at outer limits, y varies between curves.",
      "Jacobian J = ∂(x,y)/∂(u,v). For polar coordinates: dx dy = r dr dθ.",
    ],
  },

  // Semester 3: Data Structures & Algorithms
  {
    id: "sub-dsa-sem3",
    code: "CS201",
    name: "Data Structures & Algorithm Design",
    branch: "cse",
    semester: 3,
    credits: 4,
    overview:
      "Theoretical and practical foundations of linear and non-linear memory organizations: asymptotic analysis, balanced search trees, graph traversals, and dynamic programming.",
    units: [
      {
        unitNumber: 1,
        title: "Analysis of Algorithms & Linear Structures",
        topics: [
          "Asymptotic notations: Big O, Big Omega, Big Theta",
          "Master theorem for divide-and-conquer recurrences",
          "Singly, Doubly, and Circular Linked Lists with memory overhead analysis",
          "Stack applications: Infix to Postfix conversion, Parentheses matching",
          "Queues: Circular Queue, Double-Ended Queue (Deque), Priority Queue array/heap",
        ],
        keyTakeaways: [
          "Master Theorem solves T(n) = aT(n/b) + f(n) by comparing f(n) to n^(log_b a).",
          "Circular queue prevents false overflow by advancing rear = (rear + 1) % capacity.",
        ],
      },
      {
        unitNumber: 2,
        title: "Non-Linear Structures: Trees & Balanced Trees",
        topics: [
          "Binary Trees: Traversals (Inorder, Preorder, Postorder, Level-order)",
          "Binary Search Trees (BST): Insertion, Deletion cases (leaf, 1 child, 2 children)",
          "AVL Trees: Rotations (LL, RR, LR, RL) and balance factor maintaining O(log n)",
          "B-Trees and B+ Trees: Multi-way disk indexing architectures",
          "Heaps: Min-heap, Max-heap, Heapify in O(n), HeapSort",
        ],
        keyTakeaways: [
          "BST deletion with two children substitutes inorder successor or inorder predecessor.",
          "AVL tree balance factor BF = height(left) - height(right) must remain in {-1, 0, +1}.",
        ],
      },
      {
        unitNumber: 3,
        title: "Graphs, Sorting & Dynamic Programming",
        topics: [
          "Graph representations: Adjacency Matrix vs Adjacency List",
          "Graph traversals: BFS (Queue) vs DFS (Stack/Recursion)",
          "Shortest Path: Dijkstra's Algorithm (non-negative weights), Bellman-Ford",
          "Minimum Spanning Trees: Kruskal's (Union-Find) and Prim's Algorithms",
          "Dynamic Programming: 0/1 Knapsack, Longest Common Subsequence (LCS)",
        ],
        keyTakeaways: [
          "Dijkstra runs in O((V + E) log V) with min-priority queue; fails with negative cycles.",
          "Kruskal's utilizes Disjoint Set Union (Union by Rank + Path Compression).",
        ],
      },
    ],
    importantQuestions: [
      {
        id: "q-dsa-1",
        year: "2024 Exam",
        type: "derivation",
        marks: 10,
        question:
          "Explain the four AVL tree imbalance conditions (LL, RR, LR, RL). Show stepwise insertion of keys [15, 20, 24, 10, 13, 7, 30, 36, 25] into an initially empty AVL tree.",
        solutionHint:
          "Show balance factor calculation at each insertion. Apply Right rotation for LL, Left rotation for RR, Left-Right for LR, Right-Left for RL.",
        frequency: "high",
      },
      {
        id: "q-dsa-2",
        year: "2023 Exam",
        type: "coding",
        marks: 8,
        question:
          "Write an algorithm to evaluate a postfix expression using a stack. Trace step-by-step for expression: '2 3 1 * + 9 -'.",
        solutionHint:
          "Push operands. When operator encountered, pop top two, compute (second_popped op first_popped), push result. Result = -4.",
        frequency: "core",
      },
      {
        id: "q-dsa-3",
        year: "2024 Exam",
        type: "theory",
        marks: 10,
        question:
          "Differentiate Prim's and Kruskal's algorithms for finding Minimum Spanning Tree. Trace Kruskal's with cycle detection using Disjoint Set Union.",
        solutionHint:
          "Prim grows a single tree vertex-by-vertex; Kruskal sorts all edges and adds them if no cycle is formed.",
        frequency: "high",
      },
    ],
    formulae: [
      {
        name: "Master Theorem for Recurrences",
        formula: "T(n) = aT(n/b) + Θ(n^k) => Compare a with b^k",
        variables:
          "a ≥ 1, b > 1. If a > b^k: Θ(n^(log_b a)); if a = b^k: Θ(n^k log n); if a < b^k: Θ(n^k)",
        application:
          "Instant asymptotic time complexity derivation for MergeSort, Strassen, Binary Search.",
      },
      {
        name: "Binary Tree Height & Nodes",
        formula: "Max Nodes = 2^(h+1) - 1, Min Height = ⌊log₂(n)⌋",
        variables: "h: Height of tree (root at level 0), n: Total nodes",
        application: "Estimating worst-case search space in database trees and memory limits.",
      },
      {
        name: "AVL Balance Factor",
        formula: "BF(Node) = Height(LeftSubtree) - Height(RightSubtree) ∈ {-1, 0, 1}",
        variables: "Height of empty subtree = -1",
        application: "Triggering single and double rotations during node insertions.",
      },
    ],
    highYieldNotes: [
      "Heapify takes linear time O(n) because nodes near the leaves have very low height (geometric progression).",
      "Inorder traversal of any valid Binary Search Tree (BST) produces an array in strictly ascending sorted order.",
      "Adjacency list is preferred for sparse graphs (E << V²), saving memory from O(V²) to O(V + E).",
    ],
  },

  // Semester 4: Operating Systems
  {
    id: "sub-os-sem4",
    code: "CS204",
    name: "Operating Systems & Systems Architecture",
    branch: "cse",
    semester: 4,
    credits: 4,
    overview:
      "Process management, inter-process communication, CPU scheduling algorithms, synchronization primitives, deadlock avoidance (Banker's), and virtual memory paging.",
    units: [
      {
        unitNumber: 1,
        title: "Processes, Threads & CPU Scheduling",
        topics: [
          "Operating system dual mode: User Mode vs Kernel Mode, System Calls",
          "Process Control Block (PCB) and Process State Lifecycle",
          "Context Switching mechanics & overhead",
          "Kernel threads vs User-level threads (1:1, M:1, M:N models)",
          "CPU Scheduling: FCFS, SJF (Preemptive/Non-preemptive), Round Robin, Priority Scheduling",
        ],
        keyTakeaways: [
          "System calls trigger software interrupt (trap) to enter privileged kernel mode.",
          "Preemptive SJF (Shortest Remaining Time First) gives optimal minimum average waiting time.",
        ],
      },
      {
        unitNumber: 2,
        title: "Process Synchronization & Deadlocks",
        topics: [
          "Critical Section Problem and 3 Requirements (Mutual Exclusion, Progress, Bounded Waiting)",
          "Hardware atomic primitives: TestAndSet, CompareAndSwap",
          "Semaphores (Counting vs Binary / Mutex) and Classic Problems (Dining Philosophers, Producer-Consumer)",
          "Deadlock: 4 Necessary Conditions (Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait)",
          "Deadlock Avoidance: Resource Allocation Graph & Banker's Algorithm",
        ],
        keyTakeaways: [
          "Deadlock requires ALL four Coffman conditions simultaneously.",
          "Banker's algorithm ensures system always moves between safe states where Need ≤ Available.",
        ],
      },
      {
        unitNumber: 3,
        title: "Memory Management & Storage",
        topics: [
          "Logical vs Physical Address Space, Memory Management Unit (MMU)",
          "Contiguous allocation & Fragmentation (Internal vs External)",
          "Paging architecture: Page Table, Translation Lookaside Buffer (TLB), Page Faults",
          "Page Replacement Algorithms: FIFO, Optimal (Belady's), Least Recently Used (LRU)",
          "Thrashing & Working Set Model, Disk Scheduling (SSTF, SCAN, C-SCAN)",
        ],
        keyTakeaways: [
          "Effective Access Time = HitRate × (TLB + Mem) + MissRate × (TLB + 2×Mem).",
          "Belady's Anomaly occurs in FIFO where increasing page frames increases page faults.",
        ],
      },
    ],
    importantQuestions: [
      {
        id: "q-os-1",
        year: "2024 Exam",
        type: "numerical",
        marks: 10,
        question:
          "Consider 5 processes P0-P4 with Allocation, Max matrices and Available vector [3, 3, 2]. Run Banker's Algorithm to determine if the system is in a safe state. Write the safe sequence.",
        solutionHint:
          "Calculate Need matrix = Max - Allocation. Find process where Need ≤ Available, pretend it executes, reclaim Allocation: Available = Available + Allocation. Repeat.",
        frequency: "high",
      },
      {
        id: "q-os-2",
        year: "2023 Exam",
        type: "theory",
        marks: 8,
        question:
          "Explain the concept of Virtual Memory with demand paging. What is a Page Fault? Explain the step-by-step operating system trap handling when a page fault occurs.",
        solutionHint:
          "1. CPU checks valid bit in page table. 2. Invalid bit triggers OS page fault trap. 3. OS locates page on swap disk. 4. Bring frame into free RAM. 5. Update page table valid bit. 6. Restart instruction.",
        frequency: "high",
      },
      {
        id: "q-os-3",
        year: "2024 Exam",
        type: "numerical",
        marks: 8,
        question:
          "Given reference string [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1] with 3 frames, calculate page faults under FIFO, LRU, and Optimal.",
        solutionHint:
          "Optimal has lowest page faults (9). LRU has 12. FIFO has 15. Show frame replacement diagram.",
        frequency: "core",
      },
    ],
    formulae: [
      {
        name: "Effective Memory Access Time (EAT) with TLB",
        formula: "EAT = α · (t_tlb + t_mem) + (1 - α) · (t_tlb + 2 · t_mem)",
        variables:
          "α: TLB hit ratio (0 to 1), t_tlb: TLB lookup latency, t_mem: RAM access latency",
        application: "Calculating real microprocessor instruction cycle performance.",
      },
      {
        name: "Banker's Algorithm Matrix Safety Check",
        formula: "Need[i][j] = Max[i][j] - Allocation[i][j] ≤ Available[j]",
        variables: "i: Process index, j: Resource type",
        application: "Granting resource allocation requests safely without deadlock.",
      },
      {
        name: "Average Waiting Time (CPU Scheduling)",
        formula:
          "Waiting Time = Turnaround Time - Burst Time = Completion Time - Arrival Time - Burst Time",
        variables: "All times measured in milliseconds / clock ticks",
        application: "Benchmarking scheduler efficiency in operating system benchmarks.",
      },
    ],
    highYieldNotes: [
      "Mutex is locking mechanism (owned by thread); Semaphore is signaling mechanism (can be incremented by any thread).",
      "Segmentation leads to external fragmentation; Paging eliminates external fragmentation but creates internal fragmentation.",
      "Thrashing occurs when total process memory requirements exceed physical RAM, causing the OS to spend more time swapping pages than executing instructions.",
    ],
  },

  // Semester 5: Computer Networks
  {
    id: "sub-cn-sem5",
    code: "CS301",
    name: "Computer Networks & Layered Architecture",
    branch: "cse",
    semester: 5,
    credits: 4,
    overview:
      "OSI and TCP/IP protocol stacks: physical transmission, framing, sliding window protocols, IPv4/IPv6 subnetting, CIDR, distance vector/link state routing, TCP congestion control, and DNS.",
    units: [
      {
        unitNumber: 1,
        title: "Layered Architecture & Data Link Control",
        topics: [
          "OSI 7-Layer model vs TCP/IP 4-Layer model comparison",
          "Framing techniques (Character count, Byte stuffing, Bit stuffing)",
          "Error detection: Parity, Checksum, Cyclic Redundancy Check (CRC polynomial division)",
          "Flow Control: Stop-and-Wait, Go-Back-N (GBN), Selective Repeat (SR) sliding window",
          "Medium Access Control: Pure ALOHA, Slotted ALOHA, CSMA/CD, CSMA/CA",
        ],
        keyTakeaways: [
          "Maximum efficiency of Slotted ALOHA is 1/e ≈ 36.8%, double Pure ALOHA (18.4%).",
          "Go-Back-N sender window size is 2^n - 1; Selective Repeat sender/receiver window size is 2^(n-1).",
        ],
      },
      {
        unitNumber: 2,
        title: "Network Layer: Addressing & Routing",
        topics: [
          "IPv4 Addressing: Classes (A, B, C, D), Subnet Mask, Subnetting & CIDR notation",
          "IPv6 Architecture: 128-bit structure, dual-stack migration, header simplification",
          "Address Resolution Protocol (ARP) & ICMP (Ping, Traceroute)",
          "Routing Algorithms: Distance Vector (Bellman-Ford, Count to Infinity) vs Link State (Dijkstra, OSPF)",
          "Border Gateway Protocol (BGP) & Autonomous Systems",
        ],
        keyTakeaways: [
          "CIDR /26 provides 2^(32-26) = 64 IP addresses, 62 usable hosts (subtract network and broadcast).",
          "Count to infinity problem in Distance Vector is mitigated by Split Horizon and Poison Reverse.",
        ],
      },
      {
        unitNumber: 3,
        title: "Transport & Application Layer Protocols",
        topics: [
          "UDP vs TCP header comparison, port numbers, multiplexing",
          "TCP Three-Way Handshake (SYN, SYN-ACK, ACK) and 4-way termination",
          "TCP Congestion Control: Slow Start, Congestion Avoidance, Fast Retransmit, Fast Recovery",
          "Domain Name System (DNS): Hierarchical resolution, Root/TLD servers, Resource Records",
          "Application protocols: HTTP/1.1 vs HTTP/2 vs HTTP/3 (QUIC over UDP), TLS Handshake",
        ],
        keyTakeaways: [
          "Slow start doubles congestion window cwnd every RTT until ssthresh, then grows linearly.",
          "HTTP/2 multiplexes streams over single TCP connection; HTTP/3 eliminates TCP head-of-line blocking via QUIC.",
        ],
      },
    ],
    importantQuestions: [
      {
        id: "q-cn-1",
        year: "2024 Exam",
        type: "numerical",
        marks: 10,
        question:
          "An organization is granted block 192.168.10.0/24. Divide this network into 4 subnets with equal number of hosts. For each subnet, find: Subnet mask, Network address, First usable IP, Last usable IP, and Broadcast address.",
        solutionHint:
          "To create 4 subnets, borrow 2 bits: prefix becomes /26 (mask 255.255.255.192). Block size is 64. Subnets are 0-63, 64-127, 128-191, 192-255.",
        frequency: "high",
      },
      {
        id: "q-cn-2",
        year: "2023 Exam",
        type: "theory",
        marks: 8,
        question:
          "Explain the four phases of TCP congestion control with a neat graph showing Congestion Window (cwnd) versus Transmission Round (RTT). Explain the effect of Triple Duplicate ACK vs Timeout.",
        solutionHint:
          "Graph shows exponential rise during Slow Start up to threshold (ssthresh). Linear growth during Congestion Avoidance. Timeout resets cwnd to 1 MSS; 3 duplicate ACKs triggers Fast Retransmit and sets cwnd = ssthresh = cwnd/2.",
        frequency: "high",
      },
      {
        id: "q-cn-3",
        year: "2024 Exam",
        type: "numerical",
        marks: 8,
        question:
          "Generate CRC checksum for data word 1010000 using generator polynomial G(x) = x³ + 1. Show the transmitted codeword and error detection at receiver.",
        solutionHint:
          "G(x) = x³ + 0x² + 0x + 1 = 1001. Append 3 zeros to data: 1010000000. Perform binary XOR division by 1001. Remainder is CRC checksum. Transmitted bits = data + remainder.",
        frequency: "core",
      },
    ],
    formulae: [
      {
        name: "Sliding Window Protocol Efficiency",
        formula: "Efficiency η = (N · T_t) / (T_t + 2 · T_p)",
        variables:
          "N: Window size, T_t: Transmission time (L/B), T_p: Propagation delay (Distance/Speed)",
        application:
          "Optimizing bandwidth-delay product for transatlantic fiber and satellite links.",
      },
      {
        name: "CIDR Usable Hosts Calculation",
        formula: "Usable Hosts = 2^(32 - prefix) - 2",
        variables: "prefix: CIDR slash notation (e.g. /24, /27)",
        application:
          "Subnetting calculations in CCNA, university examinations, and VPC network design.",
      },
      {
        name: "TCP Congestion Window Update (AIMD)",
        formula: "cwnd = cwnd + (1 / cwnd) for each ACK; cwnd = cwnd / 2 on 3-Dup-ACK",
        variables: "cwnd: Congestion window measured in maximum segment size (MSS)",
        application:
          "Ensuring bandwidth fairness among millions of concurrent internet connections.",
      },
    ],
    highYieldNotes: [
      "TCP is byte-stream oriented; UDP is datagram-oriented. UDP preserves message boundaries; TCP does not.",
      "ARP translates 32-bit IP address into 48-bit Ethernet MAC address using local broadcast.",
      "In CSMA/CD, minimum frame length to detect collision is L_min = 2 × Propagation Delay × Bandwidth.",
    ],
  },
];
