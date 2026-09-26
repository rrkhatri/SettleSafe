/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Preview runs behind a proxied host; allow it without an origin allowlist.
  allowedDevOrigins: ['*'],
  async headers() {
    return [
      {
        // Never let a third-party frame pretend to be SettleSafe.
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}
export default nextConfig
