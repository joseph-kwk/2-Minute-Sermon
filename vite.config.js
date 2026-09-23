import { defineConfig } from 'vite';
import { resolve } from 'path';

function cleanUrlsPlugin() {
  return {
    name: 'clean-urls-dev',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const rawUrl = req.url.split('?')[0];
        const normalized = rawUrl.replace(/\/$/, '');
        if (normalized === '/admin' || normalized === '/sitemap' || normalized === '/privacy' || normalized === '/terms') {
          req.url = `${normalized}.html${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`;
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [cleanUrlsPlugin()],
  build: {
    rollupOptions: {
      input: {
        main:  resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
      }
    }
  }
});
