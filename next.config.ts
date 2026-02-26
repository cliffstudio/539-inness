import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: false,
  turbopack: {
    // Use pre-built dist so Bunny plugin's .jsx components resolve (package "development" entry points at raw src)
    // Turbopack requires project-relative paths, not absolute
    resolveAlias: {
      "@cliff-studio/sanity-plugin-bunny-input":
        "./node_modules/@cliff-studio/sanity-plugin-bunny-input/dist/index.js",
    },
  },
  async redirects() {
    return [
      { source: '/activities', destination: '/calendar', permanent: true },
      { source: '/activities/:path*', destination: '/calendar/:path*', permanent: true },
    ]
  },
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
    // Use Bunny plugin's pre-built dist so .jsx components resolve (package "development" entry points at raw src)
    config.resolve.alias = {
      ...config.resolve.alias,
      "@cliff-studio/sanity-plugin-bunny-input": path.resolve(
        __dirname,
        "node_modules/@cliff-studio/sanity-plugin-bunny-input/dist/index.js"
      ),
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
};

export default nextConfig;

