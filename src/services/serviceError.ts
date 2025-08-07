export class ServiceError extends Error {
  public cause?: unknown;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'ServiceError';
    this.cause = options?.cause;
  }
}
