import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.use(cookieParser());

  const webOrigin = process.env.WEB_ORIGIN || 'http://localhost:3000';
  app.enableCors({
    origin: [webOrigin, 'http://localhost:3000', 'http://localhost:8081'],
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

bootstrap();
