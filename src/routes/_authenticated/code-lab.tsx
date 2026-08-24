import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, ExternalLink, Plus, Save, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { awardXp } from "@/lib/progress";
import {
  codeChallengesQuery,
  codeSnippetsQuery,
  profileQuery,
  type CodeChallenge,
} from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/code-lab")({
  head: () => ({
    meta: [
      { title: "Code Lab — EngineerOS" },
      {
        name: "description",
        content:
          "Practice coding challenges and keep a personal, searchable snippet library inside EngineerOS.",
      },
      { property: "og:title", content: "Code Lab — EngineerOS" },
      {
        property: "og:description",
        content: "Challenge prompts, a snippet library and links to trusted external runners.",
      },
    ],
  }),
  component: CodeLabPage,
});

const LANGUAGES = ["python", "javascript", "typescript", "java", "cpp", "c", "sql", "bash"];

const RUNNERS = [
  { label: "Programiz", url: "https://www.programiz.com/python-programming/online-compiler/" },
  { label: "Compiler Explorer", url: "https://godbolt.org/" },
  { label: "JSFiddle", url: "https://jsfiddle.net/" },
];

function CodeLabPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: challenges = [] } = useQuery(codeChallengesQuery());
  const { data: snippets = [] } = useQuery(codeSnippetsQuery(user?.id));
  const { data: profile } = useQuery(profileQuery(user?.id));

  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [notes, setNotes] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [level, setLevel] = useState("all");

  const levels = useMemo(
    () => ["all", ...Array.from(new Set(challenges.map((c) => c.level)))],
    [challenges],
  );
  const visible = level === "all" ? challenges : challenges.filter((c) => c.level === level);

  function reset() {
    setActiveId(null);
    setTitle("");
    setLanguage("python");
    setCode("");
    setNotes("");
    setChallengeId(null);
  }

  function loadChallenge(challenge: CodeChallenge) {
    setActiveId(null);
    setChallengeId(challenge.id);
    setTitle(challenge.title);
    setLanguage(challenge.language);
    setCode(challenge.starter_code);
    setNotes("");
    document.getElementById("snippet-workspace")?.scrollIntoView({ behavior: "smooth" });
  }

  function loadSnippet(id: string) {
    const snippet = snippets.find((s) => s.id === id);
    if (!snippet) return;
    setActiveId(snippet.id);
    setChallengeId(snippet.challenge_id);
    setTitle(snippet.title);
    setLanguage(snippet.language);
    setCode(snippet.code);
    setNotes(snippet.notes ?? "");
    document.getElementById("snippet-workspace")?.scrollIntoView({ behavior: "smooth" });
  }

  async function save() {
    if (!user) return;
    if (!title.trim()) {
      toast.error("Give your snippet a title first.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        challenge_id: challengeId,
        title: title.trim(),
        language,
        code,
        notes: notes.trim() || null,
      };
      if (activeId) {
        const { error } = await supabase.from("code_snippets").update(payload).eq("id", activeId);
        if (error) throw new Error(error.message);
        toast.success("Snippet updated.");
      } else {
        const { data, error } = await supabase
          .from("code_snippets")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        setActiveId(data.id);
        await awardXp(user.id, profile, 15);
        await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
        toast.success("+15 XP · snippet saved");
      }
      await queryClient.invalidateQueries({ queryKey: ["code-snippets", user.id] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the snippet.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!user) return;
    const { error } = await supabase.from("code_snippets").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (activeId === id) reset();
    await queryClient.invalidateQueries({ queryKey: ["code-snippets", user.id] });
    toast.success("Snippet deleted.");
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied — paste it into your compiler.");
    } catch {
      toast.error("Clipboard is blocked in this browser.");
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Lab"
        title="Code Lab"
        description="Work through challenge prompts and keep every solution you write in one searchable library."
        actions={
          <Button variant="outline" onClick={reset} className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New snippet
          </Button>
        }
      />

      <Alert className="mb-8">
        <AlertTitle>No code runs on EngineerOS</AlertTitle>
        <AlertDescription>
          There is no compiler or sandbox connected to this app, so nothing you write here is
          executed or auto-graded. Write and store your solution here, then run it in your own
          editor or one of the external compilers linked below.
        </AlertDescription>
      </Alert>

      <section aria-labelledby="challenges-heading" className="mb-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="challenges-heading" className="text-lg font-semibold">
            Challenge prompts
          </h2>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by level">
            {levels.map((item) => (
              <Button
                key={item}
                size="sm"
                variant={level === item ? "default" : "outline"}
                aria-pressed={level === item}
                onClick={() => setLevel(item)}
                className="capitalize"
              >
                {item}
              </Button>
            ))}
          </div>
        </div>

        <ul className="grid gap-3 md:grid-cols-2">
          {visible.map((challenge) => (
            <li key={challenge.id} className="panel flex flex-col p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold">{challenge.title}</h3>
                <Badge
                  variant="outline"
                  className={cn(
                    "label-mono",
                    challenge.level === "beginner" && "text-success",
                    challenge.level === "intermediate" && "text-accent",
                    challenge.level === "advanced" && "text-destructive",
                  )}
                >
                  {challenge.level}
                </Badge>
                <Badge variant="secondary" className="label-mono">
                  {challenge.language}
                </Badge>
              </div>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{challenge.prompt}</p>
              {challenge.hint ? (
                <details className="mt-2 text-sm">
                  <summary className="cursor-pointer text-muted-foreground">Hint</summary>
                  <p className="mt-1 text-muted-foreground">{challenge.hint}</p>
                </details>
              ) : null}
              <Button size="sm" className="mt-3 self-start" onClick={() => loadChallenge(challenge)}>
                Open in workspace
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section id="snippet-workspace" aria-labelledby="workspace-heading" className="mb-10">
        <h2 id="workspace-heading" className="mb-4 text-lg font-semibold">
          Snippet workspace
        </h2>
        <div className="panel space-y-4 p-4">
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <div className="space-y-2">
              <Label htmlFor="snippet-title">Title</Label>
              <Input
                id="snippet-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Two Sum — hash map solution"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="snippet-language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="snippet-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="snippet-code">Code</Label>
            <Textarea
              id="snippet-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              spellCheck={false}
              rows={14}
              className="font-mono text-sm"
              placeholder="Write your solution here."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="snippet-notes">Notes (complexity, edge cases, what you learned)</Label>
            <Textarea
              id="snippet-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={save} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" aria-hidden="true" />
              {activeId ? "Update snippet" : "Save snippet"}
            </Button>
            <Button variant="outline" onClick={copyCode} className="gap-2">
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copy code
            </Button>
            {RUNNERS.map((runner) => (
              <Button key={runner.label} variant="ghost" size="sm" asChild>
                <a href={runner.url} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                  {runner.label}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            External compilers are third-party sites. EngineerOS does not send your code to them —
            copy it across yourself.
          </p>
        </div>
      </section>

      <section aria-labelledby="library-heading">
        <h2 id="library-heading" className="mb-4 text-lg font-semibold">
          Your snippet library ({snippets.length})
        </h2>
        {snippets.length === 0 ? (
          <p className="panel p-6 text-sm text-muted-foreground">
            Nothing saved yet. Open a challenge above and store your first solution.
          </p>
        ) : (
          <ul className="space-y-3">
            {snippets.map((snippet) => (
              <li key={snippet.id} className="panel flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-[200px] flex-1">
                  <p className="text-sm font-semibold">{snippet.title}</p>
                  <p className="label-mono text-muted-foreground">
                    {snippet.language} · updated {new Date(snippet.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => loadSnippet(snippet.id)}>
                  Open
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Delete ${snippet.title}`}
                  onClick={() => remove(snippet.id)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
