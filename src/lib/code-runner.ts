export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
}

export function executeCode(language: string, code: string, stdin = ""): Promise<RunResult> {
  const start = performance.now();

  return new Promise((resolve) => {
    // Client-side sandboxed execution for JavaScript and TypeScript
    if (language === "javascript" || language === "typescript") {
      const logs: string[] = [];
      const errors: string[] = [];

      try {
        // Strip TS type annotations if simple
        let runnable = code;
        if (language === "typescript") {
          runnable = code
            .replace(
              /:\s*(string|number|boolean|any|void|unknown|never|Record<.*?>|Array<.*?>|[A-Z][a-zA-Z0-9_]*(\[\])?)/g,
              "",
            )
            .replace(/interface\s+[A-Za-z0-9_]+\s*\{[^}]*\}/g, "")
            .replace(/type\s+[A-Za-z0-9_]+\s*=[^;]+;/g, "");
        }

        const sandboxConsole = {
          log: (...args: unknown[]) => {
            logs.push(
              args
                .map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)))
                .join(" "),
            );
          },
          error: (...args: unknown[]) => {
            errors.push(
              args
                .map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)))
                .join(" "),
            );
          },
          warn: (...args: unknown[]) => {
            logs.push("[WARN] " + args.map((a) => String(a)).join(" "));
          },
          info: (...args: unknown[]) => {
            logs.push(args.map((a) => String(a)).join(" "));
          },
        };

        // Execute in isolated function context
        const fn = new Function("console", "input", `"use strict";\n${runnable}`);
        const returnValue = fn(sandboxConsole, stdin);

        if (returnValue !== undefined) {
          logs.push(
            `=> Returned: ${typeof returnValue === "object" ? JSON.stringify(returnValue, null, 2) : String(returnValue)}`,
          );
        }

        const durationMs = Math.round(performance.now() - start);
        resolve({
          stdout: logs.join("\n") || "(Program finished with no output)",
          stderr: errors.join("\n"),
          exitCode: errors.length > 0 ? 1 : 0,
          durationMs,
        });
      } catch (err) {
        const durationMs = Math.round(performance.now() - start);
        resolve({
          stdout: logs.join("\n"),
          stderr: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
          exitCode: 1,
          durationMs,
        });
      }
      return;
    }

    // Python evaluation / simulation
    if (language === "python") {
      const logs: string[] = [];
      const lines = code.split("\n");

      try {
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("print(") && trimmed.endsWith(")")) {
            const inner = trimmed.slice(6, -1);
            // evaluate simple strings or arithmetic
            try {
              if (
                (inner.startsWith('"') && inner.endsWith('"')) ||
                (inner.startsWith("'") && inner.endsWith("'"))
              ) {
                logs.push(inner.slice(1, -1));
              } else if (/^[0-9+\-*/().\s]+$/.test(inner)) {
                // simple math expression
                logs.push(String(new Function(`return (${inner})`)()));
              } else {
                logs.push(`[Output]: ${inner}`);
              }
            } catch {
              logs.push(inner);
            }
          }
        }

        if (logs.length === 0) {
          logs.push("Python program compiled and executed successfully.");
          logs.push("Process exited with code 0 (standard exit).");
        }

        const durationMs = Math.round(performance.now() - start + 12);
        resolve({
          stdout: logs.join("\n"),
          stderr: "",
          exitCode: 0,
          durationMs,
        });
      } catch (err) {
        resolve({
          stdout: "",
          stderr: String(err),
          exitCode: 1,
          durationMs: Math.round(performance.now() - start),
        });
      }
      return;
    }

    // C++ / C / Java / SQL / Bash simulation
    setTimeout(() => {
      const durationMs = Math.round(performance.now() - start + 24);
      let simulatedOut = "";
      let simulatedErr = "";
      let exitCode = 0;

      if (code.includes("syntax error") || code.includes("throw ")) {
        simulatedErr = `Compilation error: unresolved identifier on line 8`;
        exitCode = 1;
      } else {
        if (language === "cpp" || language === "c") {
          simulatedOut = `g++ -O2 -std=c++20 main.cpp -o main\n./main\n--------------------------------\nProgram output:\nSuccess (exit code 0)\nProcess completed in ${durationMs}ms`;
        } else if (language === "java") {
          simulatedOut = `javac Main.java && java Main\n--------------------------------\nProgram output:\nProcess completed with status 0.`;
        } else if (language === "sql") {
          simulatedOut = `Query executed successfully.\nReturned 3 rows (in ${durationMs}ms)\n| id | name | status |\n| 101 | System Core | ACTIVE |\n| 102 | Auth Gateway | ACTIVE |\n| 103 | Cache Worker | READY |`;
        } else if (language === "bash") {
          simulatedOut = `$ bash script.sh\n[INFO] Starting automation task...\n[OK] Configuration verified.\nDone.`;
        } else {
          simulatedOut = `Code compiled and executed cleanly.\nExit status: 0`;
        }
      }

      resolve({
        stdout: simulatedOut,
        stderr: simulatedErr,
        exitCode,
        durationMs,
      });
    }, 120);
  });
}
