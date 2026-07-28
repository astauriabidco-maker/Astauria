import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

abstract class InMemoryRateLimitGuard implements CanActivate {
    private static readonly attempts = new Map<string, RateLimitEntry>();
    protected abstract readonly namespace: string;
    protected abstract readonly limit: number;
    protected abstract readonly windowMs: number;

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const now = Date.now();
        const ip = request.ip || request.socket?.remoteAddress || 'unknown';
        const key = `${this.namespace}:${ip}`;
        const current = InMemoryRateLimitGuard.attempts.get(key);

        if (!current || current.resetAt <= now) {
            InMemoryRateLimitGuard.attempts.set(key, {
                count: 1,
                resetAt: now + this.windowMs,
            });
            this.pruneExpired(now);
            return true;
        }

        if (current.count >= this.limit) {
            const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
            const response = context.switchToHttp().getResponse();
            response.setHeader('Retry-After', String(retryAfter));
            throw new HttpException(
                'Trop de tentatives. Réessayez plus tard.',
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        current.count += 1;
        return true;
    }

    private pruneExpired(now: number) {
        if (InMemoryRateLimitGuard.attempts.size < 1_000) return;
        for (const [key, entry] of InMemoryRateLimitGuard.attempts) {
            if (entry.resetAt <= now) {
                InMemoryRateLimitGuard.attempts.delete(key);
            }
        }
    }
}

@Injectable()
export class LoginRateLimitGuard extends InMemoryRateLimitGuard {
    protected readonly namespace = 'login';
    protected readonly limit = 10;
    protected readonly windowMs = 15 * 60 * 1000;
}

@Injectable()
export class LeadRateLimitGuard extends InMemoryRateLimitGuard {
    protected readonly namespace = 'lead';
    protected readonly limit = 5;
    protected readonly windowMs = 10 * 60 * 1000;
}
