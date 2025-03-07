import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'lodash': path.resolve(__dirname, 'node_modules/lodash-es')
    }
  },
  optimizeDeps: {
    include: ['lodash-es']
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'mapbox': ['mapbox-gl', 'react-map-gl'],
          'charts': ['recharts'],
          'vendor': ['react', 'react-dom', '@supabase/supabase-js']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    watch: {
      ignored: ['**/node_modules/**', '**/.git/**']
    },
    env: {
      // Ensure environment variables are properly typed
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
      VITE_MAPBOX_TOKEN: process.env.VITE_MAPBOX_TOKEN
    }
  }
});