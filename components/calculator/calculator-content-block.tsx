import Link from "next/link";
import type { CalculatorContent } from "@/calculators/core/calculator-types";
import { ContextualText } from "./contextual-link-parser";

interface CalculatorContentBlockProps {
  content?: CalculatorContent;
}

export function CalculatorContentBlock({
  content,
}: CalculatorContentBlockProps) {
  if (!content) return null;

  return (
    <section className="mx-auto w-full max-w-4xl space-y-10 px-4 py-10 sm:px-6">
      <div className="space-y-3">
  <h2 className="text-2xl font-bold tracking-tight">
    Rehber
  </h2>
  <p className="text-base leading-7 text-muted-foreground">
    <ContextualText text={content.intro} />
  </p>
</div>

      {content.sections.map((section) => (
        <section key={section.title} className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">
            <ContextualText text={section.title} />
          </h2>

          <div className="space-y-3 text-base leading-7 text-muted-foreground">
            {section.paragraphs.map((paragraph, idx) => (
              <p key={idx}><ContextualText text={paragraph} /></p>
            ))}
          </div>

          {section.bullets?.length ? (
            <ul className="list-disc space-y-2 pl-6 text-base leading-7 text-muted-foreground">
              {section.bullets.map((bullet, idx) => (
                <li key={idx}><ContextualText text={bullet} /></li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}

      {content.example ? (
        <section className="rounded-2xl border bg-muted/30 p-6">
          <h2 className="text-xl font-bold tracking-tight">
            <ContextualText text={content.example.title} />
          </h2>

          <p className="mt-3 text-base leading-7 text-muted-foreground">
            <ContextualText text={content.example.text} />
          </p>
        </section>
      ) : null}

      {content.sources?.length ? (
        <section className="space-y-3 border-t pt-8">
          <h2 className="text-xl font-bold tracking-tight">
            Kaynaklar
          </h2>

          <ul className="space-y-2 text-sm text-muted-foreground">
            {content.sources.map((source) => (
              <li key={source.url}>
                <Link
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  {source.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}