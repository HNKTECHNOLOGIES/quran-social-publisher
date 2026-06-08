export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function resolvePort(defaultPort: number): number {
  const port = process.env.PORT;
  if (port) return parseInt(port, 10);
  return defaultPort;
}

export function resolveCorsOrigin(): string {
  return process.env.CORS_ORIGIN ?? 'http://localhost:3000';
}

export function validateProductionEnv(): void {
  if (!isProduction()) return;
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required in production');
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required in production');
  }
}
