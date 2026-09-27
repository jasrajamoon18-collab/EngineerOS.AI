import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Activity,
  Cpu,
  HardDrive,
  Layers,
  Terminal as TerminalIcon,
  RotateCcw,
  Sparkles,
  Zap,
  Play,
  Pause,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  loadKernelState,
  saveKernelState,
  replanCareerKernel,
  calculateKernelOperatingMode,
  type StudentKernelState,
  type TargetRole,
  ROLE_REPLAN_PROFILES,
} from "@/lib/kernel";
import { loadDaemons, sendDaemonHeartbeat, reviveDaemon, type DaemonProcess } from "@/lib/daemons";
import { loadSkillMemoryPages, type SkillMemoryPage } from "@/lib/memory-management";
import { analyzeTutorialHell } from "@/lib/proof-wall";

export function KernelSystemMonitor({
  missions,
  doneIds,
  onToggleMission,
}: {
  missions: Array<{ id: string; title: string; category: string; xp: number }>;
  doneIds: Set<string>;
  onToggleMission: (id: string, xp: number, done: boolean) => void;
}) {
  const [kernel, setKernel] = useState<StudentKernelState>(loadKernelState());
  const [daemons, setDaemons] = useState<DaemonProcess[]>(loadDaemons());
  const [memoryPages, setMemoryPages] = useState<SkillMemoryPage[]>(loadSkillMemoryPages());
  const [selectedRole, setSelectedRole] = useState<TargetRole>(kernel.targetRole);
  const [roleChanging, setRoleChanging] = useState(false);

  useEffect(() => {
    const handleKernelUpdate = (e: Event) => {
      const custom = e as CustomEvent<StudentKernelState>;
      if (custom.detail) setKernel(custom.detail);
    };
    const handleDaemonUpdate = (e: Event) => {
      const custom = e as CustomEvent<DaemonProcess[]>;
      if (custom.detail) setDaemons(custom.detail);
    };
    const handleMemoryUpdate = (e: Event) => {
      const custom = e as CustomEvent<SkillMemoryPage[]>;
      if (custom.detail) setMemoryPages(custom.detail);
    };

    window.addEventListener("engineeros:kernel-updated", handleKernelUpdate);
    window.addEventListener("engineeros:daemons-updated", handleDaemonUpdate);
    window.addEventListener("engineeros:memory-updated", handleMemoryUpdate);

    return () => {
      window.removeEventListener("engineeros:kernel-updated", handleKernelUpdate);
      window.removeEventListener("engineeros:daemons-updated", handleDaemonUpdate);
      window.removeEventListener("engineeros:memory-updated", handleMemoryUpdate);
    };
  }, []);

  // Compute operating mode from exam calendar
  const operatingModeInfo = calculateKernelOperatingMode(kernel.examPeriods || []);

  // Compute CPU load based on missions remaining & recent activity
  const completedMissionsCount = missions.filter((m) => doneIds.has(m.id)).length;
  const missionProgressRatio = missions.length > 0 ? completedMissionsCount / missions.length : 1;
  const cpuLoadPercent = Math.min(
    100,
    Math.max(18, Math.round((1 - missionProgressRatio * 0.7) * 85 + (daemons.length > 0 ? 10 : 0))),
  );

  // Compute RAM allocation
  const residentPages = memoryPages.filter((p) => p.state === "RESIDENT_RAM");
  const dirtyPages = memoryPages.filter((p) => p.state === "DIRTY_PAGE");
  const swappedPages = memoryPages.filter((p) => p.state === "SWAPPED_TO_DISK");
  const atRiskPages = memoryPages.filter((p) => p.state === "AT_RISK_OOM_KILL");

  const totalCapacityMB = 100;
  const residentMB = Math.round((residentPages.length / Math.max(1, memoryPages.length)) * 64);
  const dirtyMB = Math.round((dirtyPages.length / Math.max(1, memoryPages.length)) * 18);
  const swapMB = Math.round((swappedPages.length / Math.max(1, memoryPages.length)) * 32);

  // Tutorial Hell check
  const tutorialHell = analyzeTutorialHell(kernel.buildTimeSeconds7d, kernel.watchTimeSeconds7d);

  // Handle Target Role switch & immediate whole-app re-plan
  const handleRoleSwitch = (newRole: TargetRole) => {
    setRoleChanging(true);
    setSelectedRole(newRole);
    const { replanInfo, previousRole } = replanCareerKernel(newRole);
    setKernel(loadKernelState());

    setTimeout(() => {
      setRoleChanging(false);
      toast.success(`Kernel Re-Planned: Target '${newRole}' Active`, {
        description: `Prioritizing ${replanInfo.priorityDsaPatterns.join(", ")} and ${replanInfo.focusKeywords.slice(0, 3).join(", ")}.`,
      });
    }, 400);
  };

  const handleHeartbeat = (id: string) => {
    const res = sendDaemonHeartbeat(id);
    if (res.success) {
      setDaemons(loadDaemons());
      toast.success(`Daemon Heartbeat: [${res.daemonName}]`, {
        description: `Habit recorded. Generated +${res.xpEarned} XP background progress.`,
      });
    }
  };

  const handleRevive = (id: string) => {
    const res = reviveDaemon(id);
    if (res.success && res.daemon) {
      setDaemons(loadDaemons());
      toast.success(`[SIGCONT] Daemon Revived!`, {
        description: `Process [${res.daemon.name}] restarted with PID ${res.daemon.pid}. +10 XP recovery bonus awarded.`,
      });
    }
  };

  const crashedDaemons = daemons.filter((d) => d.status === "crashed");

  return (
    <div className="space-y-6">
      {/* Crashed Daemon Warning Banner (The OS Crash Mechanic) */}
      {crashedDaemons.length > 0 && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 transition-all">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/20 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-destructive">
                    KERNEL ALERT: DAEMON CRASHED
                  </span>
                  <Badge variant="destructive" className="font-mono text-[10px] uppercase">
                    SIGSTOP INACTIVE
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Process{" "}
                  <code className="rounded bg-background/80 px-1 py-0.5 font-mono text-foreground font-semibold">
                    {crashedDaemons[0]?.name} (PID {crashedDaemons[0]?.pid})
                  </code>{" "}
                  went silent for &gt; 72 hours. {crashedDaemons[0]?.restartMissionPrompt}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                size="sm"
                variant="destructive"
                className="font-mono text-xs shadow-sm"
                onClick={() => handleRevive(crashedDaemons[0]!.id)}
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Restart in 2 min (+10 XP)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Hell Resource Starvation Alert */}
      {tutorialHell.isTutorialHell && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 transition-all">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-amber-500">
                    TUTORIAL HELL DETECTOR: RESOURCE STARVATION
                  </span>
                  <Badge
                    variant="outline"
                    className="border-amber-500/40 text-[10px] text-amber-500 font-mono"
                  >
                    RATIO {tutorialHell.ratio}x
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  You have logged {tutorialHell.watchHours}h watching/reading vs only{" "}
                  {tutorialHell.buildHours}h running real code. Kernel has throttled passive
                  modules. Ship code first to restore system balance.
                </p>
              </div>
            </div>
            <Button size="sm" asChild className="self-end sm:self-auto font-mono text-xs">
              <Link to="/code-lab">
                <Play className="mr-1.5 h-3.5 w-3.5" />
                Ship Code Now
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Main OS Kernel Header Bar */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-lg font-bold tracking-tight">
                  Kernel System Monitor
                </span>
                <Badge
                  variant="outline"
                  className="font-mono text-[11px] text-primary border-primary/30"
                >
                  {kernel.version}
                </Badge>
                <Badge
                  variant={
                    operatingModeInfo.mode === "overclock"
                      ? "default"
                      : operatingModeInfo.mode === "low_power"
                        ? "destructive"
                        : "secondary"
                  }
                  className="font-mono text-[10px] uppercase tracking-wider"
                >
                  <Zap className="mr-1 h-3 w-3" />
                  Mode: {operatingModeInfo.mode.replace("_", "-")}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Single Source of Truth: {kernel.branch} · Year {kernel.year}, Sem {kernel.semester}{" "}
                · {kernel.collegeTier}
              </p>
            </div>
          </div>

          {/* Role Switcher & Live Re-Planner */}
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
            <span className="text-xs font-mono text-muted-foreground shrink-0">
              Target Process:
            </span>
            <select
              aria-label="Target Role Selector"
              className="rounded-lg border border-input bg-background px-3 py-1.5 font-mono text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              value={selectedRole}
              onChange={(e) => handleRoleSwitch(e.target.value as TargetRole)}
              disabled={roleChanging}
            >
              {Object.keys(ROLE_REPLAN_PROFILES).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Re-plan summary line */}
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs">
          <span className="font-mono text-[11px] font-semibold text-primary">
            OS Re-plan Focus:
          </span>
          <span className="text-muted-foreground">
            {ROLE_REPLAN_PROFILES[selectedRole].priorityDsaPatterns.join(" · ")}
          </span>
          <span className="ml-auto font-mono text-[10px] text-muted-foreground">
            Weekly Budget: {kernel.availableHoursPerWeek}h
          </span>
        </div>
      </div>

      {/* System Resource Gauges: CPU, RAM, Disk Swap */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* CPU Focus Load */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-muted-foreground">
              <Cpu className="h-4 w-4 text-primary" />
              <span>CPU: CURRENT FOCUS LOAD</span>
            </div>
            <span className="font-mono text-sm font-bold text-foreground">{cpuLoadPercent}%</span>
          </div>
          <Progress value={cpuLoadPercent} className="h-2" />
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span>Active Threads: {missions.length - completedMissionsCount} pending</span>
            <span>Load: {cpuLoadPercent > 70 ? "HIGH" : "NOMINAL"}</span>
          </div>
        </div>

        {/* RAM: Working Memory Retention */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-muted-foreground">
              <Layers className="h-4 w-4 text-emerald-500" />
              <span>RAM: ACTIVE SKILLS IN RETENTION</span>
            </div>
            <span className="font-mono text-sm font-bold text-emerald-500">
              {residentMB} / {totalCapacityMB} MB
            </span>
          </div>
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="bg-emerald-500 transition-all"
              style={{ width: `${(residentMB / totalCapacityMB) * 100}%` }}
              title="Resident RAM (Active)"
            />
            <div
              className="bg-amber-400 transition-all"
              style={{ width: `${(dirtyMB / totalCapacityMB) * 100}%` }}
              title="Dirty Pages (Decaying)"
            />
            <div
              className="bg-rose-500 transition-all"
              style={{ width: `${(swapMB / totalCapacityMB) * 100}%` }}
              title="Swapped to Disk"
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span className="text-emerald-500">{residentPages.length} Resident</span>
            <span className="text-amber-500">{dirtyPages.length} Dirty</span>
            <span className="text-rose-500">
              {swappedPages.length + atRiskPages.length} Swapped
            </span>
          </div>
        </div>

        {/* Disk & Exam Scheduling Throttler */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-muted-foreground">
              <HardDrive className="h-4 w-4 text-sky-500" />
              <span>SEMESTER CALENDAR THROTTLE</span>
            </div>
            <span className="font-mono text-xs font-bold text-sky-500">
              {operatingModeInfo.nextExamName || "No Exams"}
            </span>
          </div>
          <div className="mt-1">
            <p className="text-xs text-muted-foreground line-clamp-2">{operatingModeInfo.reason}</p>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span>
              {operatingModeInfo.daysUntilNextExam !== undefined
                ? `T-${operatingModeInfo.daysUntilNextExam} Days`
                : "Continuous"}
            </span>
            <span className="text-primary hover:underline cursor-pointer">
              <Link to="/certifications">Configure Calendar →</Link>
            </span>
          </div>
        </div>
      </div>

      {/* Running Daemons & Active Missions Process Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Daemons: Background Habits Engine */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-bold tracking-tight">
                Installed Daemons (Background Habits)
              </h3>
            </div>
            <Badge variant="outline" className="font-mono text-[10px]">
              {daemons.filter((d) => d.status === "running").length} / {daemons.length} Running
            </Badge>
          </div>

          <div className="divide-y divide-border">
            {daemons.map((d) => (
              <div
                key={d.id}
                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-foreground truncate">
                      {d.name}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">PID {d.pid}</span>
                    <Badge
                      variant={d.status === "running" ? "outline" : "destructive"}
                      className="font-mono text-[9px] px-1.5 py-0 uppercase"
                    >
                      {d.status}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">{d.description}</p>
                  <div className="mt-1 flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                    <span>Streak: {d.streakDays}d</span>
                    <span>Total XP: +{d.totalXpGenerated}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {d.status === "crashed" ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 text-xs font-mono px-2.5"
                      onClick={() => handleRevive(d.id)}
                    >
                      Restart
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 text-xs font-mono px-2.5 hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleHeartbeat(d.id)}
                    >
                      Tick (+{d.xpPerTick} XP)
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Processes: Today's Missions as System Processes */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              <h3 className="font-display text-sm font-bold tracking-tight">
                Active System Processes (Today's Missions)
              </h3>
            </div>
            <Badge variant="outline" className="font-mono text-[10px]">
              {completedMissionsCount} / {missions.length} Exit 0
            </Badge>
          </div>

          <div className="divide-y divide-border">
            {missions.map((m, idx) => {
              const isDone = doneIds.has(m.id);
              const pid = 2048 + idx * 4;
              return (
                <div
                  key={m.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">PID {pid}</span>
                      <span
                        className={`text-xs font-medium truncate ${
                          isDone ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {m.title}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                      <Badge variant="secondary" className="text-[9px] px-1 py-0">
                        {m.category}
                      </Badge>
                      <span>+{m.xp} XP</span>
                      <span>Nice: -5 (High Priority)</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isDone ? "ghost" : "outline"}
                    className="h-7 text-xs font-mono shrink-0"
                    onClick={() => onToggleMission(m.id, m.xp, isDone)}
                  >
                    {isDone ? (
                      <span className="flex items-center text-emerald-500 text-xs">
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Done
                      </span>
                    ) : (
                      "Execute"
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Kernel Syslog Terminal Window */}
      <div className="rounded-2xl border border-border bg-zinc-950 p-4 font-mono text-xs text-zinc-100 shadow-md">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <TerminalIcon className="h-4 w-4 text-emerald-400" />
            <span className="text-[11px] font-semibold text-zinc-300">
              /var/log/engineeros.syslog (Kernel Event Stream)
            </span>
          </div>
          <span className="text-[10px] text-zinc-500">Live IPC Log</span>
        </div>

        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {(kernel.syslog || []).slice(0, 7).map((log) => (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed">
              <span className="text-zinc-500 shrink-0 text-[10px]">[{log.timestamp}]</span>
              <span
                className={`shrink-0 font-bold text-[10px] ${
                  log.subsystem === "KERNEL"
                    ? "text-primary"
                    : log.subsystem === "MMU"
                      ? "text-amber-400"
                      : log.subsystem === "DAEMON"
                        ? "text-emerald-400"
                        : log.subsystem === "POW"
                          ? "text-sky-400"
                          : "text-purple-400"
                }`}
              >
                [{log.subsystem}]
              </span>
              <span
                className={
                  log.level === "CRIT"
                    ? "text-rose-400 font-semibold"
                    : log.level === "WARN"
                      ? "text-amber-300"
                      : "text-zinc-300"
                }
              >
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
