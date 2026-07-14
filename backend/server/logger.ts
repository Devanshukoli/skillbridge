import pino from 'pino';

// Structured JSON to stdout. In dev, pino-pretty makes it readable; in prod,
// raw JSON lines are what platforms (Render/Railway/Fly/Docker) expect so
// their log viewers/aggregators can parse and search them.
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } }
      : undefined
});
