import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CAREER_FILESYSTEM,
  listDirectory,
  resolvePath,
  type FileSystemNode,
} from "@/lib/filesystem";
import { loadKernelState, replanCareerKernel, type TargetRole } from "@/lib/kernel";
import { loadDaemons, sendDaemonHeartbeat } from "@/lib/daemons";
import { runKernelSystemAudit } from "@/lib/auditor";
import { loadProofArtifacts } from "@/lib/proof-wall";

interface TerminalHistoryEntry {
  command: string;
  output: string;
  isError?: boolean;
}

export function TerminalMode({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [currentPath, setCurrentPath] = useState("/");
  const [inputVal, setInputVal] = useState("");
  const [history, setHistory] = useState<TerminalHistoryEntry[]>([
    {
      command: "uname -a",
      output: "EngineerOS 3.2.0-kernel #1 PREEMPT x86_64 GNU/Linux (Career Operating System)",
    },
    {
      command: "help",
      output:
        "Available commands:\n  ls [path]       List filesystem entries\n  cd <path>       Change virtual career directory & navigate app\n  cat <path>      Inspect file contents\n  pwd             Print working directory\n  top / ps        Display kernel CPU & running daemons\n  daemons         List or tick background habit daemons\n  audit           Run Kernel Auditor (proof vs claims)\n  proof           Print latest Proof-of-Work wall receipts\n  solve <name>    Jump to problem/module\n  man <topic>     Read manual page\n  clear           Clear screen\n  exit            Close terminal mode",
    },
  ]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  if (!isOpen) return null;

  const handleCommand = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    const parts = trimmed.split(" ");
    const cmd = parts[0]!.toLowerCase();
    const arg = parts.slice(1).join(" ");

    let out = "";
    let isErr = false;

    switch (cmd) {
      case "clear":
        setHistory([]);
        setInputVal("");
        return;

      case "pwd":
        out = currentPath;
        break;

      case "exit":
        onClose();
        return;

      case "reboot":
        out = "Kernel restarting... Reloading IPC and daemons.\nOK.";
        break;

      case "ls": {
        const targetDir = arg ? resolvePath(currentPath, arg) : currentPath;
        const nodes = listDirectory(targetDir);
        if (nodes.length === 0) {
          out = "total 0";
        } else {
          out = nodes
            .map(
              (n) =>
                `${n.permissions}  ${String(n.sizeBytes).padStart(6)}  ${n.name}${n.type === "directory" ? "/" : ""}`,
            )
            .join("\n");
        }
        break;
      }

      case "cd": {
        if (!arg || arg === "~") {
          setCurrentPath("/fundamentals");
          out = "Switched to /fundamentals";
          break;
        }
        const resolved = resolvePath(currentPath, arg);
        const node = CAREER_FILESYSTEM[resolved];
        if (node) {
          if (node.type === "directory") {
            setCurrentPath(resolved);
            out = `Directory changed to ${resolved}`;
          } else {
            // It's a file or executable -> navigate to route!
            if (node.routeTarget) {
              navigate({ to: node.routeTarget });
              out = `Executing ${node.name} -> Routing to ${node.routeTarget}... [SUCCESS]`;
            } else {
              out = `${node.name}: Not a directory`;
              isErr = true;
            }
          }
        } else {
          out = `cd: ${arg}: No such file or directory`;
          isErr = true;
        }
        break;
      }

      case "cat": {
        if (!arg) {
          out = "usage: cat <file>";
          isErr = true;
          break;
        }
        const resolved = resolvePath(currentPath, arg);
        const node = CAREER_FILESYSTEM[resolved];
        if (node) {
          if (node.content) {
            out = node.content;
          } else if (node.type === "directory") {
            out = `cat: ${arg}: Is a directory`;
            isErr = true;
          } else {
            out = `${node.name}: [Binary/Virtual Stream] Size: ${node.sizeBytes} bytes`;
          }
        } else {
          out = `cat: ${arg}: No such file or directory`;
          isErr = true;
        }
        break;
      }

      case "top":
      case "htop": {
        const kernel = loadKernelState();
        const daemons = loadDaemons();
        out =
          `Tasks: ${daemons.length + 4} total, ${daemons.filter((d) => d.status === "running").length + 2} running, 0 sleeping, ${daemons.filter((d) => d.status === "crashed").length} crashed\n` +
          `%Cpu(s): 34.2 us, 12.1 sy, 0.0 ni, 53.7 id (Focus Load: Nominal)\n` +
          `MiB Mem : 100.0 total, 64.0 resident, 32.0 swap (Active Retention)\n\n` +
          `  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n` +
          `    1 root      20   0  164288  12400   4096 R  12.0  12.4   0:14.22 kernel.core\n` +
          daemons
            .map(
              (d) =>
                ` ${String(d.pid).padStart(4)} student   20   0   48192   8192   2048 ${d.status === "running" ? "S" : "D"}   3.5   8.2   0:04.11 ${d.name}`,
            )
            .join("\n");
        break;
      }

      case "ps": {
        const daemons = loadDaemons();
        out =
          "  PID TTY          TIME CMD\n" +
          " 1001 pts/0    00:00:01 bash\n" +
          daemons
            .map((d) => ` ${String(d.pid).padStart(4)} ?        00:00:04 ${d.name} [${d.status}]`)
            .join("\n");
        break;
      }

      case "daemons": {
        const daemons = loadDaemons();
        out =
          "ACTIVE HABIT DAEMONS:\n" +
          daemons
            .map(
              (d) =>
                `• PID ${d.pid} [${d.name}] (${d.status.toUpperCase()}): Streak ${d.streakDays}d · +${d.xpPerTick} XP/tick\n  Command: ${d.command}`,
            )
            .join("\n");
        break;
      }

      case "audit": {
        const report = runKernelSystemAudit();
        out =
          `KERNEL SYSTEM AUDIT (Status: ${report.overallHealthPercent}% Health)\n` +
          `Claims Audited: ${report.claimsAuditedCount} | Discrepancies: ${report.discrepanciesCount}\n\n` +
          report.findings
            .map(
              (f) =>
                `[${f.severity}] ${f.skillClaim}\n  Proof: ${f.proofEvidence}\n  Verdict: ${f.auditVerdict}\n  Corrective Mission: ${f.correctiveMission.title} -> ${f.correctiveMission.route}`,
            )
            .join("\n\n");
        break;
      }

      case "proof": {
        const proofs = loadProofArtifacts();
        out =
          "IMMUTABLE PROOF-OF-WORK LEDGER:\n" +
          proofs
            .slice(0, 5)
            .map((p) => `• [${p.shaReceipt}] ${p.title}\n  Summary: ${p.summary}`)
            .join("\n\n");
        break;
      }

      case "solve": {
        if (!arg) {
          out = "usage: solve <problem-name> (e.g. solve two-sum)";
          isErr = true;
          break;
        }
        navigate({ to: "/dsa" });
        out = `Navigating to DSA Lab to solve '${arg}'... [READY]`;
        break;
      }

      case "man": {
        if (!arg) {
          out = "What manual page that you want? (e.g. man pointers, man chmod, man toposort)";
          isErr = true;
          break;
        }
        out =
          `MANUAL PAGE FOR '${arg}':\n` +
          `NAME\n     ${arg} - core engineering concept and system specification\n` +
          `SYNOPSIS\n     Run 'solve ${arg}' or 'cd /fundamentals/${arg}'\n` +
          `DESCRIPTION\n     EngineerOS standard curriculum reference. Maintained by Kernel Auditor.`;
        break;
      }

      case "help":
        out =
          "EngineerOS Terminal Commands:\n" +
          "  ls [path]       List filesystem entries\n" +
          "  cd <path>       Change virtual career directory & navigate app\n" +
          "  cat <path>      Inspect file contents\n" +
          "  pwd             Print working directory\n" +
          "  top / ps        Display kernel CPU & running daemons\n" +
          "  daemons         List or tick background habit daemons\n" +
          "  audit           Run Kernel Auditor (proof vs claims)\n" +
          "  proof           Print latest Proof-of-Work wall receipts\n" +
          "  solve <name>    Jump to problem/module\n" +
          "  man <topic>     Read manual page\n" +
          "  clear           Clear screen\n" +
          "  exit            Close terminal mode";
        break;

      default:
        out = `bash: ${cmd}: command not found. Type 'help' for available system commands.`;
        isErr = true;
        break;
    }

    setHistory((prev) => [...prev, { command: raw, output: out, isError: isErr }]);
    setInputVal("");
  };

  return (
    <div
      className={`fixed z-50 transition-all font-mono text-xs ${
        isFullScreen
          ? "inset-0 bg-black/95 text-emerald-400 p-6 flex flex-col"
          : "bottom-4 right-4 w-[92vw] sm:w-[640px] h-[440px] rounded-2xl bg-zinc-950/95 text-emerald-400 border border-zinc-800 shadow-2xl flex flex-col backdrop-blur-md"
      }`}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2 text-zinc-400 shrink-0">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4 text-emerald-400" />
          <span className="font-semibold text-zinc-200">
            student@engineeros:{currentPath} (Terminal Mode)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-zinc-400 hover:text-zinc-100"
            onClick={() => setIsFullScreen(!isFullScreen)}
            aria-label="Toggle Fullscreen"
          >
            {isFullScreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-zinc-400 hover:text-zinc-100"
            onClick={onClose}
            aria-label="Close Terminal"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 font-mono leading-relaxed"
      >
        {history.map((h, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="text-primary font-bold">student@engineeros:{currentPath}$</span>
              <span className="text-zinc-100 font-semibold">{h.command}</span>
            </div>
            {h.output && (
              <pre
                className={`whitespace-pre-wrap ${
                  h.isError ? "text-rose-400" : "text-emerald-400/90"
                }`}
              >
                {h.output}
              </pre>
            )}
          </div>
        ))}
      </div>

      {/* Command Input Prompt */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCommand(inputVal);
        }}
        className="flex items-center gap-2 border-t border-zinc-800 bg-zinc-900/60 px-4 py-2.5 shrink-0"
      >
        <span className="text-primary font-bold shrink-0">student@engineeros:{currentPath}$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="type 'help', 'ls', 'cd <dir>', 'top', 'audit', or 'solve <name>'..."
          className="flex-1 bg-transparent text-zinc-100 focus:outline-none placeholder:text-zinc-600 font-mono text-xs"
        />
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          className="h-6 w-6 text-zinc-400 hover:text-emerald-400"
        >
          <CornerDownLeft className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
}
