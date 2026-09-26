import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  CalendarRange,
  CheckCircle2,
  Clock,
  GraduationCap,
  Loader2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Timer,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { latestStudyPlanQuery } from "@/lib/queries";
import { generateStudyPlan } from "@/lib/planner.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({
    meta: [
      { title: "Weekly & Semester Planner — EngineerOS" },
      {
        name: "description",
        content:
          "AI weekly study plan generator, integrated Pomodoro focus timer, and semester examination countdown tracker.",
      },
      { property: "og:title", content: "Weekly & Semester Planner — EngineerOS" },
      {
        property: "og:description",
        content:
          "A complete engineering productivity station: study plans, focus timer, and exam schedules.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlannerPage,
});

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface ExamDeadline {
  id: string;
  subject: string;
  type: "Midterm / Internal" | "End-Semester Theory" | "Lab Practical" | "Capstone Review";
  date: string;
}

const DEFAULT_DEADLINES: ExamDeadline[] = [
  {
    id: "ex-1",
    subject: "Data Structures & Algorithms Theory",
    type: "End-Semester Theory",
    date: "2026-11-15",
  },
  {
    id: "ex-2",
    subject: "Operating Systems Systems Lab Practical",
    type: "Lab Practical",
    date: "2026-11-22",
  },
  {
    id: "ex-3",
    subject: "Computer Networks Midterm Examination",
    type: "Midterm / Internal",
    date: "2026-10-20",
  },
];

function mondayOf(date = new Date()) {
  const d = new Date(date);
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}

function calculateDaysLeft(dateStr: string): number {
  const target = new Date(dateStr).getTime();
  const now = new Date().getTime();
  const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

function PlannerPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const generate = useServerFn(generateStudyPlan);
  const [focus, setFocus] = useState("");
  const [hours, setHours] = useState(10);
  const [pending, setPending] = useState(false);

  // Pomodoro Focus state
  const [timerMode, setTimerMode] = useState<"focus" | "shortBreak" | "longBreak">("focus");
  const [timeRemaining, setTimeRemaining] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);

  // Exam Deadlines state
  const [deadlines, setDeadlines] = useState<ExamDeadline[]>(() => {
    try {
      const saved = localStorage.getItem("eos_exam_deadlines");
      return saved ? JSON.parse(saved) : DEFAULT_DEADLINES;
    } catch {
      return DEFAULT_DEADLINES;
    }
  });
  const [newSubj, setNewSubj] = useState("");
  const [newType, setNewType] = useState<ExamDeadline["type"]>("End-Semester Theory");
  const [newDate, setNewDate] = useState("");

  const { data: current } = useQuery(latestStudyPlanQuery(user?.id));

  // Pomodoro countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      if (timerMode === "focus") {
        setCompletedSessions((c) => c + 1);
        toast.success("Focus block complete! Take a 5-minute break.");
        switchTimerMode("shortBreak");
      } else {
        toast.info("Break is over! Ready for the next focus sprint?");
        switchTimerMode("focus");
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, timerMode]);

  function switchTimerMode(mode: "focus" | "shortBreak" | "longBreak") {
    setTimerMode(mode);
    setIsRunning(false);
    if (mode === "focus") setTimeRemaining(25 * 60);
    if (mode === "shortBreak") setTimeRemaining(5 * 60);
    if (mode === "longBreak") setTimeRemaining(15 * 60);
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  function handleAddDeadline() {
    if (!newSubj.trim() || !newDate) {
      toast.error("Please provide both subject name and exam date.");
      return;
    }
    const item: ExamDeadline = {
      id: `ex-${Date.now()}`,
      subject: newSubj.trim(),
      type: newType,
      date: newDate,
    };
    const updated = [...deadlines, item].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    setDeadlines(updated);
    localStorage.setItem("eos_exam_deadlines", JSON.stringify(updated));
    setNewSubj("");
    setNewDate("");
    toast.success("Exam schedule recorded!");
  }

  function handleDeleteDeadline(id: string) {
    const updated = deadlines.filter((d) => d.id !== id);
    setDeadlines(updated);
    localStorage.setItem("eos_exam_deadlines", JSON.stringify(updated));
  }

  async function onGenerate(event: React.FormEvent) {
    event.preventDefault();
    if (!focus.trim() || pending) return;
    setPending(true);
    try {
      await generate({
        data: { focus: focus.trim(), hoursPerWeek: hours, weekStart: mondayOf() },
      });
      await queryClient.invalidateQueries({ queryKey: ["study-plan", user?.id] });
      toast.success("Your week is planned.");
      setFocus("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not build a plan.");
    } finally {
      setPending(false);
    }
  }

  async function onToggle(id: string, done: boolean) {
    const { error } = await supabase
      .from("study_plan_items")
      .update({ is_done: !done })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["study-plan", user?.id] });
  }

  const items = current?.items ?? [];
  const doneCount = items.filter((item) => item.is_done).length;

  return (
    <>
      <PageHeader
        eyebrow="Productivity & Focus Engine"
        title="Engineering Planner & Focus Station"
        description="Seven-day weekly study plans, Pomodoro focus timer, and semester examination countdown tracker."
      />

      <Tabs defaultValue="weekly" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-9">
          <TabsTrigger value="weekly" className="text-xs gap-1.5">
            <CalendarRange className="h-3.5 w-3.5" />
            Weekly Study Plan
          </TabsTrigger>
          <TabsTrigger value="pomodoro" className="text-xs gap-1.5">
            <Timer className="h-3.5 w-3.5" />
            Pomodoro Focus Station
          </TabsTrigger>
          <TabsTrigger value="exams" className="text-xs gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" />
            Semester & Exam Countdown
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Weekly Study Plan */}
        <TabsContent value="weekly" className="space-y-6">
          <form
            onSubmit={onGenerate}
            className="panel grid gap-4 p-5 sm:grid-cols-[2fr_1fr_auto] sm:items-end border-border"
          >
            <div>
              <Label htmlFor="focus" className="text-xs">
                This week's focus
              </Label>
              <Input
                id="focus"
                value={focus}
                onChange={(event) => setFocus(event.target.value)}
                maxLength={120}
                placeholder="e.g. Master Binary Search Trees, finish Linux shell scripting"
                className="mt-1.5 text-xs bg-background h-9"
                required
              />
            </div>
            <div>
              <Label htmlFor="hours" className="text-xs">
                Hours available this week
              </Label>
              <Input
                id="hours"
                type="number"
                min={2}
                max={60}
                value={hours}
                onChange={(event) => setHours(Number(event.target.value))}
                className="mt-1.5 text-xs bg-background h-9"
                required
              />
            </div>
            <Button type="submit" disabled={pending} className="gap-2 text-xs h-9">
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Build weekly plan
                </>
              )}
            </Button>
          </form>

          {current ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                  <h2 className="text-base font-semibold">
                    Week of {current.week_start} · {current.focus}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Target: {current.hours_per_week} hours · {doneCount}/{items.length} tasks
                    completed
                  </p>
                </div>
                <Badge variant={doneCount === items.length ? "default" : "secondary"}>
                  {Math.round((doneCount / (items.length || 1)) * 100)}% complete
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {DAYS.map((day, dayIndex) => {
                  const dayItems = items.filter((item) => item.day_of_week === dayIndex + 1);
                  return (
                    <div key={day} className="panel p-4 border-border space-y-3">
                      <div className="flex items-center justify-between border-b border-border/60 pb-2">
                        <span className="text-xs font-bold text-foreground">{day}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {dayItems.length} activities
                        </span>
                      </div>

                      {dayItems.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2 italic">
                          Rest or catch-up buffer
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {dayItems.map((item) => (
                            <li
                              key={item.id}
                              className={cn(
                                "flex items-start gap-2.5 rounded p-2 text-xs transition-colors",
                                item.is_done
                                  ? "bg-muted/30 text-muted-foreground"
                                  : "bg-card hover:bg-muted/20",
                              )}
                            >
                              <Checkbox
                                id={item.id}
                                checked={item.is_done}
                                onCheckedChange={() => onToggle(item.id, item.is_done)}
                                className="mt-0.5"
                              />
                              <div className="flex-1 space-y-0.5">
                                <label
                                  htmlFor={item.id}
                                  className={cn(
                                    "cursor-pointer font-medium block leading-tight",
                                    item.is_done && "line-through opacity-70",
                                  )}
                                >
                                  {item.title}
                                </label>
                                <span className="text-[10px] text-muted-foreground">
                                  {item.duration_minutes} mins
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="panel p-8 text-center text-muted-foreground text-xs">
              No weekly study plan generated yet. Enter your focus area and weekly hours above to
              synthesize a customized plan.
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Pomodoro Focus Station */}
        <TabsContent value="pomodoro" className="space-y-6">
          <div className="panel max-w-xl mx-auto p-8 border-border text-center space-y-6">
            <div className="flex justify-center gap-2">
              <Button
                size="sm"
                variant={timerMode === "focus" ? "default" : "outline"}
                onClick={() => switchTimerMode("focus")}
                className="text-xs"
              >
                Focus Sprint (25m)
              </Button>
              <Button
                size="sm"
                variant={timerMode === "shortBreak" ? "default" : "outline"}
                onClick={() => switchTimerMode("shortBreak")}
                className="text-xs"
              >
                Short Break (5m)
              </Button>
              <Button
                size="sm"
                variant={timerMode === "longBreak" ? "default" : "outline"}
                onClick={() => switchTimerMode("longBreak")}
                className="text-xs"
              >
                Long Break (15m)
              </Button>
            </div>

            <div className="py-6">
              <span className="font-mono text-7xl font-bold tracking-tight text-primary">
                {formatTime(timeRemaining)}
              </span>
              <p className="mt-2 text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                {timerMode === "focus" ? "Deep Focus Session" : "Rest & Recharge"}
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <Button
                size="lg"
                onClick={() => setIsRunning(!isRunning)}
                className="gap-2 px-8 font-semibold text-sm"
              >
                {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isRunning ? "Pause" : "Start Focus"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => switchTimerMode(timerMode)}
                className="gap-1.5 text-xs"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>Completed Sessions Today:</span>
              <Badge variant="secondary" className="font-mono text-xs">
                {completedSessions} Pomodoros ({completedSessions * 25} mins)
              </Badge>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Semester & Exam Countdown */}
        <TabsContent value="exams" className="space-y-6">
          <section className="panel p-5 border-border space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              Add Upcoming Exam or Assignment Deadline
            </h3>
            <div className="grid gap-3 sm:grid-cols-4 items-end">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs">Subject / Exam Name</Label>
                <Input
                  value={newSubj}
                  onChange={(e) => setNewSubj(e.target.value)}
                  placeholder="e.g. Operating Systems Lab Practical"
                  className="h-9 text-xs bg-background"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Exam Date</Label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="h-9 text-xs bg-background"
                />
              </div>
              <Button onClick={handleAddDeadline} className="h-9 text-xs gap-1.5 font-semibold">
                <Plus className="h-3.5 w-3.5" />
                Add to Tracker
              </Button>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {deadlines.map((item) => {
              const daysLeft = calculateDaysLeft(item.date);
              const isUrgent = daysLeft <= 7;
              return (
                <article
                  key={item.id}
                  className={`panel p-4 border transition-all flex flex-col justify-between ${
                    isUrgent ? "border-amber-500/40 bg-amber-500/5" : "border-border"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="outline" className="text-[10px]">
                        {item.type}
                      </Badge>
                      <button
                        onClick={() => handleDeleteDeadline(item.id)}
                        className="text-muted-foreground hover:text-destructive text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-foreground leading-snug">
                      {item.subject}
                    </h4>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">Time Remaining:</span>
                    <Badge
                      variant="default"
                      className={
                        daysLeft === 0
                          ? "bg-destructive text-destructive-foreground"
                          : isUrgent
                            ? "bg-amber-500 text-white"
                            : "bg-primary text-primary-foreground"
                      }
                    >
                      {daysLeft === 0 ? "Today!" : `${daysLeft} Days Left`}
                    </Badge>
                  </div>
                </article>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
