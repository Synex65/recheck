import type { CopyBlock } from "@/lib/legal";

export function LegalDocument({
  kicker,
  title,
  lede,
  updated,
  sections,
  children,
}: {
  kicker: string;
  title: string;
  lede: string;
  updated: string;
  sections: readonly CopyBlock[];
  children?: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{kicker}</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] text-ink">{title}</h1>
      <p className="mt-4 text-lg leading-7 text-muted">{lede}</p>
      <p className="mt-3 text-sm text-muted">Last updated {updated}</p>
      <div className="legal-prose">
        {children}
        {sections.map((section) => (
          <section key={section.heading} id={section.id}>
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((paragraph, index) => (
              <p key={`${section.heading}-${index}`}>{paragraph}</p>
            ))}
            {section.bullets ? (
              <ul>
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </main>
  );
}
