"use client";

import { COOKIE_COPY } from "@/lib/marketing";
import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";

export const CONSENT_KEY = "recheck.consent.v1";
const OPEN_EVENT = "recheck:open-cookies";

let focusOnOpen = false;

function subscribe(onChange: () => void) {
  window.addEventListener(OPEN_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(OPEN_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readConsent(): "necessary" | "unknown" {
  try {
    return localStorage.getItem(CONSENT_KEY) === "necessary" ? "necessary" : "unknown";
  } catch {
    return "unknown";
  }
}

function getServerSnapshot(): "unknown" {
  return "unknown";
}

function notifyConsentChange() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function CookieBanner() {
  const consent = useSyncExternalStore(subscribe, readConsent, getServerSnapshot);
  const acceptRef = useRef<HTMLButtonElement>(null);
  const open = consent !== "necessary";

  useEffect(() => {
    if (!open || !focusOnOpen) return;
    focusOnOpen = false;
    acceptRef.current?.focus();
  }, [open]);

  if (!open) return null;

  function acceptNecessary() {
    try {
      localStorage.setItem(CONSENT_KEY, "necessary");
    } catch {
      // Still mark the document so a blocked store does not trap the notice.
    }
    document.documentElement.dataset.recheckConsent = "necessary";
    notifyConsentChange();
  }

  return (
    <div className="cookie-banner">
      <div className="cookie-banner-inner" role="region" aria-label="Cookie notice">
        <div className="max-w-3xl">
          <h2 id="cookie-title" className="text-sm font-bold">
            {COOKIE_COPY.title}
          </h2>
          <p id="cookie-desc" className="mt-1 text-sm leading-6 text-muted">
            {COOKIE_COPY.body}{" "}
            <Link href="/privacy#cookies" className="link-action">
              {COOKIE_COPY.details}
            </Link>
          </p>
        </div>
        <button
          ref={acceptRef}
          type="button"
          className="btn btn-primary w-full shrink-0 sm:w-auto"
          onClick={acceptNecessary}
        >
          {COOKIE_COPY.accept}
        </button>
      </div>
    </div>
  );
}

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      className="footer-link"
      onClick={() => {
        try {
          localStorage.removeItem(CONSENT_KEY);
        } catch {
          // Storage may be blocked; still reopen the notice.
        }
        document.documentElement.removeAttribute("data-recheck-consent");
        focusOnOpen = true;
        notifyConsentChange();
      }}
    >
      {COOKIE_COPY.settings}
    </button>
  );
}
