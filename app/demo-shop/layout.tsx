import "./shop.css";
import Link from "next/link";

export default function DemoShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="shop">
      <div className="shop-bar">
        Local Recheck fixture — intentional accessibility gaps. Not a real store.
      </div>
      <header className="shop-header">
        <Link href="/demo-shop" className="shop-logo">
          Holm
        </Link>
        <nav>
          <Link href="/demo-shop/products">Shop</Link>
          <Link href="/demo-shop/cart">Bag</Link>
          <Link href="/demo-shop/checkout">Checkout</Link>
          <a href="/demo-shop/lookbook.pdf">Lookbook PDF</a>
          {/* icon-only link with no accessible name */}
          <a href="/demo-shop/account">
            <span className="icon-only" />
          </a>
        </nav>
      </header>
      {children}
      <footer className="shop-footer">
        <iframe src="/demo-shop/reviews-widget" className="reviews" />
        <p>Holm Supply · Berlin</p>
      </footer>
    </div>
  );
}
