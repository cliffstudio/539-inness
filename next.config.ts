import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Fix for Sanity vendor chunks issue
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Ensure proper module resolution for Sanity
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    // Fix for React 19 useMemoCache issues
    config.resolve.symlinks = false;
    
    // Fix for Sanity vendor chunks
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          sanity: {
            test: /[\\/]node_modules[\\/](sanity|@sanity)[\\/]/,
            name: 'sanity',
            chunks: 'all',
            priority: 10,
          },
        },
      },
    };
    
    return config;
  },
  // External packages for server components
  serverExternalPackages: ['sanity'],
  // Experimental features for React 19 compatibility
  experimental: {
    reactCompiler: false,
  },
};

export default nextConfig;

