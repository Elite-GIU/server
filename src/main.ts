import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig } from './config/app.config';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(AppConfig.apiPrefix);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Automatically strip properties that are not part of the DTO
    forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
    transform: true, // Automatically transform payloads to DTO instances
  }));

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API documentation for the project')
    .setVersion('1.0')
    .addBearerAuth() // Enable JWT or other auth types if needed
    .build();
  
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${AppConfig.apiPrefix}/docs`, app, documentFactory);

  await app.listen(AppConfig.port);
  console.log(`Application running on: http://localhost:${AppConfig.port}/${AppConfig.apiPrefix}`);
  console.log(`Swagger docs available at: http://localhost:${AppConfig.port}/${AppConfig.apiPrefix}/docs`);
}
bootstrap();
