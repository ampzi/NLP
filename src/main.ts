import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip properties not in the DTO
      forbidNonWhitelisted: true, // reject with 400 if unknown props are sent
      transform: true, // convert `"10"` → 10 for @Type(() => Number)
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.enableCors();

  // Serve the built frontend (SPA) when it exists. In development the
  // frontend runs on its own Vite server and proxies /api to this process.
  const frontendDist = join(
    dirname(fileURLToPath(import.meta.url)),
    '..',
    'frontend',
    'sitepulse',
    'dist',
  );
  if (existsSync(frontendDist)) {
    app.useStaticAssets(frontendDist, { index: false });
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.originalUrl.startsWith('/api')) return next();
      if (req.method !== 'GET') return next();
      res.sendFile(join(frontendDist, 'index.html'));
    });
  }

  await app.listen(process.env.PORT ?? 6542);
}
void bootstrap();
