import { AppShell } from "@/components/AppShell";
import { LegalDocument } from "@/components/LegalDocument";
import { LEGAL_UPDATED, PRIVACY } from "@/lib/legal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy · Recheck",
  description:
    "What Recheck processes when you scan a storefront, and what it does not do. No sale of data.",
};

export default function PrivacyPage() {
  return (
    <AppShell>
      <LegalDocument
        kicker="Legal"
        title="Privacy policy"
        lede="What this staging service processes when you run a scan, where that data sits, and what Recheck does not do with it."
        updated={LEGAL_UPDATED}
        sections={PRIVACY}
      />
    </AppShell>
  );
}
