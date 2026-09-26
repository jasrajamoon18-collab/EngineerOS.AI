import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, Copy, FileCode2, Filter, Search, Terminal } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CHEAT_SHEETS, type CheatSheetCategory } from "@/lib/cheat-sheets-data";

export const Route = createFileRoute("/_authenticated/cheat-sheets")({
  head: () => ({
    meta: [
      { title: "Engineering Cheat Sheets — EngineerOS" },
      {
        name: "description",
        content:
          "Instant searchable cheat sheets for C/C++, Python, Linux, SQL, Git, Docker, and DSA complexities.",
      },
      { property: "og:title", content: "Engineering Cheat Sheets — EngineerOS" },
      {
        property: "og:description",
        content: "Searchable syntax, CLI commands, and algorithm complexity reference cards.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CheatSheetsPage,
});

function CheatSheetsPage() {
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>("c-cpp");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const activeCategory: CheatSheetCategory =
    CHEAT_SHEETS.find((c) => c.slug === activeCategorySlug) || CHEAT_SHEETS[0];

  function handleCopy(text: string, index: number) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 1500);
  }

  // Filter entries within the category or globally if search has content
  const displayedEntries = activeCategory.entries.filter((entry) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      entry.commandOrSyntax.toLowerCase().includes(q) ||
      entry.explanation.toLowerCase().includes(q) ||
      entry.tag.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <PageHeader
        eyebrow="Quick Reference & Memory Engine"
        title="Engineering Cheat Sheets"
        description="Searchable, verified syntax reference cards and complexity tables for coding, systems, databases, and DevOps."
      />

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {CHEAT_SHEETS.map((cat) => {
            const active = cat.slug === activeCategorySlug;
            return (
              <Button
                key={cat.id}
                size="sm"
                variant={active ? "default" : "outline"}
                className="text-xs gap-1.5 h-8"
                onClick={() => setActiveCategorySlug(cat.slug)}
              >
                <span>{cat.title.split(" ")[0]}</span>
                <Badge
                  variant="secondary"
                  className="text-[9px] px-1 py-0 h-4 bg-background/20 font-mono"
                >
                  {cat.entries.length}
                </Badge>
              </Button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search syntax, flags, commands…"
            className="pl-8 h-8 text-xs bg-background"
          />
        </div>
      </div>

      {/* Category Header */}
      <section className="panel p-5 border-border mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold">{activeCategory.title}</h2>
              <Badge variant="outline" className="text-[10px]">
                {activeCategory.badge}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{activeCategory.description}</p>
          </div>
        </div>

        {/* Summary Table if present */}
        {activeCategory.summaryTable && (
          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  {activeCategory.summaryTable.headers.map((h, i) => (
                    <th key={i} className="p-2.5 font-semibold text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeCategory.summaryTable.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-muted/20">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2.5 font-mono text-[11px]">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {displayedEntries.map((entry, idx) => (
          <article
            key={idx}
            className="panel p-4 flex flex-col justify-between border-border hover:border-primary/40 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {entry.tag}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                  onClick={() => handleCopy(entry.commandOrSyntax, idx)}
                >
                  {copiedIndex === idx ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copiedIndex === idx ? "Copied" : "Copy"}
                </Button>
              </div>

              <div className="p-2.5 rounded bg-muted/50 font-mono text-xs text-primary border border-border/80 overflow-x-auto">
                <code>{entry.commandOrSyntax}</code>
              </div>

              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {entry.explanation}
              </p>
            </div>

            {entry.example && (
              <div className="mt-3 pt-3 border-t border-border/60">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Example Usage:
                </span>
                <pre className="p-2 rounded bg-surface text-[11px] font-mono text-foreground/90 overflow-x-auto border border-border/40">
                  {entry.example}
                </pre>
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
