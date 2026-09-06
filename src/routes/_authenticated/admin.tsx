import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { isAdminQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Content Console — EngineerOS" },
      {
        name: "description",
        content:
          "Role-gated console for adding daily tasks, DSA problems and aptitude questions to EngineerOS.",
      },
      { property: "og:title", content: "Admin Content Console — EngineerOS" },
      {
        property: "og:description",
        content: "Server-enforced admin-only content management for EngineerOS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function AdminPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: isAdmin, isLoading } = useQuery(isAdminQuery(user?.id));

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Checking permissions…</p>;
  }

  if (!isAdmin) {
    return (
      <>
        <PageHeader eyebrow="Restricted" title="Admin Content Console" />
        <div className="panel flex items-start gap-3 p-6">
          <ShieldAlert className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h2 className="font-semibold">You do not have admin access</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Roles are stored server-side and enforced by database policies, so this console cannot
              be unlocked from the browser. Ask an existing admin to grant you the role.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Admin Content Console"
        description="Add catalogue content. Every write is re-checked by database policies, so this form is a convenience, not the security boundary."
        actions={
          <span className="label-mono flex items-center gap-2 text-primary">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" /> admin
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <DailyTaskForm onDone={() => queryClient.invalidateQueries({ queryKey: ["daily-tasks"] })} />
        <DsaProblemForm onDone={() => queryClient.invalidateQueries({ queryKey: ["dsa-problems"] })} />
        <AptitudeForm
          onDone={() => queryClient.invalidateQueries({ queryKey: ["aptitude-questions"] })}
        />
      </div>
    </>
  );
}

function Panel({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="panel space-y-3 p-5">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </div>
      {children}
    </section>
  );
}

function DailyTaskForm({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [track, setTrack] = useState("programming");
  const [xp, setXp] = useState(20);
  const [minutes, setMinutes] = useState(20);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!title.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("daily_tasks").insert({
      slug: slugify(title),
      title: title.trim(),
      description: description.trim() || null,
      track: track as "programming" | "linux" | "dsa" | "core" | "career",
      xp,
      est_minutes: minutes,
      order_index: 100,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Daily task added.");
    setTitle("");
    setDescription("");
    onDone();
  }

  return (
    <Panel title="New daily task" hint="Appears in the shared daily task pool for all students.">
      <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="grid grid-cols-3 gap-2">
        <label className="text-xs text-muted-foreground">
          Track
          <select
            value={track}
            onChange={(e) => setTrack(e.target.value)}
            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            {["programming", "linux", "dsa", "core", "career"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted-foreground">
          XP
          <Input
            type="number"
            className="mt-1"
            value={xp}
            onChange={(e) => setXp(Number(e.target.value))}
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Minutes
          <Input
            type="number"
            className="mt-1"
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
          />
        </label>
      </div>
      <Button onClick={submit} disabled={busy || !title.trim()}>
        {busy ? "Saving…" : "Add task"}
      </Button>
    </Panel>
  );
}

function DsaProblemForm({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("arrays");
  const [level, setLevel] = useState("beginner");
  const [statement, setStatement] = useState("");
  const [hint, setHint] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!title.trim() || !statement.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("dsa_problems").insert({
      slug: slugify(title),
      title: title.trim(),
      topic,
      level: level as "beginner" | "intermediate" | "advanced",
      statement: statement.trim(),
      hint: hint.trim() || null,
      order_index: 100,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("DSA problem added.");
    setTitle("");
    setStatement("");
    setHint("");
    onDone();
  }

  return (
    <Panel title="New DSA problem" hint="Written practice prompt — no code execution is involved.">
      <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          {["beginner", "intermediate", "advanced"].map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <Textarea
        placeholder="Problem statement"
        value={statement}
        onChange={(e) => setStatement(e.target.value)}
      />
      <Input placeholder="Hint (optional)" value={hint} onChange={(e) => setHint(e.target.value)} />
      <Button onClick={submit} disabled={busy || !title.trim() || !statement.trim()}>
        {busy ? "Saving…" : "Add problem"}
      </Button>
    </Panel>
  );
}

function AptitudeForm({ onDone }: { onDone: () => void }) {
  const [question, setQuestion] = useState("");
  const [topic, setTopic] = useState("quantitative");
  const [level, setLevel] = useState("easy");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answerIndex, setAnswerIndex] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [busy, setBusy] = useState(false);

  const ready =
    question.trim().length > 0 &&
    explanation.trim().length > 0 &&
    options.every((o) => o.trim().length > 0);

  async function submit() {
    if (!ready) return;
    setBusy(true);
    const { error } = await supabase.from("aptitude_questions").insert({
      slug: slugify(question),
      topic,
      level,
      question: question.trim(),
      options: options.map((o) => o.trim()),
      answer_index: answerIndex,
      explanation: explanation.trim(),
      order_index: 100,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Aptitude question added.");
    setQuestion("");
    setOptions(["", "", "", ""]);
    setExplanation("");
    onDone();
  }

  return (
    <Panel
      title="New aptitude question"
      hint="Always include a worked explanation — drills are for learning, not scoring."
    >
      <Textarea
        placeholder="Question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          {["easy", "medium", "hard"].map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
      {options.map((opt, index) => (
        <label key={index} className="flex items-center gap-2">
          <input
            type="radio"
            name="answer-index"
            checked={answerIndex === index}
            onChange={() => setAnswerIndex(index)}
            aria-label={`Mark option ${index + 1} correct`}
            className="h-4 w-4 accent-primary"
          />
          <Input
            placeholder={`Option ${index + 1}`}
            value={opt}
            onChange={(e) =>
              setOptions((prev) => prev.map((v, i) => (i === index ? e.target.value : v)))
            }
          />
        </label>
      ))}
      <Textarea
        placeholder="Explanation"
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
      />
      <Button onClick={submit} disabled={busy || !ready}>
        {busy ? "Saving…" : "Add question"}
      </Button>
    </Panel>
  );
}
