import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration - SETUP BEFORE GLOBAL PREFIX
  const config = new DocumentBuilder()
    .setTitle('Simple Account System API')
    .setDescription(
      'A comprehensive Simple Account System API with customer management, accounts, and transactions',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger at the exact path you want
  SwaggerModule.setup('api/v1/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Simple Account API Documentation',
  });

  // Set global API prefix - EXCLUDE Swagger routes
  app.setGlobalPrefix('api/v1', {
    exclude: ['api/v1/docs', 'api/v1/docs-json', 'api/v1/docs/(.*)'],
  });

  await app.listen(3000);
  console.log('Simple Account API is running on: http://localhost:3000');
  console.log('API Base URL: http://localhost:3000/api/v1');
  console.log(
    'Swagger documentation is available on: http://localhost:3000/api/v1/docs',
  );
}

bootstrap();
