// EngineerOS Kernel Auditor (AI Mentor v3) - Cross-referencing Claims vs Proof-of-Work

import { loadKernelState, logToSyslog } from "./kernel";
import { loadProofArtifacts, type ProofArtifact } from "./proof-wall";
import { loadSkillMemoryPages, type SkillMemoryPage } from "./memory-management";

export interface AuditFinding {
  id: string;
  severity: "CRITICAL" | "WARNING" | "VERIFIED";
  skillClaim: string;
  proofEvidence: string;
  auditVerdict: string;
  correctiveMission: {
    title: string;
    description: string;
    route: string;
    actionLabel: string;
    xpReward: number;
  };
}

export interface SystemAuditReport {
  id: string;
  timestamp: string;
  overallHealthPercent: number;
  claimsAuditedCount: number;
  verifiedCount: number;
  discrepanciesCount: number;
  findings: AuditFinding[];
  auditorSummary: string;
}

export function runKernelSystemAudit(): SystemAuditReport {
  const kernel = loadKernelState();
  const proofs = loadProofArtifacts();
  const memoryPages = loadSkillMemoryPages();

  const findings: AuditFinding[] = [];

  // Check 1: Pointers verification
  const pointerProofs = proofs.filter(
    (p) =>
      p.tags.includes("pointers") ||
      p.tags.includes("c") ||
      p.title.toLowerCase().includes("pointer"),
  );
  const pointerMemory = memoryPages.find((m) => m.id === "mem-c-pointers");

  if (pointerProofs.length === 0 || (pointerMemory && pointerMemory.state === "SWAPPED_TO_DISK")) {
    findings.push({
      id: "audit-1",
      severity: "CRITICAL",
      skillClaim: "Claimed competency: C Memory Pointers & Dynamic Allocation",
      proofEvidence: `Proof Wall shows ${pointerProofs.length} test-case executions. Skill memory state is '${pointerMemory?.state || "SWAPPED"}'.`,
      auditVerdict:
        "CONTRADICTION DETECTED: Claimed complete, but 0 verifiable test runs exist in proof ledger. Memory leak in claims.",
      correctiveMission: {
        title: "Verify Pointer Arithmetic",
        description:
          "Write and execute a pointer swap function on the Code Lab to produce a cryptographic proof receipt.",
        route: "/code-lab",
        actionLabel: "Launch Code Lab Drill",
        xpReward: 35,
      },
    });
  }

  // Check 2: Two Pointers DSA verification
  const dsaProofs = proofs.filter(
    (p) =>
      p.tags.includes("two-pointers") ||
      p.tags.includes("dsa") ||
      p.title.toLowerCase().includes("two sum"),
  );
  if (dsaProofs.length > 0) {
    findings.push({
      id: "audit-2",
      severity: "VERIFIED",
      skillClaim: "DSA Pattern: Two Pointers",
      proofEvidence: `Verified: ${dsaProofs[0]?.title} passed with receipt ${dsaProofs[0]?.shaReceipt}.`,
      auditVerdict:
        "VERIFIED PROOF: Claim backed by executed test cases and clean runtime latency.",
      correctiveMission: {
        title: "Maintain Two-Pointers Retention",
        description: "Keep algo-heartbeat.daemon alive with 1 weekly pattern run.",
        route: "/dsa",
        actionLabel: "View DSA Hub",
        xpReward: 15,
      },
    });
  }

  // Check 3: Concurrency / Deadlocks verification
  const osMemory = memoryPages.find((m) => m.id === "mem-os-concurrency");
  if (osMemory && osMemory.state === "AT_RISK_OOM_KILL") {
    findings.push({
      id: "audit-3",
      severity: "WARNING",
      skillClaim: "Systems: Concurrency & Deadlocks",
      proofEvidence: `Last active recall was ${osMemory.daysSinceLastRecall} days ago. Retention degraded to ${osMemory.retentionPercent}%.`,
      auditVerdict:
        "MEMORY SWAP RISK: Concept approaching OOM-kill decay without recent retrieval drill.",
      correctiveMission: {
        title: "Page In Concurrency Concepts",
        description: "Complete a 3-question memory page-in drill to restore retention to 100%.",
        route: "/dashboard",
        actionLabel: "Page In Concept Now",
        xpReward: 25,
      },
    });
  }

  // Check 4: Linux Shell
  const linuxProofs = proofs.filter((p) => p.tags.includes("linux"));
  if (linuxProofs.length > 0) {
    findings.push({
      id: "audit-4",
      severity: "VERIFIED",
      skillClaim: "Linux Shell & Permissions",
      proofEvidence: `Verified: ${linuxProofs[0]?.title} logged on Proof Wall.`,
      auditVerdict:
        "VERIFIED PROOF: Octal permissions and piping drills validated by session audit.",
      correctiveMission: {
        title: "Advance to Shell Automation",
        description: "Write a bash automation script in the Linux Academy.",
        route: "/linux",
        actionLabel: "Open Linux Academy",
        xpReward: 30,
      },
    });
  }

  const verifiedCount = findings.filter((f) => f.severity === "VERIFIED").length;
  const discrepanciesCount = findings.filter((f) => f.severity !== "VERIFIED").length;
  const overallHealthPercent = Math.round((verifiedCount / Math.max(1, findings.length)) * 100);

  const report: SystemAuditReport = {
    id: `audit-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    overallHealthPercent,
    claimsAuditedCount: findings.length,
    verifiedCount,
    discrepanciesCount,
    findings,
    auditorSummary:
      discrepanciesCount === 0
        ? "Kernel Audit Clean: All engineering claims are validated by verifiable Proof Wall receipts."
        : `Kernel Audit Complete: Found ${discrepanciesCount} claim contradiction(s). Issue corrective missions immediately to eliminate resume debt.`,
  };

  logToSyslog(
    "AUDITOR",
    discrepanciesCount > 0 ? "WARN" : "OK",
    `System Audit executed. Health: ${overallHealthPercent}%. ${discrepanciesCount} discrepancies flagged for corrective action.`,
  );

  return report;
}
