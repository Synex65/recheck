"use client";

export function HashLink({
  hash,
  className,
  children,
}: {
  hash: "scan" | "how";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={`/#${hash}`}
      className={className}
      onClick={(event) => {
        if (window.location.pathname !== "/") return;
        const target = document.getElementById(hash);
        if (!target) return;
        event.preventDefault();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      }}
    >
      {children}
    </a>
  );
}
