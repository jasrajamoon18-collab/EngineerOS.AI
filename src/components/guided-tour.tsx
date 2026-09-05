import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "engineeros.tour.seen.v1";

type Step = {
  title: string;
  body: string;
  to: string;
  cta: string;
};

const steps: Step[] = [
  {
    title: "Your dashboard is mission control",
    body: "Every visit starts with Today's Mission and a single Next Best Action, worked out from what you have actually completed — no guesswork.",
    to: "/dashboard",
    cta: "Open dashboard",
  },
  {
    title: "Learn, then practise",
    body: "Courses and academies live under Learn, Programming and Linux. DSA Practice, Code Lab and SQL Lab are where you drill what you just read.",
    to: "/learn",
    cta: "Browse courses",
  },
  {
    title: "Build things worth showing",
    body: "Project Lab tracks milestones for real projects, and Portfolio turns them into a page you choose to share.",
    to: "/projects",
    cta: "See project ideas",
  },
  {
    title: "Get hired, honestly",
    body: "Resume, Interview, Skill Gap and Application Tracker are self-assessment and organisation tools. They never claim to predict hiring outcomes.",
    to: "/resume",
    cta: "Open resume tools",
  },
  {
    title: "Search anything with Ctrl K",
    body: "Press Ctrl K (or Cmd K) anywhere to jump to a page, course, problem or project idea instantly.",
    to: "/dashboard",
    cta: "Start working",
  },
];

export function GuidedTour() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== "true") setOpen(true);
  }, []);

  function finish() {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
    setIndex(0);
  }

  const step = steps[index]!;
  const last = index === steps.length - 1;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) finish();
        else setOpen(true);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <p className="label-mono text-primary">
            Guided tour · step {index + 1} of {steps.length}
          </p>
          <DialogTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" aria-hidden="true" />
            {step.title}
          </DialogTitle>
          <DialogDescription>{step.body}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" onClick={finish}>
            Skip tour
          </Button>
          <div className="flex gap-2">
            {index > 0 ? (
              <Button variant="outline" onClick={() => setIndex((value) => value - 1)}>
                Back
              </Button>
            ) : null}
            {last ? (
              <Button asChild onClick={finish}>
                <Link to={step.to}>{step.cta}</Link>
              </Button>
            ) : (
              <Button onClick={() => setIndex((value) => value + 1)}>Next</Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function restartTour() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}
