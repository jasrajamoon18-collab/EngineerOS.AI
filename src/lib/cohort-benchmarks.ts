// EngineerOS Cohort Benchmarking Engine (Non-toxic, Anonymized Peer Calibration)

export interface CohortMetric {
  id: string;
  topic: string;
  category: "DSA" | "Systems" | "Consistency" | "Proof-of-Work" | "Academics";
  userScore: number;
  percentile: number; // e.g. 86 means "Top 14%"
  comparisonGroup: string; // e.g. "3rd Year CSE (Tier 2 Colleges)"
  insight: string;
  status: "strong" | "on_track" | "needs_attention";
}

export interface StudentCohortBenchmark {
  branch: string;
  year: number;
  collegeTier: string;
  totalBatchSample: number;
  lastCalculatedDate: string;
  overallPercentile: number;
  metrics: CohortMetric[];
}

export function getCohortBenchmarks(
  branch = "Computer Science & Engineering",
  year = 3,
  collegeTier = "Tier 2 (State Govt/Reputed)",
): StudentCohortBenchmark {
  const comparisonGroup = `${year}${year === 1 ? "st" : year === 2 ? "nd" : year === 3 ? "rd" : "th"} Year ${branch.split("&")[0]?.trim()} (${collegeTier.split("(")[0]?.trim()})`;

  return {
    branch,
    year,
    collegeTier,
    totalBatchSample: 1420,
    lastCalculatedDate: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    overallPercentile: 82, // Top 18%
    metrics: [
      {
        id: "cohort-pointers",
        topic: "Pointers & Memory Architecture",
        category: "Systems",
        userScore: 78,
        percentile: 82,
        comparisonGroup,
        insight:
          "You are in the top 18% of your batch in C/C++ memory addressing & pointer arithmetic.",
        status: "strong",
      },
      {
        id: "cohort-two-pointers",
        topic: "Two Pointers & Sliding Window DSA",
        category: "DSA",
        userScore: 84,
        percentile: 88,
        comparisonGroup,
        insight: "You are in the top 12% of your cohort in array two-pointer algorithmic patterns.",
        status: "strong",
      },
      {
        id: "cohort-daemons",
        topic: "Daemon Habit Consistency (Streaks)",
        category: "Consistency",
        userScore: 76,
        percentile: 79,
        comparisonGroup,
        insight: "You are in the top 21% for sustained daily background habit heartbeats.",
        status: "on_track",
      },
      {
        id: "cohort-proof",
        topic: "Verified Proof Wall Artifacts",
        category: "Proof-of-Work",
        userScore: 85,
        percentile: 91,
        comparisonGroup,
        insight: "Top 9% in verifiable code execution receipts vs tutorial consumption.",
        status: "strong",
      },
      {
        id: "cohort-concurrency",
        topic: "Operating Systems Concurrency & Deadlocks",
        category: "Academics",
        userScore: 54,
        percentile: 58,
        comparisonGroup,
        insight:
          "You are in the 58th percentile in deadlocks. Review Coffman conditions to advance to top quartile.",
        status: "needs_attention",
      },
    ],
  };
}
