import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Only generate swagger.json, do NOT serve Swagger UI in production
  const config = new DocumentBuilder()
    .setTitle('Simple Account API')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Save swagger.json to public folder
  const outputPath = join(process.cwd(), 'public', 'swagger.json');
  writeFileSync(outputPath, JSON.stringify(document, null, 2));
  console.log('Swagger JSON generated:', outputPath);

  await app.listen(3000);
}

bootstrap();
