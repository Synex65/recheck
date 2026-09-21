import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Recheck",
  description:
    "Continuous accessibility re-check and honest statement drafts for EU-facing shops. Not a certification.",
};

const consentBoot = `try{if(localStorage.getItem("recheck.consent.v1")==="necessary"){document.documentElement.dataset.recheckConsent="necessary"}}catch(e){}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-paper text-ink">
        <Script id="recheck-consent-boot" strategy="beforeInteractive">
          {consentBoot}
        </Script>
        {children}
      </body>
    </html>
  );
}
