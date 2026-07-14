import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const requestId = (req as any).id;

  if (err instanceof AppError) {
    // Expected, "safe to show" failure — log at warn, return its message as-is.
    req.log?.warn({ err, requestId }, err.message);
    return res.status(err.statusCode).json({ error: err.message, requestId });
  }

  // Anything else is unexpected (DB errors, bugs, unhandled SDK exceptions).
  // Log full detail server-side only; the client gets a generic message + a
  // request ID they can hand back to us to look the incident up in the logs.
  req.log?.error({ err, requestId }, 'Unhandled error');
  res.status(500).json({ error: 'Internal Server Error', requestId });
}

