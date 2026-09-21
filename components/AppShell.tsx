import { CookieBanner } from "@/components/CookieBanner";
import { MeshBackground } from "@/components/MeshBackground";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell relative flex min-h-dvh flex-col">
      <MeshBackground />
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <SiteHeader />
      <div id="content" className="relative flex-1">
        {children}
      </div>
      <SiteFooter />
      <CookieBanner />
    </div>
  );
}
