/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Docker image ko chhota/fast rakhne ke liye -- .next/standalone me
  // sirf zaroori server files + node_modules subset aata hai.
  output: "standalone",
};

module.exports = nextConfig;
