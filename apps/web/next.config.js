/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  transpilePackages: ['@taskboard/eslint-config', '@taskboard/tsconfig'],
}

module.exports = nextConfig
