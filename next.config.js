/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'uploadthing.com',
      'utfs.io',
      'img.clerk.com',
      'subdomain',
      'files.stripe.com',
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  output: 'standalone',
  experimental: {
    // Enable Bun's runtime
    runtime: 'experimental-edge',
  },
}

module.exports = nextConfig
