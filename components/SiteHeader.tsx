import { HashLink } from "@/components/HashLink";
import { RecheckMark } from "@/components/RecheckMark";
import { MARKETING } from "@/lib/marketing";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5 text-ink no-underline">
          <RecheckMark />
          <span className="text-[1.05rem] font-extrabold tracking-tight">Recheck</span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          <HashLink hash="how" className="nav-link hidden items-center sm:inline-flex">
            {MARKETING.secondaryCta}
          </HashLink>
          <HashLink hash="scan" className="btn btn-primary btn-sm">
            {MARKETING.primaryCta}
          </HashLink>
        </nav>
      </div>
    </header>
  );
}
