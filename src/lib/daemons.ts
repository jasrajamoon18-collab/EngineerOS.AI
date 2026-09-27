// EngineerOS Daemons - Background Habit Engine with PID, Heartbeat & Crash Detection

import { logToSyslog } from "./kernel";

export interface DaemonProcess {
  pid: number;
  id: string;
  name: string;
  command: string;
  description: string;
  status: "running" | "idle" | "crashed" | "stopped";
  intervalHours: number;
  lastHeartbeat: string; // ISO date
  streakDays: number;
  xpPerTick: number;
  totalXpGenerated: number;
  restartMissionPrompt: string;
  restartRoute: string;
}

const DAEMONS_STORAGE_KEY = "engineeros_daemons_state_v1";

export const INITIAL_DAEMONS: DaemonProcess[] = [
  {
    pid: 1024,
    id: "man-daemon",
    name: "man-page.daemon",
    command: "/usr/bin/mand --daily",
    description: "Daily Linux man page or command inspection habit. Keeps shell reflexes sharp.",
    status: "running",
    intervalHours: 24,
    lastHeartbeat: new Date(Date.now() - 14 * 3600000).toISOString(), // 14h ago -> running
    streakDays: 6,
    xpPerTick: 15,
    totalXpGenerated: 90,
    restartMissionPrompt:
      "Inspect `chmod` or `grep` flags in the Linux Academy for 2 minutes to revive daemon.",
    restartRoute: "/linux",
  },
  {
    pid: 1025,
    id: "git-sync-daemon",
    name: "git-commit.daemon",
    command: "/usr/bin/gitd --check-daily-sha",
    description: "Monitors daily git commit activity or repository push receipt.",
    status: "running",
    intervalHours: 24,
    lastHeartbeat: new Date(Date.now() - 20 * 3600000).toISOString(),
    streakDays: 4,
    xpPerTick: 20,
    totalXpGenerated: 80,
    restartMissionPrompt: "Stage, commit, or review a git branch in the Git Hub to revive daemon.",
    restartRoute: "/git",
  },
  {
    pid: 1026,
    id: "algo-tick-daemon",
    name: "algo-heartbeat.daemon",
    command: "/usr/bin/algod --pattern-tick",
    description: "Triggers 1 DSA pattern drill heartbeat to prevent algorithmic memory decay.",
    status: "crashed", // Intentionally crashed (e.g. 4 days ago) so user experiences the recovery mechanic!
    intervalHours: 24,
    lastHeartbeat: new Date(Date.now() - 84 * 3600000).toISOString(), // 3.5 days ago -> CRASHED!
    streakDays: 0,
    xpPerTick: 25,
    totalXpGenerated: 125,
    restartMissionPrompt:
      "Run a 2-minute quick two-pointers check to revive algo-heartbeat.daemon!",
    restartRoute: "/dsa",
  },
  {
    pid: 1027,
    id: "vocab-daemon",
    name: "eng-vocab.daemon",
    command: "/usr/bin/vocabd --retrieval-3x",
    description: "Loads 3 technical engineering terms into active vocabulary daily.",
    status: "running",
    intervalHours: 24,
    lastHeartbeat: new Date(Date.now() - 6 * 3600000).toISOString(),
    streakDays: 9,
    xpPerTick: 10,
    totalXpGenerated: 90,
    restartMissionPrompt: "Review 3 technical communication terms in Communication Hub.",
    restartRoute: "/communication",
  },
  {
    pid: 1028,
    id: "proof-sync-daemon",
    name: "proof-wall.daemon",
    command: "/usr/bin/powd --audit-sync",
    description: "Periodically pushes verified test runs & milestones to your Proof-of-Work wall.",
    status: "running",
    intervalHours: 48,
    lastHeartbeat: new Date(Date.now() - 12 * 3600000).toISOString(),
    streakDays: 5,
    xpPerTick: 30,
    totalXpGenerated: 150,
    restartMissionPrompt: "Run 1 test on Code Lab to generate fresh proof-of-work receipt.",
    restartRoute: "/code-lab",
  },
];

export function loadDaemons(): DaemonProcess[] {
  if (typeof window === "undefined") return INITIAL_DAEMONS;
  try {
    const raw = localStorage.getItem(DAEMONS_STORAGE_KEY);
    if (!raw) {
      saveDaemons(INITIAL_DAEMONS);
      return INITIAL_DAEMONS;
    }
    const list: DaemonProcess[] = JSON.parse(raw);

    // Auto-check for crashes: if lastHeartbeat > 72h (3 days) ago and status was running
    const now = Date.now();
    let mutated = false;
    const checked = list.map((d) => {
      const diffMs = now - new Date(d.lastHeartbeat).getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours >= 72 && d.status === "running") {
        mutated = true;
        logToSyslog(
          "DAEMON",
          "CRIT",
          `Process SIGSTOP: daemon [${d.name}] PID ${d.pid} crashed due to 72h inactivity.`,
        );
        return { ...d, status: "crashed" as const, streakDays: 0 };
      }
      return d;
    });

    if (mutated) {
      saveDaemons(checked);
    }
    return checked;
  } catch (err) {
    console.error("[Daemons] Failed to load daemons:", err);
    return INITIAL_DAEMONS;
  }
}

export function saveDaemons(daemons: DaemonProcess[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DAEMONS_STORAGE_KEY, JSON.stringify(daemons));
    window.dispatchEvent(new CustomEvent("engineeros:daemons-updated", { detail: daemons }));
  } catch (err) {
    console.error("[Daemons] Failed to save daemons:", err);
  }
}

/**
 * Ping / Trigger heartbeat for a daemon (e.g. user performed the habit)
 */
export function sendDaemonHeartbeat(daemonId: string): {
  success: boolean;
  xpEarned: number;
  daemonName: string;
} {
  const list = loadDaemons();
  const daemon = list.find((d) => d.id === daemonId);
  if (!daemon) return { success: false, xpEarned: 0, daemonName: "" };

  const wasCrashed = daemon.status === "crashed";
  const updatedList = list.map((d) => {
    if (d.id === daemonId) {
      return {
        ...d,
        status: "running" as const,
        lastHeartbeat: new Date().toISOString(),
        streakDays: wasCrashed ? 1 : d.streakDays + 1,
        totalXpGenerated: d.totalXpGenerated + d.xpPerTick,
      };
    }
    return d;
  });

  saveDaemons(updatedList);
  logToSyslog(
    "DAEMON",
    "OK",
    wasCrashed
      ? `Process [${daemon.name}] PID ${daemon.pid} revived successfully! System habit restored.`
      : `Daemon [${daemon.name}] PID ${daemon.pid} heartbeat processed. +${daemon.xpPerTick} XP logged.`,
  );

  return { success: true, xpEarned: daemon.xpPerTick, daemonName: daemon.name };
}

/**
 * Restart/Revive a crashed daemon
 */
export function reviveDaemon(daemonId: string): { success: boolean; daemon: DaemonProcess | null } {
  const list = loadDaemons();
  const daemon = list.find((d) => d.id === daemonId);
  if (!daemon) return { success: false, daemon: null };

  const newPid = Math.floor(1000 + Math.random() * 8000);
  const updated = list.map((d) => {
    if (d.id === daemonId) {
      return {
        ...d,
        pid: newPid,
        status: "running" as const,
        lastHeartbeat: new Date().toISOString(),
        streakDays: 1,
        totalXpGenerated: d.totalXpGenerated + 10, // Recovery bonus
      };
    }
    return d;
  });

  saveDaemons(updated);
  logToSyslog(
    "DAEMON",
    "OK",
    `SIGCONT: Daemon [${daemon.name}] revived with new PID ${newPid}. Heartbeat timer refreshed.`,
  );

  return { success: true, daemon: updated.find((d) => d.id === daemonId) || null };
}

/**
 * Toggle start/stop daemon process
 */
export function toggleDaemonStatus(daemonId: string): DaemonProcess | null {
  const list = loadDaemons();
  let result: DaemonProcess | null = null;
  const updated = list.map((d) => {
    if (d.id === daemonId) {
      const nextStatus = d.status === "running" ? "stopped" : "running";
      result = { ...d, status: nextStatus };
      return result;
    }
    return d;
  });
  saveDaemons(updated);
  if (result) {
    logToSyslog(
      "DAEMON",
      result.status === "running" ? "OK" : "WARN",
      `Process [${result.name}] status toggled to '${result.status}'.`,
    );
  }
  return result;
}
