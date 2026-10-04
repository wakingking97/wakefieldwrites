// Renders hook_content as plain text: blank line = new paragraph, a line
// starting with "## " = subheading. React escapes everything, so stored
// content can never inject markup.
export default function InsightBody({ content }: { content: string }) {
  const blocks = content.split(/\r?\n\s*\r?\n/).map((b) => b.trim()).filter(Boolean);

  return (
    <div className="space-y-6 text-lg leading-8 text-muted">
      {blocks.map((block, i) =>
        block.startsWith("## ") ? (
          <h2 key={i} className="pt-4 font-serif text-2xl text-foreground">
            {block.slice(3)}
          </h2>
        ) : (
          <p key={i} className="whitespace-pre-line">
            {block}
          </p>
        ),
      )}
    </div>
  );
}
