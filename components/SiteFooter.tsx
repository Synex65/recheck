import { CookieSettingsButton } from "@/components/CookieBanner";
import { MARKETING } from "@/lib/marketing";
import Link from "next/link";

const LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/imprint", label: "Imprint" },
  { href: "/terms", label: "Terms" },
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-xl text-sm leading-6 text-muted">{MARKETING.footerDisclaimer}</p>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-2">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="footer-link">
              {link.label}
            </Link>
          ))}
          <CookieSettingsButton />
        </nav>
      </div>
    </footer>
  );
}
