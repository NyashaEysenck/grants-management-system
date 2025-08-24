import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';
  const isProduction = mode === 'production';
  
  return {
    // Development server configuration
    server: {
      host: "::",
      port: 8080,
    },
    
    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: isDevelopment,
      minify: isProduction ? 'esbuild' : false,
      // Optimize chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunk for React and core dependencies
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // UI components chunk
            'ui-vendor': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-select',
              '@radix-ui/react-toast',
              '@radix-ui/react-tabs'
            ],
            // Form and validation chunk
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
            // Query and API chunk
            'api-vendor': ['@tanstack/react-query', 'axios'],
            // Chart and date utilities
            'utils-vendor': ['recharts', 'date-fns', 'clsx']
          }
        }
      },
      // Enable compression
      target: 'esnext',
      // Optimize asset inlining
      assetsInlineLimit: 4096
    },
    
    // Plugins
    plugins: [
      react(),
      isDevelopment && componentTagger(),
      // Remove console logs in production
      isProduction && {
        name: 'remove-console',
        transform(code: string, id: string) {
          if (id.includes('node_modules')) return null;
          return code.replace(/console\.(log|debug|info|warn|error|assert|dir|dirxml|group|groupEnd|time|timeEnd|count|trace|profile|profileEnd)\(.*?\);?/g, '');
        }
      }
    ].filter(Boolean),
    
    // Path resolution
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    
    // Define global constants
    define: {
      __DEV__: JSON.stringify(isDevelopment),
      __PROD__: JSON.stringify(isProduction),
    },

    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'axios',
        'lucide-react'
      ]
    }
  };
});