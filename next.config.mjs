const isDev = process.env.NODE_ENV !== "production";
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'" +
    (isDev ? " 'unsafe-eval'" : "") +
    " https://bt-cdn.yappy.cloud https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://*.yappy.cloud https://*.bgeneral.cloud https://challenges.cloudflare.com",
  "frame-src https://*.yappy.cloud https://*.bgeneral.cloud https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          // Report-only until the Yappy payment button is confirmed to work
          // under it (it loads third-party scripts/frames we can't inspect).
          // Check the browser console on /driver/membership, then rename the
          // key to "Content-Security-Policy" to enforce.
          {
            key: "Content-Security-Policy-Report-Only",
            value: csp,
          },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=(self)",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};
export default nextConfig;
