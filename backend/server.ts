import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Modular Route Imports
import authRouter from './modules/auth/auth.routes';
import profileRouter from './modules/profile/profile.routes';
import curriculumRouter from './modules/curriculum/curriculum.routes';
import submissionsRouter from './modules/submissions/submissions.routes';
import claimsRouter from './modules/claims/claims.routes';
import paymentsRouter, { paymentsWebhookRouter } from './modules/payments/payments.routes';
import adminRouter from './modules/admin/admin.routes';

// Middleware Imports
import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './server/requestLogger';
import { logger } from './server/logger';

const app = express();
const PORT = process.env.PORT || 3000;
if (!PORT) {
  logger.error('PORT is not set');
  process.exit(1);
}

// Enable CORS for cross-origin requests from Vercel frontend to Railway backend
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin or from Vercel / localhost
    if (!origin || origin.endsWith('.vercel.app') || origin.includes('localhost') || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use('/api', paymentsWebhookRouter);
app.use(express.json());
app.use(requestLogger);

// API Route Registrations
app.use('/api/auth', authRouter);
app.use('/api', profileRouter);
app.use('/api', curriculumRouter);
app.use('/api', submissionsRouter);
app.use('/api', claimsRouter);
app.use('/api', paymentsRouter);
app.use('/api/admin', adminRouter);

// Serve llm.txt and llms.txt endpoints directly as text/plain
const serveLlmTxt = (req: express.Request, res: express.Response) => {
  const llmFilePath = path.join(process.cwd(), 'frontend', 'public', 'llm.txt');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.sendFile(llmFilePath, (err) => {
    if (err) {
      const fallbackPath = path.join(process.cwd(), 'dist', 'llm.txt');
      res.sendFile(fallbackPath, (err2) => {
        if (err2) {
          res.status(404).send('# SkillBridge\n\nLLM documentation file.');
        }
      });
    }
  });
};

app.get('/llm.txt', serveLlmTxt);
app.get('/llms.txt', serveLlmTxt);

// Global Error Handling Middleware (must be registered after all routes)
app.use(errorHandler);

// FRONTEND SERVING

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Mounting Vite server in developer mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serving production bundles
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`[SkillBridge Server] booted on port ${PORT}`);
  });
}

startServer();
