export function GET() {
  return new Response("Checkout unavailable", {
    status: 503,
    headers: { "Content-Type": "text/plain" },
  });
}
