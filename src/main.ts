import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // API prefix from config
  const apiPrefix = configService.get('APP_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle(configService.get('APP_NAME', 'AutoCheck Backend API'))
    .setDescription('Complete Vehicle Valuation and Loan Management System API')
    .setVersion(configService.get('APP_VERSION', '1.0.0'))
    .addTag('vehicles', 'Vehicle management operations')
    .addTag('valuations', 'Vehicle valuation operations')
    .addTag('loans', 'Loan application operations')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customfavIcon: '/favicon.ico',
    customSiteTitle: 'AutoCheck API Documentation',
  });

  const port = configService.get('PORT', 3000);
  await app.listen(port);

  console.log(
    `🚀 AutoCheck Backend API is running on: http://localhost:${port}`,
  );
  console.log(`📖 Swagger documentation: http://localhost:${port}/api/docs`);
  console.log(
    `🔧 Environment: ${configService.get('NODE_ENV', 'development')}`,
  );
  console.log(
    `💾 Database: ${configService.get('DB_TYPE', 'sqlite')} (${configService.get('DB_DATABASE', ':memory:')})`,
  );
}

bootstrap().catch((error) => {
  console.error('❌ Error starting the application:', error.stack || error);
  process.exit(1);
});
