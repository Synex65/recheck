export default function DemoCart() {
  return (
    <main className="form">
      <p>Bag</p>
      <p>Linen overshirt · EUR 180</p>
      <input className="qty" defaultValue="1" />
      <div role="button" className="icon-btn" />
      <a href="/demo-shop/checkout">Continue</a>
    </main>
  );
}
