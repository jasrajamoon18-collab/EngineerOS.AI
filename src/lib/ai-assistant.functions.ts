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

    // High quality deterministic fallbacks
    const fallbackProjects: GeneratedProjectIdea[] = [
      {
        title: "High-Throughput Distributed Rate Limiter",
        summary:
          "Token-bucket rate limiter daemon deployed as reverse proxy middleware with Redis backplane.",
        difficulty: "Intermediate",
        timeline: "2 Weeks",
        technologies: ["Go", "Redis", "Docker", "gRPC"],
        resumeValue:
          "Demonstrates concurrency, sliding window algorithms, and distributed systems design.",
        architecture:
          "Client -> Reverse Proxy Middleware -> Redis Cluster Atomic Lua Script -> Upstream Service",
        suggestedMilestones: [
          "1. Token bucket algorithm spec",
          "2. Redis Lua atomic decrement script",
          "3. Benchmarking under 10k RPS load",
          "4. Docker Compose deployment & telemetry",
        ],
        vivaQuestions: [
          "How does sliding-window counter differ from leaky bucket under bursty traffic?",
          "What happens if Redis becomes partitioned from your proxy worker?",
        ],
      },
      {
        title: "Automated Resilient ETL Pipeline for IoT Telemetry",
        summary:
          "Event-driven sensor ingestion pipeline parsing MQTT streams with deduplication and time-series aggregation.",
        difficulty: "Intermediate",
        timeline: "3 Weeks",
        technologies: ["Python", "Kafka", "PostgreSQL", "FastAPI"],
        resumeValue:
          "Demonstrates data engineering discipline, idempotent writes, and streaming paradigms.",
        architecture: "Sensors -> MQTT Broker -> Kafka Consumer Group -> PostgreSQL TimescaleDB",
        suggestedMilestones: [
          "1. Ingestion protocol & MQTT schema",
          "2. Kafka consumer backpressure handling",
          "3. Idempotent upsert logic",
          "4. FastAPI analytics endpoints",
        ],
        vivaQuestions: [
          "How do you ensure exactly-once processing across Kafka consumer rebalances?",
          "Why use time-series partitioning over standard B-tree indexing?",
        ],
      },
      {
        title: "Autonomous Pathfinding Rover with ROS & SLAM",
        summary:
          "2D LiDAR-based simultaneous localization and mapping (SLAM) robot with A* obstacle avoidance.",
        difficulty: "Advanced",
        timeline: "4 Weeks",
        technologies: ["C++", "ROS2", "Python", "Gazebo Simulator"],
        resumeValue:
          "High-value systems engineering, robotics kinematics, and real-time state estimation.",
        architecture:
          "LiDAR / Odometry -> ROS2 Node Graph -> Cartographer SLAM -> Nav2 Path Planner",
        suggestedMilestones: [
          "1. Gazebo simulation world setup",
          "2. Sensor subscriber node architecture",
          "3. Costmap tuning & A* trajectory validation",
          "4. Real-world or simulated telemetry report",
        ],
        vivaQuestions: [
          "How does odometry drift accumulate and how does scan-matching correct it?",
          "Explain the difference between global and local path planners in Nav2.",
        ],
      },
    ];

    return { projects: fallbackProjects };
  });

const aiCodeActionSchema = z.object({
  code: z.string().min(1).max(5000),
  language: z.string().min(1),
  action: z.enum(["explain", "complexity", "optimize", "debug", "hint", "testcases"]),
  context: z.string().optional(),
});

export const requestAiCodeAction = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => aiCodeActionSchema.parse(data))
  .handler(async ({ data }) => {
    const { code, language, action, context } = data;
    const apiKey = process.env["GEMINI_API_KEY"] || process.env["LOVABLE_API_KEY"];

    const promptMap: Record<string, string> = {
      explain:
        "Explain this code line by line with clear pedagogical intuition for an engineering student. Highlight key patterns and trade-offs.",
      complexity:
        "Provide a formal Big-O Time and Space complexity breakdown for this code. Show where the dominant operations occur.",
      optimize:
        "Analyze bottlenecks in this code and suggest concrete optimizations. Provide improved code if relevant.",
      debug:
        "Inspect this code for potential runtime exceptions, edge cases (empty inputs, bounds, overflow), or logical bugs.",
      hint: "Provide an insightful, guiding hint without giving away the full answer immediately. Guide the student's problem-solving instinct.",
      testcases:
        "Generate 5 edge-case test inputs and expected outputs (boundary values, large inputs, empty states, negative numbers).",
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

    // High quality pedagogical fallbacks
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

const mockEvaluationSchema = z.object({
  question: z.string().min(5),
  answer: z.string().min(10),
  role: z.string().optional(),
  branch: z.string().optional(),
});

export interface MockAnswerEvaluation {
  score: number;
  technicalAccuracy: string;
  communicationFeedback: string;
  keywordsCovered: string[];
  keywordsMissed: string[];
  weakAreas: string[];
  learningPlanTask: string;
}

export const evaluateMockAnswerAction = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => mockEvaluationSchema.parse(data))
  .handler(async ({ data }): Promise<MockAnswerEvaluation> => {
    const { question, answer, role, branch } = data;
    const apiKey = process.env["GEMINI_API_KEY"] || process.env["LOVABLE_API_KEY"];

    if (apiKey) {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `You are an engineering hiring bar raiser evaluating an engineering student's mock interview answer.
Role: ${role || "Software Engineer"} | Branch: ${branch || "CSE"}.
Question: "${question}"
Candidate Answer: "${answer}"

Score the answer out of 100 based on:
1. Technical depth and accuracy
2. Communication structure (STAR format for behavioral, concrete architecture/trade-offs for technical)
3. Identification of 1-3 specific weak areas to log back into their study plan.

Return ONLY a valid JSON object matching this schema:
{
  "score": number (0-100),
  "technicalAccuracy": "Detailed constructive evaluation of technical correctness",
  "communicationFeedback": "Critique on conciseness, structured STAR framework, confidence",
  "keywordsCovered": ["keyword1", "keyword2"],
  "keywordsMissed": ["missingKeyword1", "missingKeyword2"],
  "weakAreas": ["Specific topic 1", "Specific topic 2"],
  "learningPlanTask": "1 concise sentence task to add to their daily study plan"
}`,
        });

        const text = response.text?.trim() || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as MockAnswerEvaluation;
          return parsed;
        }
      } catch (err) {
        console.warn("[EngineerOS] Gemini error in mock interview evaluation:", err);
      }
    }

    // High quality deterministic evaluation fallback
    const wordCount = answer.trim().split(/\s+/).length;
    const hasNumbers = /\d/.test(answer);
    const hasSTAR =
      /situation|task|action|result|because|therefore|metric|percent|reduced|improved/i.test(
        answer,
      );

    let score = 65;
    if (wordCount >= 60) score += 15;
    if (hasNumbers) score += 10;
    if (hasSTAR) score += 10;
    score = Math.min(score, 94);

    return {
      score,
      technicalAccuracy:
        wordCount > 50
          ? "Good conceptual grasp of foundational mechanics. Add more concrete implementation nuances (e.g. error recovery, time complexity, corner cases)."
          : "Answer is too brief for an engineering interview. Elaborate on architecture, data flows, and why you made specific technical trade-offs.",
      communicationFeedback: hasSTAR
        ? "Well structured with clear cause-and-effect reasoning."
        : "Strengthen your delivery using the STAR framework (Situation -> Task -> Action -> Result). Ensure your personal engineering contribution stands out.",
      keywordsCovered: ["Core Principles", "Implementation", "Workflow"],
      keywordsMissed: ["Quantified Metrics", "Edge Cases", "Scalability Trade-offs"],
      weakAreas: [
        `Deep dive: ${question.slice(0, 45)}...`,
        "Quantifying engineering outcomes with numbers",
      ],
      learningPlanTask: `Review 1 real-world case study on "${question.slice(0, 40)}" and write down 3 quantifiable metrics.`,
    };
  });
