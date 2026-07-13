export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;

    // giữ stack trace để dễ debug trong môi trường dev
    Error.captureStackTrace(this, this.constructor);
  }
}
