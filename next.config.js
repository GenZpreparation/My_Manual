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

  // ---- Security hardening ----
  // Next 14.2.35 me image-optimization API (/_next/image) ke liye ek critical
  // advisory hai (GHSA-2xp9-vwfh-vxw4 -- AVIF input se unauthenticated RCE).
  // 14.x line me abhi patched version nahi nikla (fix Next 16 me hai), aur
  // `npm audit fix --force` major upgrade kar deta hai -- isliye hum endpoint
  // ko hi band kar dete hain.
  //
  // Safe kyun hai: ye project `next/image` use hi nahi karta (sirf plain <img>
  // aur static CSS/SVG icons), to ye endpoint kabhi use nahi hota. Redirect
  // se wo surface permanently hat jata hai -- future me koi next/image add
  // kare to usse pata chal jayega (404) ki ye path available nahi hai.
  async redirects() {
    return [
      {
        source: "/_next/image",
        destination: "/_not-found",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
