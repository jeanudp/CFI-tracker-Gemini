import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Handle the Stripe Webhook
  // We don't use body-parser here because the handler handles it manually via buffer(req)
  app.post('/api/stripe-webhook', async (req, res) => {
    try {
      const { default: handler } = await import('./api/stripe-webhook.js');
      await handler(req, res);
    } catch (error) {
      console.error('Error in webhook handler:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Regular JSON parsing for other routes
  app.use(express.json());

  // API Routes
  app.post('/api/create-checkout', async (req, res) => {
    try {
      const { default: handler } = await import('./api/create-checkout.js');
      await handler(req, res);
    } catch (error) {
      console.error('Error in create-checkout handler:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
