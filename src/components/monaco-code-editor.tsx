import { useEffect, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Check, Copy, Play, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/components/theme-provider";
import { MONACO_LANGUAGE_MAP } from "@/lib/code-runner";

export interface MonacoCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange?: (language: string) => void;
  supportedLanguages?: Array<{ value: string; label: string }>;
  onRun?: () => void;
  isRunning?: boolean;
  runButtonLabel?: string;
  height?: string;
  readOnly?: boolean;
  defaultStarter?: string;
}

export const DEFAULT_LANGUAGES = [
  { value: "python", label: "Python 3" },
  { value: "c", label: "C (GCC 14)" },
  { value: "cpp", label: "C++ (GCC 14 / C++20)" },
  { value: "java", label: "Java (JDK 17)" },
  { value: "javascript", label: "JavaScript (ES2024)" },
  { value: "typescript", label: "TypeScript" },
  { value: "sql", label: "SQL (SQLite3)" },
  { value: "bash", label: "Bash / Shell" },
];

export function MonacoCodeEditor({
  value,
  onChange,
  language,
  onLanguageChange,
  supportedLanguages = DEFAULT_LANGUAGES,
  onRun,
  isRunning = false,
  runButtonLabel = "Run Code",
  height = "380px",
  readOnly = false,
  defaultStarter,
}: MonacoCodeEditorProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const monacoLang = MONACO_LANGUAGE_MAP[language.toLowerCase()] || "plaintext";
  const editorTheme = theme === "light" ? "light" : "vs-dark";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Code copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const handleReset = () => {
    if (defaultStarter !== undefined) {
      onChange(defaultStarter);
      toast.info("Reset to starter code");
    }
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    // Add command for Cmd/Ctrl + Enter to run
    if (onRun) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        onRun();
      });
    }
  };

  return (
    <div className="flex flex-col border border-border rounded-lg overflow-hidden bg-card text-card-foreground shadow-sm">
      {/* Editor Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          {onLanguageChange ? (
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger className="h-7 w-[140px] text-xs font-mono">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value} className="text-xs font-mono">
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="font-mono font-medium text-muted-foreground uppercase px-2 py-0.5 bg-muted rounded text-[11px]">
              {language}
            </span>
          )}
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            Press{" "}
            <kbd className="px-1 py-0.5 rounded bg-muted font-mono text-[10px]">Ctrl/Cmd+Enter</kbd>{" "}
            to run
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {defaultStarter !== undefined && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              title="Reset code"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            title="Copy code"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500 mr-1" />
            ) : (
              <Copy className="h-3.5 w-3.5 mr-1" />
            )}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </Button>

          {onRun && (
            <Button
              type="button"
              size="sm"
              onClick={onRun}
              disabled={isRunning}
              className="h-7 px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-medium ml-1"
            >
              {isRunning ? (
                <>
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Running…
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 mr-1.5 fill-current" />
                  {runButtonLabel}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative w-full" style={{ height }}>
        {mounted ? (
          <Editor
            height="100%"
            language={monacoLang}
            value={value}
            theme={editorTheme}
            onChange={(val) => onChange(val ?? "")}
            onMount={handleEditorMount}
            options={{
              readOnly,
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'Fira Code', 'JetBrains Mono', Menlo, Monaco, Consolas, monospace",
              fontLigatures: true,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "on",
              padding: { top: 10, bottom: 10 },
              smoothScrolling: true,
              cursorBlinking: "smooth",
            }}
            loading={
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground font-mono">
                Initializing Monaco code environment…
              </div>
            }
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            readOnly={readOnly}
            className="w-full h-full p-3 font-mono text-xs bg-background text-foreground resize-none focus:outline-none"
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}
