import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  isProduction,
  resolveCorsOrigin,
  resolvePort,
  validateProductionEnv,
} from './config/env.config';

async function bootstrap() {
  validateProductionEnv();

  const app = await NestFactory.create(AppModule, {
    logger: isProduction() ? ['error', 'warn', 'log'] : undefined,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: resolveCorsOrigin().split(',').map((o) => o.trim()),
    credentials: true,
  });

  if (!isProduction()) {
    const config = new DocumentBuilder()
      .setTitle('Quran Social Publisher API')
      .setDescription('API SaaS — publication islamique authentique sur Facebook')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = resolvePort(3002);
  await app.listen(port, '0.0.0.0');
  console.log(`QSP API running on http://localhost:${port}/api`);
}

bootstrap();
