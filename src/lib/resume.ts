/**
 * Resume data model, ATS-friendly plain-text renderer and a transparent,
 * rule-based checker.
 *
 * IMPORTANT HONESTY NOTE: nothing here talks to a real applicant tracking
 * system. Every result is produced by the deterministic rules in this file and
 * is labelled as such in the UI. No score here predicts a real hiring outcome.
 */

export type ResumeExperience = {
  role: string;
  organisation: string;
  period: string;
  bullets: string[];
};

export type ResumeProjectEntry = {
  title: string;
  tech: string;
  link: string;
  bullets: string[];
};

export type ResumeEducation = {
  qualification: string;
  institution: string;
  period: string;
  detail: string;
};

export type ResumeData = {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  links: string[];
  summary: string;
  skills: string[];
  experience: ResumeExperience[];
  projects: ResumeProjectEntry[];
  education: ResumeEducation[];
  achievements: string[];
};

export const emptyResume: ResumeData = {
  fullName: "",
  headline: "",
  email: "",
  phone: "",
  location: "",
  links: [],
  summary: "",
  skills: [],
  experience: [],
  projects: [],
  education: [],
  achievements: [],
};

export const BRANCH_RESUME_TEMPLATES: Record<
  string,
  { name: string; branch: string; data: ResumeData }
> = {
  cse: {
    name: "CS & IT — Backend / Cloud / Systems",
    branch: "Computer Science & Engineering",
    data: {
      fullName: "Alex Rivera",
      headline: "Software Engineer | Distributed Systems & Backend",
      email: "alex.rivera@example.com",
      phone: "+1 (555) 234-5678",
      location: "San Francisco, CA",
      links: ["github.com/alexrivera-dev", "linkedin.com/in/alexrivera", "alexrivera.dev"],
      summary:
        "Results-oriented computer science graduate with deep foundation in distributed systems, concurrent algorithms, and cloud APIs. Built high-throughput microservices handling 15,000+ RPS with 99.9% uptime. Passionate about systems performance and database optimization.",
      skills: [
        "Go",
        "Python",
        "TypeScript",
        "C++",
        "PostgreSQL",
        "Redis",
        "Docker",
        "Kubernetes",
        "Kafka",
        "gRPC",
        "REST APIs",
        "CI/CD (GitHub Actions)",
        "Linux/Bash",
        "System Architecture",
      ],
      experience: [
        {
          role: "Backend Engineering Intern",
          organisation: "Vortex Cloud Systems",
          period: "Jun 2025 - Aug 2025",
          bullets: [
            "Architected asynchronous ingestion pipeline using Go and Kafka, cutting message latency by 42% across 3 million daily events.",
            "Engineered Redis distributed caching layer with LRU eviction, reducing p99 database query response times from 320ms to 28ms.",
            "Authored 65+ unit and integration test suites, elevating CI/CD pipeline code coverage from 68% to 91%.",
          ],
        },
      ],
      projects: [
        {
          title: "Distributed KV Store with Raft Consensus",
          tech: "Go, Raft Protocol, gRPC, LevelDB",
          link: "github.com/alexrivera-dev/raft-kv",
          bullets: [
            "Implemented Raft consensus algorithm from scratch supporting leader election, log replication, and automatic network partition recovery.",
            "Benchmark testing demonstrated consistent consensus across 5 cluster nodes under simulated 15% network packet drops.",
            "Published open-source CLI client with comprehensive documentation receiving 180+ GitHub stars.",
          ],
        },
        {
          title: "High-Throughput Real-time API Gateway",
          tech: "TypeScript, Node.js, Redis, Docker",
          link: "github.com/alexrivera-dev/gateway-engine",
          bullets: [
            "Engineered token-bucket rate limiter middleware enforcing 500 req/min thresholds across 12 upstream microservices.",
            "Containerized service using multi-stage Docker builds reducing production image footprint by 64% (from 480MB to 172MB).",
          ],
        },
      ],
      education: [
        {
          qualification: "B.S. in Computer Science (GPA: 3.85 / 4.0)",
          institution: "State Institute of Technology",
          period: "2022 - 2026",
          detail:
            "Relevant Coursework: Distributed Systems, Operating Systems, Advanced Algorithms, Database Internals, Computer Networks.",
        },
      ],
      achievements: [
        "Winner, HackState 2025 (Best Systems Architecture track out of 120 teams)",
        "Top 5% in Global CodeSprint Algorithm Challenge (Rating: 2,050+)",
      ],
    },
  },
  ece: {
    name: "ECE & EE — Embedded Systems & IoT",
    branch: "Electronics & Communication Engineering",
    data: {
      fullName: "Priya Sharma",
      headline: "Embedded Systems Engineer | Firmware & IoT Hardware",
      email: "priya.sharma@example.com",
      phone: "+1 (555) 345-6789",
      location: "Austin, TX",
      links: ["github.com/priyasharma-embedded", "linkedin.com/in/priyasharma-ee"],
      summary:
        "Electronics and firmware engineer with specialization in ARM Cortex-M microcontrollers, RTOS kernel scheduling, and low-power IoT telemetry. Proven experience designing bare-metal drivers, SPI/I2C sensor buses, and automated hardware-in-the-loop validation.",
      skills: [
        "Embedded C",
        "C++20",
        "ARM Cortex-M (STM32/ESP32)",
        "FreeRTOS",
        "I2C / SPI / UART / CAN Bus",
        "KiCad PCB Design",
        "Oscilloscopes & Logic Analyzers",
        "MQTT / BLE",
        "Device Drivers",
        "Low-Power Optimization",
        "Hardware Debugging (JTAG/SWD)",
      ],
      experience: [
        {
          role: "Firmware Engineering Intern",
          organisation: "Apex IoT Dynamics",
          period: "May 2025 - Jul 2025",
          bullets: [
            "Developed FreeRTOS multi-threaded firmware on STM32F4 microcontroller managing dual-axis motor encoders and BLE telemetry.",
            "Optimized deep-sleep power states reducing standby current draw from 18mA to 2.4mA, extending battery runtime by 3.2x.",
            "Diagnosed signal integrity timing anomalies on 400kHz I2C bus using digital logic analyzers, resolving intermittent bus hangs.",
          ],
        },
      ],
      projects: [
        {
          title: "Autonomous Environmental Telemetry Node",
          tech: "ESP32, Embedded C, FreeRTOS, LoRaWAN, KiCad",
          link: "github.com/priyasharma-embedded/lora-node",
          bullets: [
            "Designed 2-layer custom PCB in KiCad integrating solar charging management, BME680 atmospheric sensors, and RFM95 LoRa module.",
            "Programmed non-blocking DMA drivers for sensor polling, achieving zero CPU overhead during sensor reads.",
            "Deployed 4 physical field nodes streaming temperature and air quality data over 4.8km line-of-sight range.",
          ],
        },
      ],
      education: [
        {
          qualification: "B.S. in Electrical & Computer Engineering",
          institution: "Metropolitan University of Engineering",
          period: "2022 - 2026",
          detail:
            "Coursework: Microcontroller Architecture, Digital Signal Processing, Embedded Linux, VLSI Design, Feedback Control Systems.",
        },
      ],
      achievements: [
        "First Place, IEEE Regional Embedded Design Showcase (IoT category)",
        "Certified ARM Cortex-M Developer Associate",
      ],
    },
  },
  mech: {
    name: "Mechanical & Core — CAD, Robotics & Automation",
    branch: "Mechanical Engineering",
    data: {
      fullName: "Marcus Chen",
      headline: "Mechanical & Robotics Engineer | CAD, FEA & Mechatronics",
      email: "marcus.chen@example.com",
      phone: "+1 (555) 456-7890",
      location: "Detroit, MI",
      links: ["linkedin.com/in/marcuschen-mech", "github.com/marcuschen-cad"],
      summary:
        "Mechanical engineering senior focused on computational design, finite element analysis (FEA), and robotic actuation. Extensive hands-on experience in CAD modeling, GD&T tolerancing, structural optimization, and Python-based kinematic simulation.",
      skills: [
        "SolidWorks",
        "Autodesk Fusion 360",
        "ANSYS Mechanical (FEA)",
        "GD&T (ASME Y14.5)",
        "Python (NumPy / SciPy)",
        "MATLAB & Simulink",
        "Additive Manufacturing & CNC",
        "Robotic Kinematics (ROS)",
        "Thermal Analysis",
        "DFM & DFA Standards",
      ],
      experience: [
        {
          role: "Mechanical Design Intern",
          organisation: "Kinetic Automation Labs",
          period: "Jun 2025 - Aug 2025",
          bullets: [
            "Designed 6-axis robotic end-effector assembly in SolidWorks adhering to strict GD&T standards and ISO tolerance classes.",
            "Conducted static stress FEA simulations in ANSYS, identifying stress concentrations and reducing assembly weight by 22%.",
            "Supervised 3D printing and CNC machining of rapid prototypes, verifying fit clearances within 0.05mm tolerances.",
          ],
        },
      ],
      projects: [
        {
          title: "3-DOF SCARA Robotic Manipulator",
          tech: "Fusion 360, Python, Inverse Kinematics, Stepper Actuators",
          link: "github.com/marcuschen-cad/scara-manipulator",
          bullets: [
            "Formulated forward and inverse kinematic equations in Python, validating trajectory accuracy within 0.8mm repeatability.",
            "Engineered cycloidal gear reduction drives with zero-backlash tolerances for high-precision payload handling.",
          ],
        },
      ],
      education: [
        {
          qualification: "B.S. in Mechanical Engineering",
          institution: "Tech University School of Engineering",
          period: "2022 - 2026",
          detail:
            "Coursework: Mechanics of Materials, Machine Design, Fluid Dynamics, Finite Element Analysis, Control Systems.",
        },
      ],
      achievements: [
        "Certified SolidWorks Professional (CSWP - Mechanical Design)",
        "Team Captain, University Formula SAE Chassis & Suspension Division",
      ],
    },
  },
};

export function normaliseResume(value: unknown): ResumeData {
  const raw = (value ?? {}) as Partial<ResumeData>;
  return {
    ...emptyResume,
    ...raw,
    links: raw.links ?? [],
    skills: raw.skills ?? [],
    experience: raw.experience ?? [],
    projects: raw.projects ?? [],
    education: raw.education ?? [],
    achievements: raw.achievements ?? [],
  };
}

/** Single-column, no-tables, no-graphics plain text — the format parsers read best. */
export function renderResumeText(data: ResumeData): string {
  const lines: string[] = [];
  const push = (value?: string) => {
    if (value && value.trim()) lines.push(value.trim());
  };
  const section = (title: string) => {
    lines.push("", title.toUpperCase(), "-".repeat(title.length));
  };

  push(data.fullName);
  push(data.headline);
  push([data.email, data.phone, data.location].filter(Boolean).join(" | "));
  if (data.links.length) push(data.links.join(" | "));

  if (data.summary.trim()) {
    section("Summary");
    push(data.summary);
  }
  if (data.skills.length) {
    section("Skills");
    push(data.skills.join(", "));
  }
  if (data.experience.length) {
    section("Experience");
    for (const item of data.experience) {
      push([item.role, item.organisation, item.period].filter(Boolean).join(" | "));
      for (const bullet of item.bullets) push(`- ${bullet}`);
    }
  }
  if (data.projects.length) {
    section("Projects");
    for (const item of data.projects) {
      push([item.title, item.tech, item.link].filter(Boolean).join(" | "));
      for (const bullet of item.bullets) push(`- ${bullet}`);
    }
  }
  if (data.education.length) {
    section("Education");
    for (const item of data.education) {
      push([item.qualification, item.institution, item.period].filter(Boolean).join(" | "));
      push(item.detail);
    }
  }
  if (data.achievements.length) {
    section("Achievements");
    for (const item of data.achievements) push(`- ${item}`);
  }

  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* Rule-based checks                                                           */
/* -------------------------------------------------------------------------- */

export type CheckStatus = "pass" | "warn" | "fail";

export type ResumeCheck = {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
  weight: number;
};

export type ResumeAnalysisResult = {
  score: number;
  checks: ResumeCheck[];
  matchedKeywords: string[];
  missingKeywords: string[];
};

const ACTION_VERBS = [
  "built",
  "designed",
  "implemented",
  "led",
  "shipped",
  "automated",
  "optimised",
  "optimized",
  "reduced",
  "improved",
  "migrated",
  "developed",
  "tested",
  "deployed",
  "analysed",
  "analyzed",
  "created",
  "integrated",
  "debugged",
  "refactored",
  "measured",
  "launched",
];

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "you",
  "your",
  "our",
  "are",
  "will",
  "that",
  "this",
  "have",
  "from",
  "they",
  "who",
  "have",
  "has",
  "been",
  "were",
  "was",
  "not",
  "but",
  "all",
  "any",
  "can",
  "use",
  "using",
  "work",
  "working",
  "team",
  "teams",
  "role",
  "good",
  "strong",
  "experience",
  "experiences",
  "years",
  "year",
  "ability",
  "knowledge",
  "skills",
  "skill",
  "plus",
  "must",
  "should",
  "would",
  "about",
  "into",
  "other",
  "such",
  "across",
  "within",
  "their",
  "them",
  "its",
  "also",
  "more",
  "most",
  "help",
  "new",
  "well",
  "etc",
]);

export function extractKeywords(text: string, limit = 25): string[] {
  const counts = new Map<string, number>();
  for (const token of text.toLowerCase().match(/[a-z][a-z+#.-]{2,}/g) ?? []) {
    const word = token.replace(/[.-]+$/, "");
    if (word.length < 3 || STOP_WORDS.has(word)) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word]) => word);
}

/**
 * Deterministic structural + keyword checks. Same input always gives the same
 * output; there is no model and no external service involved.
 */
export function analyseResume(data: ResumeData, jobDescription: string): ResumeAnalysisResult {
  const text = renderResumeText(data).toLowerCase();
  const checks: ResumeCheck[] = [];
  const allBullets = [
    ...data.experience.flatMap((item) => item.bullets),
    ...data.projects.flatMap((item) => item.bullets),
  ].filter((bullet) => bullet.trim());

  const contactParts = [data.email, data.phone, data.location].filter((v) => v.trim()).length;
  checks.push({
    id: "contact",
    label: "Contact block is complete",
    weight: 10,
    status: contactParts >= 3 ? "pass" : contactParts >= 1 ? "warn" : "fail",
    detail:
      contactParts >= 3
        ? "Email, phone and location are all present."
        : "Parsers index the header first — include email, phone and city.",
  });

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email.trim());
  checks.push({
    id: "email",
    label: "Email address looks valid",
    weight: 5,
    status: emailOk ? "pass" : "fail",
    detail: emailOk
      ? "Format is parseable."
      : "Use a plain professional address, e.g. name@domain.com.",
  });

  const sectionCount = [
    data.summary.trim() ? 1 : 0,
    data.skills.length ? 1 : 0,
    data.experience.length ? 1 : 0,
    data.projects.length ? 1 : 0,
    data.education.length ? 1 : 0,
  ].reduce((a, b) => a + b, 0);
  checks.push({
    id: "sections",
    label: "Standard sections are present",
    weight: 15,
    status: sectionCount >= 4 ? "pass" : sectionCount >= 3 ? "warn" : "fail",
    detail: `${sectionCount} of 5 standard sections filled (summary, skills, experience, projects, education).`,
  });

  checks.push({
    id: "skills",
    label: "Skills are listed as plain text",
    weight: 10,
    status: data.skills.length >= 8 ? "pass" : data.skills.length >= 4 ? "warn" : "fail",
    detail: `${data.skills.length} skills listed. Aim for 8-15 concrete, role-relevant skills.`,
  });

  checks.push({
    id: "bullets",
    label: "Enough achievement bullets",
    weight: 10,
    status: allBullets.length >= 6 ? "pass" : allBullets.length >= 3 ? "warn" : "fail",
    detail: `${allBullets.length} bullets across experience and projects.`,
  });

  const verbBullets = allBullets.filter((bullet) =>
    ACTION_VERBS.some((verb) => bullet.trim().toLowerCase().startsWith(verb)),
  ).length;
  const verbRatio = allBullets.length ? verbBullets / allBullets.length : 0;
  checks.push({
    id: "verbs",
    label: "Bullets start with action verbs",
    weight: 10,
    status: verbRatio >= 0.6 ? "pass" : verbRatio >= 0.3 ? "warn" : "fail",
    detail: `${verbBullets} of ${allBullets.length || 0} bullets begin with a strong verb such as "Built" or "Reduced".`,
  });

  const quantified = allBullets.filter((bullet) => /\d/.test(bullet)).length;
  const quantRatio = allBullets.length ? quantified / allBullets.length : 0;
  checks.push({
    id: "metrics",
    label: "Bullets are quantified",
    weight: 10,
    status: quantRatio >= 0.4 ? "pass" : quantRatio >= 0.2 ? "warn" : "fail",
    detail: `${quantified} bullets contain a number. Numbers make impact verifiable.`,
  });

  const longBullets = allBullets.filter((bullet) => bullet.split(/\s+/).length > 32).length;
  checks.push({
    id: "length",
    label: "Bullets stay scannable",
    weight: 5,
    status: longBullets === 0 ? "pass" : longBullets <= 2 ? "warn" : "fail",
    detail:
      longBullets === 0
        ? "No bullet runs past ~32 words."
        : `${longBullets} bullet(s) exceed ~32 words — split them.`,
  });

  const links = data.links.filter((link) => link.trim());
  checks.push({
    id: "links",
    label: "Portfolio or repository link included",
    weight: 5,
    status: links.length ? "pass" : "warn",
    detail: links.length
      ? "Reviewers can see your work directly."
      : "Add a GitHub or portfolio URL — engineering roles expect one.",
  });

  const keywords = jobDescription.trim() ? extractKeywords(jobDescription) : [];
  const matchedKeywords = keywords.filter((word) => text.includes(word));
  const missingKeywords = keywords.filter((word) => !text.includes(word));
  if (keywords.length) {
    const ratio = matchedKeywords.length / keywords.length;
    checks.push({
      id: "keywords",
      label: "Job-description keyword coverage",
      weight: 20,
      status: ratio >= 0.5 ? "pass" : ratio >= 0.25 ? "warn" : "fail",
      detail: `${matchedKeywords.length} of ${keywords.length} frequent terms from the posting appear in your resume.`,
    });
  }

  const total = checks.reduce((sum, check) => sum + check.weight, 0);
  const earned = checks.reduce(
    (sum, check) =>
      sum + check.weight * (check.status === "pass" ? 1 : check.status === "warn" ? 0.5 : 0),
    0,
  );

  return {
    score: total ? Math.round((earned / total) * 100) : 0,
    checks,
    matchedKeywords,
    missingKeywords,
  };
}
