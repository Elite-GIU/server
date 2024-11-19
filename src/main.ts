import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig } from './config/app.config';
import { ConfigService } from '@nestjs/config';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(AppConfig.apiPrefix);

  await app.listen(AppConfig.port);
  console.log(`Application running on: http://localhost:${AppConfig.port}/${AppConfig.apiPrefix}`);

}
bootstrap();
