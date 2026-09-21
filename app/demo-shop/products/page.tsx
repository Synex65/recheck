import Link from "next/link";

const ITEMS = [
  { slug: "linen-overshirt", name: "Linen overshirt" },
  { slug: "work-trouser", name: "Work trouser" },
  { slug: "canvas-tote", name: "Canvas tote" },
];

export default function DemoPlp() {
  return (
    <main>
      <h2 style={{ padding: "24px 24px 0", fontWeight: 400 }}>All products</h2>
      <div className="grid">
        {ITEMS.map((item) => (
          <Link key={item.slug} href={`/demo-shop/products/${item.slug}`} className="card">
            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" />
            <p className="low-contrast">{item.name}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
