import { defineConfig } from 'vite';
import { resolve } from 'path';

function cleanUrlsPlugin() {
  return {
    name: 'clean-urls-dev',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url.split('?')[0];
        if (url === '/sitemap' || url === '/privacy' || url === '/terms') {
          req.url = `${url}.html`;
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
