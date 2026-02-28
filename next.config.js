/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/design-awards-tracker',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
