import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-6 px-5 py-5">
        <Link href="/" className="font-serif text-2xl tracking-tight text-ink">
          Recheck
        </Link>
        <p className="max-w-md text-right text-sm text-muted">
          Continuous re-check for EU-facing shops. Drafts statements. Does not
          certify WCAG, EAA, or BFSG.
        </p>
      </div>
    </header>
  );
}
