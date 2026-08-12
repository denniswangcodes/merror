import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  if (process.env.NODE_ENV === 'production') {
    for (const key of ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'WEB_ORIGIN']) {
      if (!process.env[key]) throw new Error(`Missing required production environment variable: ${key}`);
    }
    if ((process.env.JWT_SECRET?.length ?? 0) < 32 || (process.env.JWT_REFRESH_SECRET?.length ?? 0) < 32) {
      throw new Error('Production JWT secrets must be at least 32 characters');
    }
  }
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.enableShutdownHooks();

  // Raised from Express's 100kb default so base64-encoded avatar/reflection photos fit; DTO-level
  // MaxLength checks on the image fields keep this from being an easy oversized-payload vector.
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true, limit: '5mb' }));

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  const rateBuckets = new Map<string, { count: number; resetAt: number }>();
  app.use((req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const isAuth = req.path.includes('/auth/login') || req.path.includes('/auth/signup');
    const isReflection = req.method === 'POST' && req.path.includes('/feedback');
    const windowMs = isReflection ? 60 * 60 * 1000 : isAuth ? 15 * 60 * 1000 : 60 * 1000;
    const limit = isReflection ? 20 : isAuth ? 10 : 300;
    const key = `${req.ip}:${req.method}:${isAuth ? 'auth' : isReflection ? 'reflection' : 'general'}`;
    const current = rateBuckets.get(key);
    const bucket = !current || current.resetAt <= now ? { count: 0, resetAt: now + windowMs } : current;
    bucket.count += 1;
    rateBuckets.set(key, bucket);
    res.setHeader('RateLimit-Limit', String(limit));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, limit - bucket.count)));
    res.setHeader('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));
    if (bucket.count > limit) return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    if (rateBuckets.size > 10_000) {
      for (const [bucketKey, value] of rateBuckets) if (value.resetAt <= now) rateBuckets.delete(bucketKey);
    }
    next();
  });

  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');
    next();
  });

  const allowedOrigins = [
    process.env.WEB_ORIGIN,
    'https://merror.vercel.app',
    'http://localhost:3000',
    'http://localhost:8081',
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 Merror API running on http://localhost:${port}/api`);
}

bootstrap().catch((error) => {
  console.error('Merror API failed to start', error);
  process.exit(1);
});
