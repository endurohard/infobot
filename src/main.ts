import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { addSwagger } from './utils/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { initSentry } from './sentry';
import { startMetricsServer } from './monitoring/monitoring.server';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get<ConfigService>(ConfigService);

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  initSentry(app);
  addSwagger(app);

  const port = config.getOrThrow('port');
  await app.listen(port);

  console.log(`Starting with port ${port}`);

  await startMetricsServer(app);
}
bootstrap();
