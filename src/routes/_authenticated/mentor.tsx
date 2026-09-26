import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Send, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/lib/markdown";
import { useAuth } from "@/hooks/useAuth";
import { mentorMessagesQuery } from "@/lib/queries";
import { askMentor } from "@/lib/mentor.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/mentor")({
  head: () => ({
    meta: [
      { title: "AI Mentor — EngineerOS" },
      {
        name: "description",
        content: "Ask an AI mentor that knows your branch, year, goal and progress.",
      },
      { property: "og:title", content: "AI Mentor — EngineerOS" },
      {
        property: "og:description",
        content: "Personalised engineering guidance, not generic advice.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MentorPage,
});

const starters = [
  "I'm in 2nd year CSE. What should I focus on this semester?",
  "How do I actually get good at DSA in 3 months?",
  "Explain Linux file permissions with an example.",
  "My streak keeps breaking. Give me a realistic daily plan.",
];

function MentorPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const send = useServerFn(askMentor);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { data: messages = [] } = useQuery(mentorMessagesQuery(user?.id));

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, pending]);

  async function submit(text: string) {
    const message = text.trim();
    if (!message || pending) return;
    setInput("");
    setPending(true);
    try {
      await send({ data: { message } });
      await queryClient.invalidateQueries({ queryKey: ["mentor-messages", user?.id] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The mentor could not respond.");
      setInput(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Guidance"
        title="AI Mentor"
        description="It knows your branch, year, goal and progress. It cannot run your code, see live jobs, or promise outcomes."
      />

      <div className="panel flex h-[calc(100vh-16rem)] min-h-[420px] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
          {messages.length === 0 ? (
            <div className="mx-auto max-w-lg py-8 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-primary" aria-hidden="true" />
              <h2 className="mt-3 text-base font-semibold">Ask your first question</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Be specific about your year, branch and what you're stuck on.
              </p>
              <div className="mt-5 grid gap-2">
                {starters.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => submit(starter)}
                    className="rounded-lg border border-border p-3 text-left text-sm transition-colors hover:bg-surface"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[85%] rounded-xl px-4 py-3 text-sm",
                  message.role === "user"
                    ? "ml-auto bg-primary/15 text-foreground"
                    : "border border-border bg-surface",
                )}
              >
                {message.role === "user" ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <Markdown content={message.content} />
                )}
              </div>
            ))
          )}
          {pending ? (
            <p className="label-mono flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Mentor is thinking…
            </p>
          ) : null}
          <div ref={endRef} />
        </div>

        <form
          className="flex items-end gap-2 border-t border-border p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submit(input);
          }}
        >
          <label htmlFor="mentor-input" className="sr-only">
            Message the AI Mentor
          </label>
          <Textarea
            id="mentor-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void submit(input);
              }
            }}
            rows={2}
            maxLength={2000}
            placeholder="Ask about your roadmap, a concept, or what to do next…"
            className="min-h-[52px] resize-none"
          />
          <Button type="submit" disabled={pending || !input.trim()} aria-label="Send message">
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </form>
      </div>
    </>
  );
}
