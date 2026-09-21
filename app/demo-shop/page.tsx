import Link from "next/link";

export default function DemoHome() {
  return (
    <main>
      <section className="hero">
        <div>
          {/* missing alt */}
          <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" />
          <p className="low-contrast">
            Summer linen, made to be worn hard. Low-contrast promo copy.
          </p>
        </div>
        <div>
          <p>Holm Supply is a fixture shop for Recheck demos.</p>
          <p>
            <Link href="/demo-shop/products">Browse the collection</Link>
          </p>
          <p>
            <Link href="/demo-shop/products/linen-overshirt">Linen overshirt</Link>
          </p>
          <button className="icon-btn" />
        </div>
      </section>
    </main>
  );
}
