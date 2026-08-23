import { Fragment } from "react";

/**
 * Minimal, dependency-free markdown renderer for lesson content.
 * Supports headings, lists, blockquotes, inline code, bold and paragraphs.
 */
function renderInline(text: string, keyPrefix: string) {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`;
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={key}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong key={key} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={key}>{token}</Fragment>;
  });
}

export function Markdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  let ordered = false;

  const flushList = (key: string) => {
    if (list.length === 0) return;
    const items = list.map((item, index) => (
      <li key={`${key}-${index}`} className="leading-relaxed">
        {renderInline(item, `${key}-${index}`)}
      </li>
    ));
    blocks.push(
      ordered ? (
        <ol key={key} className="ml-5 list-decimal space-y-1.5 text-muted-foreground">
          {items}
        </ol>
      ) : (
        <ul key={key} className="ml-5 list-disc space-y-1.5 text-muted-foreground">
          {items}
        </ul>
      ),
    );
    list = [];
  };

  lines.forEach((raw, index) => {
    const line = raw.trimEnd();
    const key = `b-${index}`;

    if (/^\s*[-*]\s+/.test(line)) {
      if (ordered) flushList(`${key}-pre`);
      ordered = false;
      list.push(line.replace(/^\s*[-*]\s+/, ""));
      return;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      if (!ordered) flushList(`${key}-pre`);
      ordered = true;
      list.push(line.replace(/^\s*\d+\.\s+/, ""));
      return;
    }
    flushList(`${key}-list`);

    if (line.startsWith("### ")) {
      blocks.push(
        <h4 key={key} className="mt-6 text-base font-semibold text-foreground">
          {renderInline(line.slice(4), key)}
        </h4>,
      );
    } else if (line.startsWith("## ")) {
      blocks.push(
        <h3 key={key} className="mt-6 text-xl font-semibold text-foreground">
          {renderInline(line.slice(3), key)}
        </h3>,
      );
    } else if (line.startsWith("# ")) {
      blocks.push(
        <h2 key={key} className="mt-6 text-2xl font-bold text-foreground">
          {renderInline(line.slice(2), key)}
        </h2>,
      );
    } else if (line.startsWith("> ")) {
      blocks.push(
        <blockquote
          key={key}
          className="border-l-2 border-primary bg-surface/60 py-2 pl-4 text-sm italic text-muted-foreground"
        >
          {renderInline(line.slice(2), key)}
        </blockquote>,
      );
    } else if (line.trim() !== "") {
      blocks.push(
        <p key={key} className="leading-relaxed text-muted-foreground">
          {renderInline(line, key)}
        </p>,
      );
    }
  });
  flushList("b-final");

  return <div className="space-y-3">{blocks}</div>;
}
