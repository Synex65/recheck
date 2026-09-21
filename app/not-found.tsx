import { AppShell } from "@/components/AppShell";
import Link from "next/link";

export default function NotFound() {
  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Not found</h1>
        <p className="mt-3 max-w-xl text-muted">
          That scan or page is not here.{" "}
          <Link href="/" className="link-action">
            Start from the storefront form
          </Link>
          .
        </p>
      </main>
    </AppShell>
  );
}
