/**
 * Phase 3 deterministic engines.
 *
 * Everything in this file is a transparent, rule-based check that runs on the
 * student's own device. Nothing here predicts hiring outcomes, scores you
 * against other candidates, or sends your text to a third party. Every check
 * exposes the exact rule it applied so a student can disagree with it.
 */

export type Check = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
};

const FILLERS = [
  "very",
  "really",
  "basically",
  "actually",
  "just",
  "kind of",
  "sort of",
  "a lot of",
  "stuff",
  "things",
];

const BUZZWORDS = [
  "passionate",
  "hardworking",
  "dedicated",
  "ninja",
  "rockstar",
  "guru",
  "synergy",
  "detail-oriented",
  "team player",
  "reputed company",
];

const ACTION_VERBS = [
  "built",
  "designed",
  "shipped",
  "led",
  "implemented",
  "automated",
  "reduced",
  "improved",
  "migrated",
  "debugged",
  "wrote",
  "created",
  "measured",
  "tested",
  "deployed",
];

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function sentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function found(text: string, list: string[]): string[] {
  const lower = text.toLowerCase();
  return list.filter((word) => lower.includes(word));
}

function hasNumber(text: string): boolean {
  return /\d/.test(text);
}

export function checkScore(checks: Check[]): number {
  if (!checks.length) return 0;
  return Math.round((checks.filter((c) => c.passed).length / checks.length) * 100);
}

/* -------------------------------------------------------------------------
 * LinkedIn Career Center — draft checks (writing quality only)
 * ---------------------------------------------------------------------- */

export function analyseLinkedInDraft(sectionKey: string, text: string): Check[] {
  const count = wordCount(text);
  const buzz = found(text, BUZZWORDS);
  const verbs = found(text, ACTION_VERBS);
  const limits: Record<string, [number, number]> = {
    headline: [8, 25],
    about: [80, 300],
    experience: [30, 250],
    skills: [3, 40],
    activity: [30, 200],
  };
  const [min, max] = limits[sectionKey] ?? [20, 250];

  return [
    {
      id: "length",
      label: `Length is in the ${min}–${max} word range for this section`,
      passed: count >= min && count <= max,
      detail: `Your draft is ${count} words.`,
    },
    {
      id: "buzzwords",
      label: "No empty buzzwords",
      passed: buzz.length === 0,
      detail: buzz.length ? `Found: ${buzz.join(", ")}.` : "No flagged buzzwords found.",
    },
    {
      id: "specifics",
      label: "Contains at least one number or measurable detail",
      passed: hasNumber(text),
      detail: hasNumber(text)
        ? "A number was found in the draft."
        : "Add a count, percentage, duration or user number.",
    },
    {
      id: "verbs",
      label: "Uses concrete action verbs",
      passed: verbs.length > 0,
      detail: verbs.length ? `Found: ${verbs.join(", ")}.` : "Try built, shipped, reduced, led.",
    },
  ];
}

/* -------------------------------------------------------------------------
 * Communication Academy — writing feedback
 * ---------------------------------------------------------------------- */

export function analyseCommunication(text: string, minWords: number): Check[] {
  const count = wordCount(text);
  const list = sentences(text);
  const avg = list.length ? Math.round(count / list.length) : 0;
  const fillers = found(text, FILLERS);
  const longest = list.reduce((max, s) => Math.max(max, wordCount(s)), 0);

  return [
    {
      id: "length",
      label: `Answered at length (target ${minWords}+ words)`,
      passed: count >= minWords,
      detail: `You wrote ${count} words.`,
    },
    {
      id: "sentence-length",
      label: "Average sentence stays under 25 words",
      passed: avg > 0 && avg <= 25,
      detail: `Average sentence: ${avg} words across ${list.length} sentences.`,
    },
    {
      id: "no-monster-sentence",
      label: "No single sentence longer than 40 words",
      passed: longest <= 40,
      detail: `Longest sentence: ${longest} words.`,
    },
    {
      id: "fillers",
      label: "Few filler words",
      passed: fillers.length <= 2,
      detail: fillers.length ? `Found: ${fillers.join(", ")}.` : "No common fillers found.",
    },
    {
      id: "concrete",
      label: "Includes a concrete example, number or name",
      passed: hasNumber(text) || /for example|for instance|such as/i.test(text),
      detail: "Abstract answers are forgettable; anchor them to something real.",
    },
    {
      id: "structure",
      label: "Broken into more than one paragraph or has 4+ sentences",
      passed: text.includes("\n\n") || list.length >= 4,
      detail: `${list.length} sentences detected.`,
    },
  ];
}

/* -------------------------------------------------------------------------
 * Interview Academy — answer checks
 * ---------------------------------------------------------------------- */

const STAR_WORDS = ["situation", "task", "action", "result", "so i", "i decided", "outcome"];

export function analyseInterviewAnswer(params: {
  text: string;
  track: string;
  keywords: string[];
}): Check[] {
  const { text, track, keywords } = params;
  const count = wordCount(text);
  const lower = text.toLowerCase();
  const hits = keywords.filter((k) => lower.includes(k.toLowerCase()));
  const checks: Check[] = [
    {
      id: "length",
      label: "Answer is 90–300 words (about 60–120 seconds spoken)",
      passed: count >= 90 && count <= 300,
      detail: `You wrote ${count} words.`,
    },
    {
      id: "keywords",
      label: "Covers the expected vocabulary for this question",
      passed: keywords.length === 0 || hits.length >= Math.ceil(keywords.length / 2),
      detail: keywords.length
        ? `Matched ${hits.length}/${keywords.length}: ${hits.join(", ") || "none"}.`
        : "No keyword list for this question.",
    },
    {
      id: "ownership",
      label: 'Speaks in first person about your own work ("I")',
      passed: /\bi\b/i.test(text),
      detail: 'Interviewers score what you did, so "I" matters more than "we".',
    },
    {
      id: "evidence",
      label: "Contains a number, name or measurable outcome",
      passed: hasNumber(text),
      detail: hasNumber(text) ? "A number was found." : "Add scale, time saved or users.",
    },
    {
      id: "fillers",
      label: "Few filler words",
      passed: found(text, FILLERS).length <= 2,
      detail: `Found: ${found(text, FILLERS).join(", ") || "none"}.`,
    },
  ];

  if (track === "behavioural") {
    const star = found(lower, STAR_WORDS);
    checks.push({
      id: "star",
      label: "Follows a STAR-style structure",
      passed: star.length >= 2,
      detail: star.length ? `Signals found: ${star.join(", ")}.` : "Name the situation, what you did, and the result.",
    });
  }

  if (track === "technical") {
    checks.push({
      id: "tradeoff",
      label: "Names a trade-off or a limitation",
      passed: /trade[- ]?off|however|but |downside|limitation|instead/i.test(text),
      detail: "Senior-sounding answers say what the approach costs, not just what it does.",
    });
  }

  return checks;
}

/* -------------------------------------------------------------------------
 * Skill Gap Analyzer
 * ---------------------------------------------------------------------- */

export const SKILL_LEVELS = [
  { value: 0, label: "Not started" },
  { value: 1, label: "Heard of it" },
  { value: 2, label: "Used with help" },
  { value: 3, label: "Can use alone" },
  { value: 4, label: "Confident, can debug" },
  { value: 5, label: "Can teach it" },
];

export type SkillGapRow = {
  skillSlug: string;
  name: string;
  category: string;
  level: number;
  target: number;
  weight: number;
  gap: number;
};

export function computeSkillGap(params: {
  targets: { skill_slug: string; target_level: number; weight: number }[];
  skills: { slug: string; name: string; category: string }[];
  ratings: { skill_slug: string; level: number }[];
}) {
  const skillBySlug = new Map(params.skills.map((s) => [s.slug, s]));
  const levelBySlug = new Map(params.ratings.map((r) => [r.skill_slug, r.level]));

  const rows: SkillGapRow[] = params.targets
    .filter((t) => skillBySlug.has(t.skill_slug))
    .map((t) => {
      const skill = skillBySlug.get(t.skill_slug)!;
      const level = levelBySlug.get(t.skill_slug) ?? 0;
      return {
        skillSlug: t.skill_slug,
        name: skill.name,
        category: skill.category,
        level,
        target: t.target_level,
        weight: t.weight,
        gap: Math.max(0, t.target_level - level),
      };
    });

  const totalWeighted = rows.reduce((sum, r) => sum + r.weight * r.target, 0);
  const earned = rows.reduce((sum, r) => sum + r.weight * Math.min(r.level, r.target), 0);
  const coverage = totalWeighted ? Math.round((earned / totalWeighted) * 100) : 0;
  const rated = rows.filter((r) => levelBySlug.has(r.skillSlug)).length;

  const topGaps = [...rows]
    .filter((r) => r.gap > 0)
    .sort((a, b) => b.gap * b.weight - a.gap * a.weight)
    .slice(0, 5);

  return { rows, coverage, topGaps, rated, total: rows.length };
}

/** Where a student should go inside EngineerOS to close a specific gap. */
export const SKILL_ROUTES: Record<string, { to: string; label: string }> = {
  "programming-fundamentals": { to: "/programming", label: "Programming Academy" },
  "data-structures": { to: "/dsa", label: "DSA Practice" },
  algorithms: { to: "/dsa", label: "DSA Practice" },
  oop: { to: "/learn", label: "Learning library" },
  databases: { to: "/sql-lab", label: "SQL Lab" },
  "operating-systems": { to: "/learn", label: "Learning library" },
  networking: { to: "/learn", label: "Learning library" },
  linux: { to: "/linux", label: "Linux Academy" },
  git: { to: "/git", label: "Git & GitHub Hub" },
  debugging: { to: "/code-lab", label: "Code Lab" },
  "web-frontend": { to: "/projects", label: "Project Lab" },
  "web-backend": { to: "/projects", label: "Project Lab" },
  "system-design": { to: "/interview", label: "Interview Academy" },
  "cloud-deploy": { to: "/projects", label: "Project Lab" },
  "data-analysis": { to: "/sql-lab", label: "SQL Lab" },
  embedded: { to: "/projects", label: "Project Lab" },
  communication: { to: "/communication", label: "Communication Academy" },
  teamwork: { to: "/communication", label: "Communication Academy" },
  "problem-framing": { to: "/interview", label: "Interview Academy" },
  "interview-readiness": { to: "/interview", label: "Interview Academy" },
  "portfolio-proof": { to: "/portfolio", label: "Portfolio" },
};
