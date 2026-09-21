export const LEGAL_UPDATED = "21 September 2026";

export type CopyBlock = {
  id?: string;
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export const PRIVACY: CopyBlock[] = [
  {
    heading: "Who operates Recheck",
    paragraphs: [
      "Recheck is a staging tool. The legal entity, postal address, and contact email are not filled in yet. Those fields are marked TODO on the Imprint page and are meant to be completed by Arda / Synex65. Synex65 is a GitHub account, not a company registration.",
      "Until that notice is complete, there is no monitored contact address. Do not treat a placeholder as a company.",
    ],
  },
  {
    heading: "What this tool is",
    paragraphs: [
      "Recheck crawls storefront URLs you submit, runs automated accessibility checks on rendered HTML, and drafts a statement from what it found and what it did not check. The draft is not a certification and not legal advice.",
    ],
  },
  {
    heading: "Data we process",
    paragraphs: [
      "When you start a scan, the application stores the data needed to run it and to show the result:",
    ],
    bullets: [
      "The storefront URL you paste, and any optional money-page URLs (home, product listing, product, cart, checkout).",
      "Pages the crawler reached: URL, path, status, and page title when one was read.",
      "Automated findings from axe-core: rule, title, description, help link, severity label, selector, a short HTML snippet, and a stable ID.",
      "The generated statement draft, scan status, timestamps, and diff counts against an earlier scan of the same site.",
    ],
  },
  {
    heading: "What we do not do",
    paragraphs: [
      "We do not sell personal data. We do not use scan results for advertising, and we do not pass them to an ad network. This version has no accounts and no payment data.",
      "We do not intentionally collect shopper profiles. A URL you paste is stored as entered, including any query string. Do not put secrets in the URL.",
      "Page HTML is checked in the Recheck process. This version does not send it to a separate accessibility vendor.",
    ],
  },
  {
    id: "cookies",
    heading: "Cookies",
    paragraphs: [
      "Recheck does not set analytics cookies or marketing cookies. There is no optional analytics choice, because there is no analytics cookie to accept.",
      "The cookie notice stores one necessary choice in local storage on your browser so the notice stays dismissed. That value is not sent to us as a tracking cookie. Hosting infrastructure may still keep technical connection logs, described below.",
    ],
  },
  {
    heading: "Hosting and database",
    paragraphs: [
      "The intended host for this staging deployment is Railway. Railway may process technical connection data, such as IP address, time, and the requested URL, in order to deliver and secure the service. Which Railway region is used depends on the project configuration.",
      "Scan records are stored in the database configured for that deployment. Local development can use SQLite on the machine running Recheck. Docker Compose in this repository can run Postgres for a local database. We do not sell that data.",
    ],
  },
  {
    heading: "How long we keep it",
    paragraphs: [
      "Scan rows stay in the deployment database until someone with access to that database deletes them. This version has no account page and no self-serve deletion.",
      "There is no fixed retention period yet. Set one when the operator details are real. Until the imprint lists a contact email, erasure requests have nowhere reliable to go.",
    ],
  },
  {
    heading: "Legal bases",
    paragraphs: [
      "Where the GDPR applies, a scan is processed to provide the service you asked for. Connection logs are processed so the host can keep the service available and secure. This is a short staging notice, not a full record of processing activities. Have it reviewed before a commercial launch.",
    ],
  },
  {
    heading: "Your rights",
    paragraphs: [
      "You may have rights of access, rectification, erasure, restriction, objection, and data portability, and the right to lodge a complaint with a supervisory authority. Which authority is competent depends on the operator’s establishment. That establishment is not identified yet — see the imprint.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "Use the email on the imprint once it replaces the TODO. Until then, we cannot promise that a message will be read.",
    ],
  },
];

export const IMPRINT_INTRO = {
  title: "Impressum",
  lede: "Impressum für dieses Staging-Angebot. Pflichtangaben, die noch nicht vorliegen, sind als TODO gekennzeichnet und nicht erfunden. English text follows. Have counsel review it before a public launch in Germany.",
  note: "Fields below stay placeholders until Arda / Synex65 replaces them with the real operator. Do not publish a guessed company name, address, register number, or VAT ID.",
};

export const IMPRINT: CopyBlock[] = [
  {
    heading: "Responsible for content",
    paragraphs: [
      "The person or entity responsible for the content of this service is the operator named above. While that field is still a TODO, responsibility is not legally identified.",
    ],
  },
  {
    heading: "Status of this notice",
    paragraphs: [
      "This page is a staging imprint, not a completed German legal notice. Register court, registration number, and VAT ID are omitted on purpose. Add them only when they are real.",
      "Recheck does not declare EAA or BFSG conformity and does not certify WCAG. Nothing on this page is a compliance claim.",
    ],
  },
];

export const TERMS: CopyBlock[] = [
  {
    heading: "The tool",
    paragraphs: [
      "Recheck runs automated checks on storefront URLs you submit and drafts statement text from pages it reached and from checks it did not run. You get a working draft, a ranked list, and a diff when you scan the same shop again.",
    ],
  },
  {
    heading: "Not legal advice or certification",
    paragraphs: [
      "Output is not legal advice, not a legal assessment, and not a certification. It does not decide legal status under the European Accessibility Act, the Barrierefreiheitsstärkungsgesetz (BFSG), or WCAG, and it will not say a scan passed.",
      "You are responsible for what you publish and for any decision you take from a draft.",
    ],
  },
  {
    heading: "No warranty of compliance",
    paragraphs: [
      "There is no warranty of compliance, completeness, accuracy, or fitness for a filing, a contract, or a product claim. Automated checks miss barriers and can report findings that do not matter for your shop. Silence, a short issue list, or zero automated findings is not a pass.",
      "The service is provided as-is. This staging deployment may be reset, interrupted, rate-limited, or changed. Scans can fail, time out, or stop before every path renders.",
    ],
  },
  {
    heading: "Acceptable use",
    paragraphs: [
      "Only scan storefronts and URLs you are allowed to test. Do not use Recheck to disrupt a site, to probe systems you do not own, or to collect data you are not entitled to store.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "Operator name, address, and email are still placeholders on the imprint. Contract and privacy questions cannot be routed properly until those TODOs are replaced.",
    ],
  },
];

export function blocksText(blocks: readonly CopyBlock[]): string {
  return blocks
    .flatMap((block) => [
      block.heading,
      ...(block.paragraphs ?? []),
      ...(block.bullets ?? []),
    ])
    .join("\n");
}
