import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Modular Route Imports
import authRouter from './modules/auth/auth.routes';
import profileRouter from './modules/profile/profile.routes';
import curriculumRouter from './modules/curriculum/curriculum.routes';
import submissionsRouter from './modules/submissions/submissions.routes';
import claimsRouter from './modules/claims/claims.routes';
import adminRouter from './modules/admin/admin.routes';

// Middleware Imports
import { errorHandler } from './middlewares/errorHandler';

const app = express();
const PORT = 3000;

app.use(express.json());

// API Route Registrations
app.use('/api/auth', authRouter);
app.use('/api', profileRouter);
app.use('/api', curriculumRouter);
app.use('/api', submissionsRouter);
app.use('/api', claimsRouter);
app.use('/api/admin', adminRouter);

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
    console.log(`[SkillBridge Server] booted on port ${PORT}`);
  });
}

startServer();
