const withNextIntl = require('next-intl/plugin')('./src/i18n.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['nqyyqjhctrcsorcupycv.supabase.co'],
  },
}

module.exports = withNextIntl(nextConfig)
