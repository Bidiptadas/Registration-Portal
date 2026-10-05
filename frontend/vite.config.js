import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

function paymentApiPlugin() {
  return {
    name: 'payment-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Strip query params for routing
        const urlPath = req.url.split('?')[0];

        if (!urlPath.startsWith('/api/payment')) {
          return next();
        }

        let body = {};
        let raw = '';
        if (req.method === 'POST') {
          const buffers = [];
          for await (const chunk of req) {
            buffers.push(chunk);
          }
          raw = Buffer.concat(buffers).toString();
          if (raw) {
            try {
              body = JSON.parse(raw);
            } catch (err) {
              console.warn('[Payment Middleware] Failed to parse JSON body:', err.message);
            }
          }
        }

        res.setHeader('Content-Type', 'application/json');

        try {
          const { createPaymentOrder, verifyPayment, cancelPayment, handleRazorpayWebhook } = await import('../backend/paymentService.js');

          if (urlPath === '/api/payment/create-order' || urlPath.endsWith('/create-order')) {
            const result = await createPaymentOrder(body);
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, data: result }));
          }

          if (urlPath === '/api/payment/verify' || urlPath.endsWith('/verify')) {
            const result = await verifyPayment(body);
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, data: result }));
          }

          if (urlPath === '/api/payment/cancel' || urlPath.endsWith('/cancel')) {
            const result = await cancelPayment(body);
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, data: result }));
          }

          if (urlPath === '/api/payment/webhook' || urlPath.endsWith('/webhook')) {
            const signature = req.headers['x-razorpay-signature'];
            const result = await handleRazorpayWebhook({ rawBody: raw, signature });
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, data: result }));
          }

          res.statusCode = 404;
          return res.end(JSON.stringify({ success: false, error: 'Endpoint not found' }));
        } catch (err) {
          console.error('[Payment API Error]:', err);
          res.statusCode = 400;
          return res.end(JSON.stringify({ success: false, error: err.message || 'Payment processing failed' }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    paymentApiPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/firebase')) {
            return 'firebase';
          }
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react-router-dom')
          ) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/axios')) {
            return 'vendor-axios';
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
