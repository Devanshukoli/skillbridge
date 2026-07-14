import pinoHttp from 'pino-http';
import { randomUUID } from 'crypto';
import { logger } from './logger';

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const existing = req.headers['x-request-id'];
    const id = typeof existing === 'string' ? existing : randomUUID();
    res.setHeader('x-request-id', id);
    return id;
  },
  // Keep request logs to one line per request instead of pino-http's default verbosity.
  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  }
});
