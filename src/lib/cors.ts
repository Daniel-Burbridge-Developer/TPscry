// List of allowed internal domains
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://tpscry.unstablevault.dev", // Add your production domain
];

export function corsMiddleware(req: Request) {
  const origin = req.headers.get("origin");

  // Allow requests with no origin (like mobile apps, curl, etc)
  if (!origin) return new Response(null, { status: 200 });

  // Check if the origin is in our allowed list
  if (allowedOrigins.includes(origin)) {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "600",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  // Block all other origins
  return new Response(null, { status: 403 });
}
