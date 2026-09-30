const path = require('path');
const { defineConfig } = require('vite');

module.exports = defineConfig({
  root: 'frontend',
  publicDir: path.resolve(__dirname, 'assets'),
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['.monkeycode-ai.live'],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'frontend/index.html'),
        login: path.resolve(__dirname, 'frontend/login.html'),
        dashboard: path.resolve(__dirname, 'frontend/dashboard.html'),
        parceiro: path.resolve(__dirname, 'frontend/parceiro.html'),
        conta: path.resolve(__dirname, 'frontend/conta.html')
      }
    }
  }
});
