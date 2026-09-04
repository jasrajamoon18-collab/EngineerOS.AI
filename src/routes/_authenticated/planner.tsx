import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CalendarRange, Loader2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { latestStudyPlanQuery } from "@/lib/queries";
import { generateStudyPlan } from "@/lib/planner.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({
    meta: [
      { title: "Weekly Planner — EngineerOS" },
      {
        name: "description",
        content:
          "Turn your goal and available hours into a realistic seven-day study plan you can tick off.",
      },
      { property: "og:title", content: "Weekly Planner — EngineerOS" },
      {
        property: "og:description",
        content: "A seven-day study plan built around your goal, branch and available hours.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlannerPage,
});

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function mondayOf(date = new Date()) {
  const d = new Date(date);
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}

function PlannerPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const generate = useServerFn(generateStudyPlan);
  const [focus, setFocus] = useState("");
  const [hours, setHours] = useState(10);
  const [pending, setPending] = useState(false);

  const { data: current } = useQuery(latestStudyPlanQuery(user?.id));

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
        eyebrow="Planning"
        title="Weekly Planner"
        description="Describe this week's focus and how many hours you actually have. The plan is a suggestion you own and can tick off — nothing is scheduled or sent anywhere."
      />

      <form onSubmit={onGenerate} className="panel mb-8 grid gap-4 p-5 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
        <div>
          <Label htmlFor="focus">This week's focus</Label>
          <Input
            id="focus"
            value={focus}
            onChange={(event) => setFocus(event.target.value)}
            maxLength={120}
            placeholder="Arrays and strings, plus finish the Linux basics course"
            className="mt-1.5"
            required
          />
        </div>
        <div>
          <Label htmlFor="hours">Hours available</Label>
          <Input
            id="hours"
            type="number"
            min={2}
            max={60}
            value={hours}
            onChange={(event) => setHours(Number(event.target.value))}
            className="mt-1.5"
          />
        </div>
        <Button type="submit" disabled={pending || !focus.trim()}>
          {pending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          Build my week
        </Button>
      </form>

      {!current ? (
        <div className="panel p-8 text-center">
          <CalendarRange className="mx-auto h-6 w-6 text-primary" aria-hidden="true" />
          <h2 className="mt-3 text-base font-semibold">No plan yet</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Tell the planner what you want to move forward this week and how much time you have.
          </p>
        </div>
      ) : (
        <section>
          <div className="panel mb-6 p-5">
            <p className="label-mono text-primary">Week of {current.plan.week_start}</p>
            <h2 className="mt-1 text-base font-semibold">{current.plan.focus}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{current.plan.summary}</p>
            <p className="label-mono mt-3 text-muted-foreground">
              {doneCount} of {items.length} done
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {DAYS.map((day, index) => {
              const dayItems = items.filter((item) => item.day_index === index);
              if (dayItems.length === 0) return null;
              return (
                <article key={day} className="panel p-5">
                  <h3 className="text-sm font-semibold">{day}</h3>
                  <ul className="mt-3 space-y-2">
                    {dayItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start gap-3 rounded-lg border border-border p-3"
                      >
                        <Checkbox
                          id={item.id}
                          checked={item.is_done}
                          onCheckedChange={() => void onToggle(item.id, item.is_done)}
                          className="mt-0.5"
                        />
                        <label htmlFor={item.id} className="flex-1 cursor-pointer">
                          <span
                            className={cn(
                              "block text-sm font-medium",
                              item.is_done && "text-muted-foreground line-through",
                            )}
                          >
                            {item.title}
                          </span>
                          {item.detail ? (
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {item.detail}
                            </span>
                          ) : null}
                        </label>
                        <span className="label-mono shrink-0 text-muted-foreground">
                          {item.est_minutes}m
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
