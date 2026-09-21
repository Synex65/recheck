import { AppShell } from "@/components/AppShell";
import { LegalDocument } from "@/components/LegalDocument";
import { OperatorDetails } from "@/components/OperatorDetails";
import { IMPRINT, IMPRINT_INTRO, LEGAL_UPDATED } from "@/lib/legal";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Impressum · Recheck",
  description:
    "Legal notice for Recheck. Operator name, address, and email are placeholders until they are filled in.",
};

export default function ImprintPage() {
  return (
    <AppShell>
      <LegalDocument
        kicker="Legal"
        title={IMPRINT_INTRO.title}
        lede={IMPRINT_INTRO.lede}
        updated={LEGAL_UPDATED}
        sections={IMPRINT}
      >
        <p>{IMPRINT_INTRO.note}</p>
        <OperatorDetails />
      </LegalDocument>
    </AppShell>
  );
}
