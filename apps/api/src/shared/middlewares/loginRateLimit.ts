import type { NextFunction, Request, Response } from 'express';

type LoginAttemptState = {
  attempts: number[];
  blockedUntil: number | null;
  lockouts: number;
  lastSeenAt: number;
};

type LoginRateLimitOptions = {
  windowMs: number;
  maxAttempts: number;
  maxBackoffMultiplier: number;
  now?: () => number;
};

const DEFAULT_OPTIONS: LoginRateLimitOptions = {
  windowMs: 15 * 60 * 1000,
  maxAttempts: 5,
  maxBackoffMultiplier: 4,
  now: () => Date.now()
};

const GENERIC_MESSAGE = 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.';

const buildIdentifier = (req: Request) => {
  const matricula =
    typeof req.body?.matricula === 'string' ? req.body.matricula.trim().toLowerCase() : 'unknown';

  return `${req.ip}:${matricula}`;
};

const toRetryAfterSeconds = (blockedUntil: number, now: number) =>
  Math.max(1, Math.ceil((blockedUntil - now) / 1000));

export const createLoginRateLimit = (customOptions?: Partial<LoginRateLimitOptions>) => {
  const options = { ...DEFAULT_OPTIONS, ...customOptions };
  const nowProvider = options.now ?? Date.now;
  const state = new Map<string, LoginAttemptState>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = nowProvider();
    const identifier = buildIdentifier(req);
    const entry = state.get(identifier);

    if (entry) {
      entry.attempts = entry.attempts.filter((timestamp) => now - timestamp < options.windowMs);
      entry.lastSeenAt = now;

      if (entry.blockedUntil && entry.blockedUntil > now) {
        const retryAfter = toRetryAfterSeconds(entry.blockedUntil, now);
        res.setHeader('Retry-After', retryAfter.toString());
        return res.status(429).json({
          status: 'error',
          message: GENERIC_MESSAGE
        });
      }

      if (entry.blockedUntil && entry.blockedUntil <= now) {
        entry.blockedUntil = null;
      }

      if (entry.attempts.length === 0 && now - entry.lastSeenAt > options.windowMs) {
        state.delete(identifier);
      }
    }

    res.on('finish', () => {
      const finishedAt = nowProvider();
      const current = state.get(identifier) ?? {
        attempts: [],
        blockedUntil: null,
        lockouts: 0,
        lastSeenAt: finishedAt
      };

      current.attempts = current.attempts.filter(
        (timestamp) => finishedAt - timestamp < options.windowMs
      );
      current.lastSeenAt = finishedAt;

      if (res.statusCode < 400) {
        state.delete(identifier);
        return;
      }

      if (res.statusCode !== 401) {
        state.set(identifier, current);
        return;
      }

      current.attempts.push(finishedAt);

      if (current.attempts.length >= options.maxAttempts) {
        current.lockouts += 1;
        const multiplier = Math.min(current.lockouts, options.maxBackoffMultiplier);
        current.blockedUntil = finishedAt + options.windowMs * multiplier;
        current.attempts = [];
      }

      state.set(identifier, current);
    });

    return next();
  };
};

export const loginRateLimit = createLoginRateLimit();
