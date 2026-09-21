export default function DemoPdp({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <Pdp params={params} />;
}

async function Pdp({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <main className="hero">
      <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" />
      <div>
        <p>{slug.replace(/-/g, " ")}</p>
        <p className="low-contrast">EUR 180 · unlabelled size control below</p>
        <input className="qty" defaultValue="1" />
        <div>
          <button className="icon-btn" />
        </div>
        <iframe title="" src="/demo-shop/reviews-widget" className="reviews" />
      </div>
    </main>
  );
}
