import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig } from './config/app.config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, 
  });
  
  app.setGlobalPrefix(AppConfig.apiPrefix);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    forbidNonWhitelisted: true, 
    transform: true, 
  }));
  
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API documentation for the project')
    .setVersion('1.0')
    .addBearerAuth() 
    .build();
  
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${AppConfig.apiPrefix}/docs`, app, documentFactory);

  await app.listen(AppConfig.port);
  console.log(`Application running on: http://localhost:${AppConfig.port}/${AppConfig.apiPrefix}`);
  console.log(`Swagger docs available at: http://localhost:${AppConfig.port}/${AppConfig.apiPrefix}/docs`);
}
bootstrap();
