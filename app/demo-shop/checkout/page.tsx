export default function DemoCheckout() {
  return (
    <main className="form">
      <p>Checkout</p>
      <form>
        <input type="email" placeholder="Email" />
        <input type="text" placeholder="Shipping" />
        <button className="icon-btn" type="submit" />
      </form>
    </main>
  );
}
