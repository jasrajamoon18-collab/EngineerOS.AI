// EngineerOS Proof-of-Work Wall & Tutorial Hell Detector

import { logToSyslog } from "./kernel";

export type ProofArtifactType =
  | "code_execution"
  | "terminal_session"
  | "mock_interview"
  | "git_commit"
  | "milestone_ship"
  | "streak_receipt";

export interface ProofArtifact {
  id: string;
  type: ProofArtifactType;
  title: string;
  summary: string;
  timestamp: string; // ISO date
  shaReceipt: string; // Cryptographic-style verification token
  metrics: {
    durationMs?: number;
    testsPassed?: number;
    testsTotal?: number;
    score?: number;
    language?: string;
    commitSha?: string;
  };
  tags: string[];
  isVerified: boolean;
}

const POW_STORAGE_KEY = "engineeros_proof_artifacts_v1";

export const SAMPLE_PROOF_ARTIFACTS: ProofArtifact[] = [
  {
    id: "pow-1",
    type: "code_execution",
    title: "Two Sum — Optimal Two-Pointers in Python",
    summary: "Executed against 2 visible and 2 hidden test cases. Memory: 52MB, Latency: 18ms.",
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
    shaReceipt: "POW-SHA256-8F4C2A19E5B3D740",
    metrics: {
      language: "python",
      durationMs: 18,
      testsPassed: 4,
      testsTotal: 4,
    },
    tags: ["python", "two-pointers", "accepted"],
    isVerified: true,
  },
  {
    id: "pow-2",
    type: "terminal_session",
    title: "Linux File Permissions & Pipe Redirection Drill",
    summary:
      "Successfully executed chmod 755, find /var/log -type f | grep error, and usergroup audit.",
    timestamp: new Date(Date.now() - 18 * 3600000).toISOString(),
    shaReceipt: "POW-SHA256-3E7A91F0B8D24C16",
    metrics: {
      durationMs: 420000,
      score: 100,
    },
    tags: ["linux", "bash", "permissions", "pipes"],
    isVerified: true,
  },
  {
    id: "pow-3",
    type: "mock_interview",
    title: "Backend Engineer AI Mock: Concurrency & Database Sharding",
    summary: "Answered with live speech transcription. Rubric evaluation: 88/100, Latency: 2.1s.",
    timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
    shaReceipt: "POW-SHA256-A1D85F3B7C902E44",
    metrics: {
      score: 88,
      durationMs: 640000,
    },
    tags: ["interview", "backend", "concurrency"],
    isVerified: true,
  },
  {
    id: "pow-4",
    type: "git_commit",
    title: "Git Commit: Memory Pool Allocator Implementation",
    summary: "Merged branch feature/memory-pool into main. Verified clean git tree receipt.",
    timestamp: new Date(Date.now() - 72 * 3600000).toISOString(),
    shaReceipt: "POW-SHA256-4B8C1D9E7F2A0356",
    metrics: {
      commitSha: "9f3e4a2",
    },
    tags: ["git", "c", "systems"],
    isVerified: true,
  },
  {
    id: "pow-5",
    type: "streak_receipt",
    title: "7-Day Unbroken Habit Receipt",
    summary:
      "All 5 background daemons maintained minimum 1 daily heartbeat across 7 consecutive calendar days.",
    timestamp: new Date(Date.now() - 96 * 3600000).toISOString(),
    shaReceipt: "POW-SHA256-6E2D9A1F4C803B57",
    metrics: {
      score: 7,
    },
    tags: ["streak", "consistency", "daemons"],
    isVerified: true,
  },
];

export function loadProofArtifacts(): ProofArtifact[] {
  if (typeof window === "undefined") return SAMPLE_PROOF_ARTIFACTS;
  try {
    const raw = localStorage.getItem(POW_STORAGE_KEY);
    if (!raw) {
      saveProofArtifacts(SAMPLE_PROOF_ARTIFACTS);
      return SAMPLE_PROOF_ARTIFACTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("[ProofWall] Failed to load artifacts:", err);
    return SAMPLE_PROOF_ARTIFACTS;
  }
}

export function saveProofArtifacts(artifacts: ProofArtifact[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(POW_STORAGE_KEY, JSON.stringify(artifacts));
    window.dispatchEvent(new CustomEvent("engineeros:proof-updated", { detail: artifacts }));
  } catch (err) {
    console.error("[ProofWall] Failed to save artifacts:", err);
  }
}

/**
 * Record a new proof-of-work receipt
 */
export function recordProofArtifact(
  artifact: Omit<ProofArtifact, "id" | "timestamp" | "shaReceipt" | "isVerified">,
): ProofArtifact {
  const current = loadProofArtifacts();
  const hexHash =
    Math.random().toString(16).substring(2, 10).toUpperCase() +
    Math.random().toString(16).substring(2, 10).toUpperCase();
  const newReceipt: ProofArtifact = {
    ...artifact,
    id: `pow-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    shaReceipt: `POW-SHA256-${hexHash}`,
    isVerified: true,
  };

  const updated = [newReceipt, ...current];
  saveProofArtifacts(updated);

  logToSyslog(
    "POW",
    "OK",
    `New artifact logged: ${newReceipt.title} [${newReceipt.shaReceipt}]. Proof wall updated.`,
  );

  return newReceipt;
}

/**
 * Tutorial Hell Analysis
 * Compares passive watch/reading time with active building/code execution time over last 7 days.
 */
export interface TutorialHellAnalysis {
  watchHours: number;
  buildHours: number;
  ratio: number;
  isTutorialHell: boolean;
  statusText: string;
  lockedReason?: string;
  requiredActionPrompt: string;
  requiredActionRoute: string;
}

export function analyzeTutorialHell(
  buildSeconds: number,
  watchSeconds: number,
): TutorialHellAnalysis {
  const buildHours = Math.max(0.1, Number((buildSeconds / 3600).toFixed(1)));
  const watchHours = Math.max(0.1, Number((watchSeconds / 3600).toFixed(1)));
  const ratio = Number((watchHours / buildHours).toFixed(2));

  // If student watches/reads more than 3x what they build/code
  const isTutorialHell = ratio > 2.8;

  if (isTutorialHell) {
    return {
      watchHours,
      buildHours,
      ratio,
      isTutorialHell: true,
      statusText: "RESOURCE_STARVATION: BUILD_DEFICIT",
      lockedReason: `Tutorial Hell Detected: Consumption-to-build ratio is ${ratio}x (threshold 2.8x). Passive reading is temporarily throttled until you write & run code.`,
      requiredActionPrompt:
        "Ship First: Run code in Code Lab or solve 1 DSA challenge to unlock next theory modules.",
      requiredActionRoute: "/code-lab",
    };
  }

  return {
    watchHours,
    buildHours,
    ratio,
    isTutorialHell: false,
    statusText: "HEALTHY_KERNEL_EXECUTION",
    requiredActionPrompt:
      "System balanced. Continue healthy rhythm of learning and instant verification.",
    requiredActionRoute: "/dsa",
  };
}
