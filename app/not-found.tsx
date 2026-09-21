import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <div className="min-h-full">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="font-serif text-3xl">Not found</h1>
        <p className="mt-3 text-muted">
          That scan or page is not here.{" "}
          <Link href="/" className="text-navy underline-offset-2 hover:underline">
            Start from the storefront form
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
