// next.config.mjs
import webpack from 'webpack';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: 'loose', // This allows mixing of ESM and CommonJS modules
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        buffer: require.resolve('buffer/'),
        process: require.resolve('process/browser'),
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
    }

    config.module.rules.push({
      test: /\.m?js/,
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
};

export default nextConfig;