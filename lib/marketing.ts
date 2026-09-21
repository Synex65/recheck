export const MARKETING = {
  badge: "EAA / BFSG working drafts · Continuous re-check",
  headlineLead: "Re-check the shop.",
  headlineRest: "Draft an honest statement.",
  subcopy:
    "Recheck crawls money pages, runs axe-core on rendered HTML, and ranks what it found. It will not say a shop conforms to the EAA or the BFSG. It will not sell an overlay. Silence is not a pass.",
  primaryCta: "Start a scan",
  secondaryCta: "How it works",
  trust: [
    "Automated checks only",
    "No overlay fixes",
    "Zero findings is not a pass",
  ],
  formTitle: "Start a scan",
  formLede:
    "Paste a storefront URL. Optional money pages narrow the crawl. The draft only covers paths that were actually reached.",
  recentTitle: "Recent scans",
  howKicker: "Method",
  howTitle: "How a scan works",
  howLede:
    "Six steps, then a working draft. Ranked findings, stable IDs, and an explicit list of what was not checked.",
  steps: [
    {
      n: "01",
      title: "Paste the shop",
      body: "Storefront URL, plus optional home, PLP, PDP, cart, and checkout.",
    },
    {
      n: "02",
      title: "Render and run axe",
      body: "A headless browser opens each path. axe-core runs on the rendered HTML.",
    },
    {
      n: "03",
      title: "Rank what came back",
      body: "Ordered by severity and path criticality. Checkout, cart, and PDP sit above home.",
    },
    {
      n: "04",
      title: "Export or share",
      body: "Download CSV, or open a list whose stable IDs survive a re-scan.",
    },
    {
      n: "05",
      title: "Draft the statement",
      body: "Open gaps and unchecked surfaces, in a working draft. Not a certificate.",
    },
    {
      n: "06",
      title: "Re-scan the diff",
      body: "See what is new and what cleared since the last run of that shop.",
    },
  ],
  honestKicker: "Positioning",
  honestTitle: "What Recheck will not say",
  honestLede:
    "The product is a working-draft tool for teams who would rather see gaps than buy a badge.",
  honestPoints: [
    "It will not declare conformity with the EAA or the BFSG.",
    "It will not certify WCAG, and it will not say a scan passed.",
    "It will not apply overlay fixes or sell a widget that hides barriers.",
    "A short list, or zero automated findings, is not a pass. Unchecked surfaces stay listed.",
    "Statement text is a working draft based on automated checks, not legal advice.",
  ],
  footerDisclaimer:
    "Recheck does not declare EAA/BFSG conformity, does not certify WCAG, and does not apply overlay fixes. This is a working draft tool.",
} as const;

export const COOKIE_COPY = {
  title: "Cookies",
  body: "Recheck does not set analytics or marketing cookies. There is nothing optional to accept. Necessary only stores this choice in local storage on this browser, and it is not sent as a tracking cookie.",
  accept: "Accept necessary only",
  details: "Privacy policy",
  settings: "Cookie settings",
} as const;
