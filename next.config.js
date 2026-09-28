/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Docker image ko chhota/fast rakhne ke liye -- .next/standalone me
  // sirf zaroori server files + node_modules subset aata hai (Dockerfile
  // isi ko ./.next/standalone se copy karta hai).
  //
  // Vercel pe ye OFF karna zaroori hai: Vercel apna runtime khud handle
  // karta hai aur standalone output use nahi karta. Vercel har build me
  // VERCEL=1 set karta hai, isliye wo detect kar leta hai.
  output: process.env.VERCEL ? undefined : "standalone",
  // Vercel pe `next build` already optimized assets serve karta hai;
  // extra header zaroorat nahi. Plaintext detect se URL /sitemap etc. par
  // Vercel ka auto HTTPS redirect interfere nahi karta.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
