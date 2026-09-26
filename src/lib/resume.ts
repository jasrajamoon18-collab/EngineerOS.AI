/**
 * Resume data model, ATS-friendly plain-text renderer and a transparent,
 * rule-based checker.
 *
 * IMPORTANT HONESTY NOTE: nothing here talks to a real applicant tracking
 * system. Every result is produced by the deterministic rules in this file and
 * is labelled as such in the UI. No score here predicts a real hiring outcome.
 */

export type ResumeExperience = {
  role: string;
  organisation: string;
  period: string;
  bullets: string[];
};

export type ResumeProjectEntry = {
  title: string;
  tech: string;
  link: string;
  bullets: string[];
};

export type ResumeEducation = {
  qualification: string;
  institution: string;
  period: string;
  detail: string;
};

export type ResumeData = {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  links: string[];
  summary: string;
  skills: string[];
  experience: ResumeExperience[];
  projects: ResumeProjectEntry[];
  education: ResumeEducation[];
  achievements: string[];
};

export const emptyResume: ResumeData = {
  fullName: "",
  headline: "",
  email: "",
  phone: "",
  location: "",
  links: [],
  summary: "",
  skills: [],
  experience: [],
  projects: [],
  education: [],
  achievements: [],
};

export function normaliseResume(value: unknown): ResumeData {
  const raw = (value ?? {}) as Partial<ResumeData>;
  return {
    ...emptyResume,
    ...raw,
    links: raw.links ?? [],
    skills: raw.skills ?? [],
    experience: raw.experience ?? [],
    projects: raw.projects ?? [],
    education: raw.education ?? [],
    achievements: raw.achievements ?? [],
  };
}

/** Single-column, no-tables, no-graphics plain text — the format parsers read best. */
export function renderResumeText(data: ResumeData): string {
  const lines: string[] = [];
  const push = (value?: string) => {
    if (value && value.trim()) lines.push(value.trim());
  };
  const section = (title: string) => {
    lines.push("", title.toUpperCase(), "-".repeat(title.length));
  };

  push(data.fullName);
  push(data.headline);
  push([data.email, data.phone, data.location].filter(Boolean).join(" | "));
  if (data.links.length) push(data.links.join(" | "));

  if (data.summary.trim()) {
    section("Summary");
    push(data.summary);
  }
  if (data.skills.length) {
    section("Skills");
    push(data.skills.join(", "));
  }
  if (data.experience.length) {
    section("Experience");
    for (const item of data.experience) {
      push([item.role, item.organisation, item.period].filter(Boolean).join(" | "));
      for (const bullet of item.bullets) push(`- ${bullet}`);
    }
  }
  if (data.projects.length) {
    section("Projects");
    for (const item of data.projects) {
      push([item.title, item.tech, item.link].filter(Boolean).join(" | "));
      for (const bullet of item.bullets) push(`- ${bullet}`);
    }
  }
  if (data.education.length) {
    section("Education");
    for (const item of data.education) {
      push([item.qualification, item.institution, item.period].filter(Boolean).join(" | "));
      push(item.detail);
    }
  }
  if (data.achievements.length) {
    section("Achievements");
    for (const item of data.achievements) push(`- ${item}`);
  }

  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* Rule-based checks                                                           */
/* -------------------------------------------------------------------------- */

export type CheckStatus = "pass" | "warn" | "fail";

export type ResumeCheck = {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
  weight: number;
};

export type ResumeAnalysisResult = {
  score: number;
  checks: ResumeCheck[];
  matchedKeywords: string[];
  missingKeywords: string[];
};

const ACTION_VERBS = [
  "built",
  "designed",
  "implemented",
  "led",
  "shipped",
  "automated",
  "optimised",
  "optimized",
  "reduced",
  "improved",
  "migrated",
  "developed",
  "tested",
  "deployed",
  "analysed",
  "analyzed",
  "created",
  "integrated",
  "debugged",
  "refactored",
  "measured",
  "launched",
];

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "you",
  "your",
  "our",
  "are",
  "will",
  "that",
  "this",
  "have",
  "from",
  "they",
  "who",
  "have",
  "has",
  "been",
  "were",
  "was",
  "not",
  "but",
  "all",
  "any",
  "can",
  "use",
  "using",
  "work",
  "working",
  "team",
  "teams",
  "role",
  "good",
  "strong",
  "experience",
  "experiences",
  "years",
  "year",
  "ability",
  "knowledge",
  "skills",
  "skill",
  "plus",
  "must",
  "should",
  "would",
  "about",
  "into",
  "other",
  "such",
  "across",
  "within",
  "their",
  "them",
  "its",
  "also",
  "more",
  "most",
  "help",
  "new",
  "well",
  "etc",
]);

export function extractKeywords(text: string, limit = 25): string[] {
  const counts = new Map<string, number>();
  for (const token of text.toLowerCase().match(/[a-z][a-z+#.-]{2,}/g) ?? []) {
    const word = token.replace(/[.-]+$/, "");
    if (word.length < 3 || STOP_WORDS.has(word)) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word]) => word);
}

/**
 * Deterministic structural + keyword checks. Same input always gives the same
 * output; there is no model and no external service involved.
 */
export function analyseResume(data: ResumeData, jobDescription: string): ResumeAnalysisResult {
  const text = renderResumeText(data).toLowerCase();
  const checks: ResumeCheck[] = [];
  const allBullets = [
    ...data.experience.flatMap((item) => item.bullets),
    ...data.projects.flatMap((item) => item.bullets),
  ].filter((bullet) => bullet.trim());

  const contactParts = [data.email, data.phone, data.location].filter((v) => v.trim()).length;
  checks.push({
    id: "contact",
    label: "Contact block is complete",
    weight: 10,
    status: contactParts >= 3 ? "pass" : contactParts >= 1 ? "warn" : "fail",
    detail:
      contactParts >= 3
        ? "Email, phone and location are all present."
        : "Parsers index the header first — include email, phone and city.",
  });

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email.trim());
  checks.push({
    id: "email",
    label: "Email address looks valid",
    weight: 5,
    status: emailOk ? "pass" : "fail",
    detail: emailOk
      ? "Format is parseable."
      : "Use a plain professional address, e.g. name@domain.com.",
  });

  const sectionCount = [
    data.summary.trim() ? 1 : 0,
    data.skills.length ? 1 : 0,
    data.experience.length ? 1 : 0,
    data.projects.length ? 1 : 0,
    data.education.length ? 1 : 0,
  ].reduce((a, b) => a + b, 0);
  checks.push({
    id: "sections",
    label: "Standard sections are present",
    weight: 15,
    status: sectionCount >= 4 ? "pass" : sectionCount >= 3 ? "warn" : "fail",
    detail: `${sectionCount} of 5 standard sections filled (summary, skills, experience, projects, education).`,
  });

  checks.push({
    id: "skills",
    label: "Skills are listed as plain text",
    weight: 10,
    status: data.skills.length >= 8 ? "pass" : data.skills.length >= 4 ? "warn" : "fail",
    detail: `${data.skills.length} skills listed. Aim for 8-15 concrete, role-relevant skills.`,
  });

  checks.push({
    id: "bullets",
    label: "Enough achievement bullets",
    weight: 10,
    status: allBullets.length >= 6 ? "pass" : allBullets.length >= 3 ? "warn" : "fail",
    detail: `${allBullets.length} bullets across experience and projects.`,
  });

  const verbBullets = allBullets.filter((bullet) =>
    ACTION_VERBS.some((verb) => bullet.trim().toLowerCase().startsWith(verb)),
  ).length;
  const verbRatio = allBullets.length ? verbBullets / allBullets.length : 0;
  checks.push({
    id: "verbs",
    label: "Bullets start with action verbs",
    weight: 10,
    status: verbRatio >= 0.6 ? "pass" : verbRatio >= 0.3 ? "warn" : "fail",
    detail: `${verbBullets} of ${allBullets.length || 0} bullets begin with a strong verb such as "Built" or "Reduced".`,
  });

  const quantified = allBullets.filter((bullet) => /\d/.test(bullet)).length;
  const quantRatio = allBullets.length ? quantified / allBullets.length : 0;
  checks.push({
    id: "metrics",
    label: "Bullets are quantified",
    weight: 10,
    status: quantRatio >= 0.4 ? "pass" : quantRatio >= 0.2 ? "warn" : "fail",
    detail: `${quantified} bullets contain a number. Numbers make impact verifiable.`,
  });

  const longBullets = allBullets.filter((bullet) => bullet.split(/\s+/).length > 32).length;
  checks.push({
    id: "length",
    label: "Bullets stay scannable",
    weight: 5,
    status: longBullets === 0 ? "pass" : longBullets <= 2 ? "warn" : "fail",
    detail:
      longBullets === 0
        ? "No bullet runs past ~32 words."
        : `${longBullets} bullet(s) exceed ~32 words — split them.`,
  });

  const links = data.links.filter((link) => link.trim());
  checks.push({
    id: "links",
    label: "Portfolio or repository link included",
    weight: 5,
    status: links.length ? "pass" : "warn",
    detail: links.length
      ? "Reviewers can see your work directly."
      : "Add a GitHub or portfolio URL — engineering roles expect one.",
  });

  const keywords = jobDescription.trim() ? extractKeywords(jobDescription) : [];
  const matchedKeywords = keywords.filter((word) => text.includes(word));
  const missingKeywords = keywords.filter((word) => !text.includes(word));
  if (keywords.length) {
    const ratio = matchedKeywords.length / keywords.length;
    checks.push({
      id: "keywords",
      label: "Job-description keyword coverage",
      weight: 20,
      status: ratio >= 0.5 ? "pass" : ratio >= 0.25 ? "warn" : "fail",
      detail: `${matchedKeywords.length} of ${keywords.length} frequent terms from the posting appear in your resume.`,
    });
  }

  const total = checks.reduce((sum, check) => sum + check.weight, 0);
  const earned = checks.reduce(
    (sum, check) =>
      sum + check.weight * (check.status === "pass" ? 1 : check.status === "warn" ? 0.5 : 0),
    0,
  );

  return {
    score: total ? Math.round((earned / total) * 100) : 0,
    checks,
    matchedKeywords,
    missingKeywords,
  };
}
