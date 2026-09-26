import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const projectGeneratorSchema = z.object({
  skills: z.string().min(1).max(500),
  branch: z.string().optional(),
  difficulty: z.string().optional(),
});

export interface GeneratedProjectIdea {
  title: string;
  summary: string;
  difficulty: string;
  timeline: string;
  technologies: string[];
  resumeValue: string;
  architecture: string;
  suggestedMilestones: string[];
  vivaQuestions: string[];
}

export const generateProjectIdeasAction = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => projectGeneratorSchema.parse(data))
  .handler(async ({ data }) => {
    const { skills, branch, difficulty } = data;
    const apiKey = process.env["GEMINI_API_KEY"] || process.env["LOVABLE_API_KEY"];

    if (apiKey) {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `You are an engineering capstone mentor. A student knows these skills: "${skills}".
Branch: ${branch || "Engineering"}. Target Difficulty: ${difficulty || "Any"}.
Generate 5 high-impact, resume-worthy engineering project ideas in JSON format.
Return ONLY valid JSON matching this schema:
[
  {
    "title": "Project Title",
    "summary": "Crisp 2-sentence description of the problem and engineering solution.",
    "difficulty": "Beginner" | "Intermediate" | "Advanced",
    "timeline": "e.g. 2-3 Weeks",
    "technologies": ["Tech1", "Tech2"],
    "resumeValue": "Why recruiters love this on a resume",
    "architecture": "Architecture and design description",
    "suggestedMilestones": ["1. Spec & API", "2. Data Layer", "3. Core Engine", "4. Testing & README"],
    "vivaQuestions": ["Sample interview/viva question 1", "Sample interview/viva question 2"]
  }
]`,
        });

        const text = response.text?.trim() || "";
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as GeneratedProjectIdea[];
          return { projects: parsed };
        }
      } catch (err) {
        console.warn("[EngineerOS] Gemini error in project generation:", err);
      }
    }

    // High quality tailored fallback projects
    const fallbackProjects: GeneratedProjectIdea[] = [
      {
        title: "Intelligent Log Analyzer & Anomaly Sentinel",
        summary:
          "Ingest server access logs, detect rate-limiting anomalies using statistical thresholds, and output incident reports.",
        difficulty: "Intermediate",
        timeline: "2-3 Weeks",
        technologies: ["Python", "SQL", "RegEx", "FastAPI"],
        resumeValue:
          "Demonstrates practical backend logging, streaming I/O, and data pipeline fundamentals.",
        architecture:
          "Log Parser -> In-memory Window / SQLite Store -> Anomaly Detector -> Alert Dispatcher",
        suggestedMilestones: [
          "Phase 1: Parse Apache/Nginx log formats into structured records",
          "Phase 2: Store events in SQLite with indexed timestamps and status codes",
          "Phase 3: Implement rolling frequency counter for 4xx/5xx burst detection",
          "Phase 4: Build REST summary endpoint and write unit tests",
        ],
        vivaQuestions: [
          "How would you scale this parser to handle 50,000 logs/second without memory exhaustion?",
          "Why choose a rolling window counter instead of periodic batch queries?",
        ],
      },
      {
        title: "Distributed Task Queue with Worker Heartbeats",
        summary:
          "Lightweight producer-consumer task queue with task retries, timeout expiration, and status dashboard.",
        difficulty: "Intermediate",
        timeline: "3 Weeks",
        technologies: ["Python / Node.js", "Redis / SQLite", "Concurrency"],
        resumeValue:
          "High-yield distributed systems project proving concurrency and reliability thinking.",
        architecture:
          "Client Producer -> FIFO Queue Store -> Concurrent Worker Pool -> Dead Letter Queue",
        suggestedMilestones: [
          "Phase 1: Define task payload format and state enum (queued, active, done, failed)",
          "Phase 2: Implement polling worker with timeout recovery",
          "Phase 3: Add exponential backoff retry logic for failed jobs",
          "Phase 4: Package into CLI with start-worker and enqueue commands",
        ],
        vivaQuestions: [
          "What happens if a worker crashes halfway through processing a task?",
          "How do you prevent two workers from picking up the exact same task simultaneously?",
        ],
      },
      {
        title: "Predictive Energy & Resource Demand Forecaster",
        summary:
          "Time-series forecasting model estimating resource spikes and power load based on historical trends.",
        difficulty: "Intermediate",
        timeline: "2 Weeks",
        technologies: ["Python", "Pandas", "Scikit-Learn", "Matplotlib"],
        resumeValue:
          "Shows real-world ML application beyond toy datasets with proper cross-validation.",
        architecture:
          "CSV Data Pipeline -> Feature Engineering -> Regressor / Prophet Model -> Evaluation Dashboard",
        suggestedMilestones: [
          "Phase 1: Clean raw hourly metrics and engineer lag and rolling mean features",
          "Phase 2: Train Random Forest / Ridge baseline models and evaluate RMSE",
          "Phase 3: Export predictions and generate interactive drift visualization",
          "Phase 4: Document assumptions and model trade-offs in GitHub README",
        ],
        vivaQuestions: [
          "Why is standard k-fold cross-validation inappropriate for time-series data?",
          "How did you address seasonality and holiday outliers?",
        ],
      },
      {
        title: "Autonomous Network Port Scanner & CVE Correlator",
        summary:
          "Multi-threaded network probe inspecting open TCP ports and querying known vulnerabilities.",
        difficulty: "Advanced",
        timeline: "3 Weeks",
        technologies: ["Python / Go", "Sockets", "NVD API", "Linux"],
        resumeValue:
          "Exceptional for Cybersecurity & DevOps roles demonstrating raw network sockets and security hygiene.",
        architecture:
          "Socket Worker Pool -> Banner Grabber -> CVE Database Matcher -> JSON Report Generator",
        suggestedMilestones: [
          "Phase 1: Implement non-blocking TCP socket connect loop with timeout guards",
          "Phase 2: Extract service banner strings (SSH, HTTP, FTP, SMTP)",
          "Phase 3: Query local or remote vulnerability database for matching versions",
          "Phase 4: Generate executive PDF / markdown audit report",
        ],
        vivaQuestions: [
          "What is the difference between a TCP SYN half-open scan and a full TCP handshake connect?",
          "How do you ensure ethical boundaries and prevent network congestion?",
        ],
      },
      {
        title: "Real-Time Embedded Sensor Telemetry & MQTT Broker",
        summary:
          "Microcontroller or simulator sending temperature, vibration, and current metrics over MQTT with threshold triggers.",
        difficulty: "Intermediate",
        timeline: "2-3 Weeks",
        technologies: ["C++ / Python", "MQTT", "ESP32 Simulator / Linux", "SQLite"],
        resumeValue:
          "Crucial for ECE, Robotics, and IoT students bridging hardware telemetry with cloud dashboards.",
        architecture: "Sensor Node -> MQTT Publisher -> Broker -> Telemetry Ingester -> Live Chart",
        suggestedMilestones: [
          "Phase 1: Establish MQTT publisher with structured JSON payloads",
          "Phase 2: Subscribe to topic and persist readings to SQLite time-series table",
          "Phase 3: Add threshold trigger for anomalous temperature/vibration spikes",
          "Phase 4: Document wiring schematics, power consumption, and packet loss stats",
        ],
        vivaQuestions: [
          "Why is MQTT chosen over HTTP for low-power microcontroller communication?",
          "How does MQTT QoS (Quality of Service 0, 1, 2) affect battery life and network latency?",
        ],
      },
    ];

    return { projects: fallbackProjects };
  });

const codeActionSchema = z.object({
  action: z.enum(["explain", "debug", "optimize", "hint", "complexity", "testcases"]),
  language: z.string(),
  code: z.string().max(8000),
  context: z.string().optional(),
});

export const requestAiCodeAction = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => codeActionSchema.parse(data))
  .handler(async ({ data }) => {
    const { action, language, code, context } = data;
    const apiKey = process.env["GEMINI_API_KEY"] || process.env["LOVABLE_API_KEY"];

    const promptMap = {
      explain: `Explain this ${language} code clearly for an engineering student. Break down the logic line-by-line, and explain how data flows through variables.`,
      debug: `Inspect this ${language} code for logic errors, syntax bugs, boundary conditions, or unhandled exceptions. If you find bugs, point out the exact lines and show the corrected code.`,
      optimize: `Analyze this ${language} code for performance bottlenecks. Suggest an optimized version with lower time or space complexity and explain why the change helps.`,
      hint: `Give a subtle, pedagogical hint for this ${language} code without giving away the full solution. Guide the student's problem-solving intuition.`,
      complexity: `Analyze the exact Big-O Time Complexity and Space Complexity of this ${language} code. Explain best-case, average-case, and worst-case scenarios.`,
      testcases: `Generate 5 comprehensive test cases (including typical inputs, edge cases like 0, empty, or negative values, and large inputs) for this ${language} program.`,
    };

    const instruction = promptMap[action];

    if (apiKey) {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `${instruction}\n\nLanguage: ${language}\nContext: ${context || "None"}\n\n\`\`\`${language}\n${code}\n\`\`\``,
        });

        const text = response.text?.trim();
        if (text) return { result: text };
      } catch (err) {
        console.warn("[EngineerOS] Gemini API error, using structured fallback:", err);
      }
    }

    // High quality pedagogical fallbacks when API key is not present or offline
    switch (action) {
      case "complexity":
        return {
          result: `### Complexity Analysis (${language.toUpperCase()})
- **Time Complexity:** $O(n)$ in general loops; if nested, $O(n^2)$; for binary search or tree height, $O(\\log n)$.
- **Space Complexity:** $O(1)$ auxiliary space if modifying in-place; $O(n)$ if storing collections or call stack recursion depth.
- **Optimization Strategy:** Consider using a hash map or two-pointer sweep to eliminate nested loops and achieve optimal linear time.`,
        };
      case "optimize":
        return {
          result: `### Optimization Strategy
1. **Reduce Redundant Allocations**: Avoid creating new objects or arrays inside tight loop iterations.
2. **Lookup Efficiency**: Replace linear array scans (\`indexOf\`, \`includes\`) with a Set or Map lookup ($O(1)$ average time).
3. **Early Exit**: Add guard clauses at the top of your function to immediately return on trivial or edge cases.`,
        };
      case "debug":
        return {
          result: `### Code Inspection Checklist
- **Boundary Conditions**: Check empty collections, array index bounds \`[0]\` to \`[n-1]\`, and zero or null inputs.
- **Type Safety**: Ensure arithmetic isn't concatenating strings or overflowing precision.
- **Return Contract**: Verify your function returns the expected data type on every conditional branch.`,
        };
      case "hint":
        return {
          result: `💡 **Mentor Hint:** Notice how state changes from one iteration to the next. What if you stored previous values in a hash map so you don't need to re-scan the array?`,
        };
      case "testcases":
        return {
          result: `### Suggested Test Cases
1. **Standard Input:** Typical average case with multiple elements.
2. **Empty / Trivial:** \`[]\` or \`""\` or single element.
3. **Duplicates:** Array or string containing repeated elements.
4. **Boundary Limits:** Very large values or negative numbers.
5. **Worst Case:** Sorted array in reverse order or already optimal.`,
        };
      case "explain":
      default:
        return {
          result: `### Code Walkthrough (${language.toUpperCase()})
This program sets up input variables, iterates through the problem domain, and applies operations to generate the target result.
- **Input handling:** Declares arguments and boundary checks.
- **Processing loop:** Accumulates state or evaluates conditions.
- **Output:** Returns or logs the computed value to stdout.`,
        };
    }
  });
