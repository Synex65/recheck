import { AppShell } from "@/components/AppShell";
import { LegalDocument } from "@/components/LegalDocument";
import { LEGAL_UPDATED, TERMS } from "@/lib/legal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of use · Recheck",
  description:
    "Automated checks and working-draft statements. Not legal advice, not a certification, and no warranty of compliance.",
};

export default function TermsPage() {
  return (
    <AppShell>
      <LegalDocument
        kicker="Legal"
        title="Terms of use"
        lede="Light terms for a staging tool. Recheck drafts from automated checks. It does not certify a shop and it does not warrant compliance."
        updated={LEGAL_UPDATED}
        sections={TERMS}
      />
    </AppShell>
  );
}
