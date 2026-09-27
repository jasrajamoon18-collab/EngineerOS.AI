import { useEffect, useRef, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  ArrowRight,
  BellRing,
  Bot,
  GraduationCap,
  Loader2,
  Send,
  Sparkles,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Markdown } from "@/lib/markdown";
import { useAuth } from "@/hooks/useAuth";
import { mentorMessagesQuery } from "@/lib/queries";
import { askMentor } from "@/lib/mentor.functions";
import { cn } from "@/lib/utils";
import { KernelAuditorView } from "@/components/kernel-auditor-view";
import { ShieldAlert, MessagesSquare } from "lucide-react";

export const Route = createFileRoute("/_authenticated/mentor")({
  head: () => ({
    meta: [
      { title: "AI Mentor & Adaptive Guidance — EngineerOS" },
      {
        name: "description",
        content:
          "Ask an AI mentor that knows your branch, year, goal, and progress, with Year 1/2/3 explanation depth toggles and personalized nudges.",
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

const NUDGES = [
  {
    id: "nudge-linux",
    topic: "Linux Academy",
    message:
      "You haven't touched Linux permissions or piping drills in 4 days. Quick 10-minute session today?",
    route: "/linux",
    action: "Open Linux Academy",
  },
  {
    id: "nudge-dsa",
    topic: "DSA Practice",
    message:
      "Two Pointers problem pattern has a high success rate on technical rounds. Ready for a challenge?",
    route: "/dsa",
    action: "Solve in Monaco Sandbox",
  },
  {
    id: "nudge-interview",
    topic: "Interview Academy",
    message: "Benchmark your communication depth with an AI Mock Interview viva question.",
    route: "/interview",
    action: "Start Mock Interview",
  },
];

function MentorPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const send = useServerFn(askMentor);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [yearLevel, setYearLevel] = useState<"1" | "2" | "3">("2");
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
      await send({ data: { message, yearLevel } });
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
        eyebrow="Career OS Intelligence"
        title="The Kernel Auditor & AI Mentor"
        description="The mentor stops giving generic lectures and starts auditing: cross-referencing your claimed skills against immutable Proof Wall receipts, and issuing 1 corrective directive."
      />

      <Tabs defaultValue="auditor" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 font-mono text-xs">
          <TabsTrigger value="auditor" className="gap-1.5 py-2">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>The Kernel Auditor</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-1.5 py-2">
            <MessagesSquare className="h-3.5 w-3.5" />
            <span>Advisory Chat</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="auditor" className="m-0">
          <KernelAuditorView />
        </TabsContent>

        <TabsContent value="chat" className="m-0 space-y-4">
          {/* Mentor-Initiated Nudges Card */}
          <div className="panel mb-4 p-4 bg-primary/5 border border-primary/20 space-y-3">
            <div className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Mentor-Initiated Comeback Nudges
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {NUDGES.map((nudge) => (
                <div
                  key={nudge.id}
                  className="rounded-lg border border-border bg-card p-3 flex flex-col justify-between space-y-2 text-xs"
                >
                  <div className="space-y-1">
                    <Badge
                      variant="outline"
                      className="text-[10px] py-0 text-primary border-primary/30"
                    >
                      {nudge.topic}
                    </Badge>
                    <p className="text-muted-foreground text-xs leading-relaxed">{nudge.message}</p>
                  </div>

                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs justify-start px-0 text-primary hover:bg-transparent hover:underline"
                  >
                    <Link to={nudge.route}>
                      {nudge.action} <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Main Chat Panel */}
          <div className="panel flex h-[calc(100vh-21rem)] min-h-[440px] flex-col">
            {/* Year Depth Level Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-2.5 text-xs">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground">Explanation Depth:</span>
              </div>

              <div
                className="flex items-center gap-1.5"
                role="group"
                aria-label="Explanation depth"
              >
                <Button
                  type="button"
                  size="sm"
                  variant={yearLevel === "1" ? "default" : "outline"}
                  onClick={() => setYearLevel("1")}
                  className="h-7 px-2.5 text-xs font-normal"
                >
                  Year 1 (Intuitive Analogies)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={yearLevel === "2" ? "default" : "outline"}
                  onClick={() => setYearLevel("2")}
                  className="h-7 px-2.5 text-xs font-normal"
                >
                  Year 2 (Core CS & Theory)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={yearLevel === "3" ? "default" : "outline"}
                  onClick={() => setYearLevel("3")}
                  className="h-7 px-2.5 text-xs font-normal"
                >
                  Year 3+ (Placement / Production)
                </Button>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Bot className="h-10 w-10 text-muted-foreground opacity-50" />
                  <p className="mt-3 text-sm font-medium">
                    How can I support your engineering journey today?
                  </p>
                  <p className="mt-1 max-w-md text-xs text-muted-foreground">
                    Ask about study plans, debugging mental models, DSA algorithms, or semester exam
                    prep.
                  </p>

                  <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-xl">
                    {starters.map((starter) => (
                      <Button
                        key={starter}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto py-1.5 px-3 whitespace-normal text-left"
                        onClick={() => submit(starter)}
                      >
                        {starter}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const isUser = message.role === "user";
                  return (
                    <div
                      key={message.id}
                      className={cn("flex flex-col", isUser ? "items-end" : "items-start")}
                    >
                      <span className="label-mono mb-1 text-[11px] text-muted-foreground">
                        {isUser ? "You" : "AI Mentor"}
                      </span>
                      <div
                        className={cn(
                          "max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed",
                          isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-surface border border-border text-foreground",
                        )}
                      >
                        <Markdown content={message.content} />
                      </div>
                    </div>
                  );
                })
              )}

              {pending && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Mentor is thinking (Year {yearLevel} depth mode)…
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
              className="border-t border-border p-3"
            >
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask the mentor with Year ${yearLevel} depth level (or Shift+Enter for new line)...`}
                  rows={2}
                  className="resize-none text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submit(input);
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={pending || !input.trim()}
                  size="icon"
                  className="h-full px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
