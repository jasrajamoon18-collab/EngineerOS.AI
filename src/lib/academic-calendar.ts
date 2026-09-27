// EngineerOS Semester-Aware Academic Calendar & Scheduling Engine

import {
  type AcademicExamPeriod,
  loadKernelState,
  saveKernelState,
  logToSyslog,
  calculateKernelOperatingMode,
} from "./kernel";

export interface AcademicSemesterMilestone {
  weekNumber: number;
  label: string;
  focusMode: "standard" | "overclock" | "low_power";
  recommendation: string;
}

export function getExamPeriods(): AcademicExamPeriod[] {
  const state = loadKernelState();
  return state.examPeriods || [];
}

export function addExamPeriod(period: Omit<AcademicExamPeriod, "id">): AcademicExamPeriod {
  const state = loadKernelState();
  const newPeriod: AcademicExamPeriod = {
    ...period,
    id: `exam-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  };

  const updatedPeriods = [...(state.examPeriods || []), newPeriod].sort((a, b) =>
    a.startDate.localeCompare(b.startDate),
  );

  saveKernelState({
    ...state,
    examPeriods: updatedPeriods,
  });

  const modeCalc = calculateKernelOperatingMode(updatedPeriods);
  logToSyslog(
    "SCHED",
    "OK",
    `Added exam period '${period.name}'. Kernel operating mode updated to: ${modeCalc.mode}.`,
  );

  return newPeriod;
}

export function deleteExamPeriod(id: string): void {
  const state = loadKernelState();
  const updatedPeriods = (state.examPeriods || []).filter((e) => e.id !== id);

  saveKernelState({
    ...state,
    examPeriods: updatedPeriods,
  });

  const modeCalc = calculateKernelOperatingMode(updatedPeriods);
  logToSyslog(
    "SCHED",
    "INFO",
    `Removed exam period. Kernel operating mode recalculated: ${modeCalc.mode}.`,
  );
}

/**
 * Generate 16-week academic semester schedule
 */
export function generateSemesterTimeline(semesterNumber = 5): AcademicSemesterMilestone[] {
  return [
    {
      weekNumber: 1,
      label: "Semester Kickoff & Syllabus Mapping",
      focusMode: "overclock",
      recommendation: "High bandwidth: Build projects & lock foundational DSA patterns.",
    },
    {
      weekNumber: 4,
      label: "Lab Submissions & Practical Units",
      focusMode: "standard",
      recommendation: "Balanced process: Write code, run Linux exercises, maintain daemons.",
    },
    {
      weekNumber: 8,
      label: "Mid-Semester Internals Exam Window",
      focusMode: "low_power",
      recommendation: "Kernel Low-Power: Suspend heavy coding, review university formula sheets.",
    },
    {
      weekNumber: 11,
      label: "Post-Internals Acceleration Sprint",
      focusMode: "overclock",
      recommendation:
        "Overclock Mode: Push project commits to Proof Wall & resume mock interviews.",
    },
    {
      weekNumber: 15,
      label: "End-Semester University Finals Prep",
      focusMode: "low_power",
      recommendation: "Maintenance Mode: Background daemons only. Focus 100% on academic GPA.",
    },
    {
      weekNumber: 16,
      label: "End-Semester Final Examinations",
      focusMode: "low_power",
      recommendation: "Throttle non-academic CPU load. Excel in semester finals.",
    },
  ];
}
