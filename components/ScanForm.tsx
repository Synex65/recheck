"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function demoPaths(origin: string) {
  return {
    storefrontUrl: `${origin}/demo-shop`,
    home: `${origin}/demo-shop`,
    plp: `${origin}/demo-shop/products`,
    pdp: `${origin}/demo-shop/products/linen-overshirt`,
    cart: `${origin}/demo-shop/cart`,
    checkout: `${origin}/demo-shop/checkout`,
  };
}

export function ScanForm({ emptyMessage }: { emptyMessage: string }) {
  const router = useRouter();
  const [storefrontUrl, setStorefrontUrl] = useState("");
  const [home, setHome] = useState("");
  const [plp, setPlp] = useState("");
  const [pdp, setPdp] = useState("");
  const [cart, setCart] = useState("");
  const [checkout, setCheckout] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storefrontUrl,
          moneyPages: { home, plp, pdp, cart, checkout },
        }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) {
        setError(data.error || "Could not start scan.");
        setPending(false);
        return;
      }
      router.push(`/scans/${data.id}`);
    } catch {
      setError("Could not start scan.");
      setPending(false);
    }
  }

  function fillDemo() {
    const demo = demoPaths(window.location.origin);
    setStorefrontUrl(demo.storefrontUrl);
    setHome(demo.home);
    setPlp(demo.plp);
    setPdp(demo.pdp);
    setCart(demo.cart);
    setCheckout(demo.checkout);
  }

  function fillDemoWithoutCheckout() {
    const origin = window.location.origin;
    fillDemo();
    setCheckout(`${origin}/demo-shop/checkout-unavailable`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" aria-busy={pending}>
      <div>
        <label htmlFor="storefront" className="block text-sm font-semibold">
          Storefront URL
        </label>
        <input
          id="storefront"
          name="storefront"
          type="url"
          required
          placeholder="https://your-shop.example"
          value={storefrontUrl}
          onChange={(e) => setStorefrontUrl(e.target.value)}
          className="field mt-2"
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">
          Money pages <span className="font-normal text-muted">(optional)</span>
        </legend>
        <p className="text-sm leading-6 text-muted">
          Home, PLP, PDP, cart, checkout. If blank, Recheck tries the storefront
          plus common cart/product paths. Shopify checkout is often hosted
          separately and may not render.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField id="home" label="Home" value={home} onChange={setHome} />
          <MoneyField id="plp" label="PLP (collection / category)" value={plp} onChange={setPlp} />
          <MoneyField id="pdp" label="PDP (product)" value={pdp} onChange={setPdp} />
          <MoneyField id="cart" label="Cart" value={cart} onChange={setCart} />
          <MoneyField
            id="checkout"
            label="Checkout"
            value={checkout}
            onChange={setCheckout}
            className="sm:col-span-2"
          />
        </div>
      </fieldset>

      {error ? (
        <p className="note note-error" role="alert">
          {error}
        </p>
      ) : (
        <p className="rounded-xl bg-mist px-3 py-3 text-sm leading-6 text-muted">{emptyMessage}</p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Starting scan…" : "Start scan"}
        </button>
        <button type="button" onClick={fillDemo} className="btn btn-secondary">
          Fill local demo shop
        </button>
        <button type="button" onClick={fillDemoWithoutCheckout} className="btn btn-secondary">
          Demo with unrendered checkout
        </button>
      </div>
    </form>
  );
}

function MoneyField({
  id,
  label,
  value,
  onChange,
  className = "",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs font-semibold tracking-wide text-muted">
        {label}
      </label>
      <input
        id={id}
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field mt-1"
      />
    </div>
  );
}
