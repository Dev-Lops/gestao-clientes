import dotenv from 'dotenv'
import type { NextConfig } from 'next'
dotenv.config({ path: '.env.local' })

const nextConfig: NextConfig = {
  images: {
    domains: ['i.pravatar.cc', 'your-project-id.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',

        hostname: '*.supabase.co',

        pathname: '/storage/v1/object/**', // 👈 permite todas as imagens públicas
      },
    ],
  },
}

export default nextConfig
