/**
 * Throw this for expected, "safe to show the user" failures — bad input,
 * business-rule violations, not-found, etc. Its `.message` is shown to the client as-is.
 *
 * Anything else that gets thrown (a raw DB error, a bug, an unhandled Stripe
 * exception) is NOT an AppError, so the global error handler treats it as
 * unexpected: it logs full details server-side and returns a generic
 * "Internal Server Error" to the client instead of leaking internals.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational = true;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    Error.captureStackTrace(this, AppError);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class BadGatewayError extends AppError {
  constructor(message: string) {
    super(message, 502);
  }
}
