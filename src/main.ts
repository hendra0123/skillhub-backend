import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // buang field yang tidak ada di DTO
      forbidNonWhitelisted: true, // tolak kalau ada field asing
      transform: true,            // auto-cast string ke number di Param, dll
    }),
  );

  await app.listen(3000);
}
bootstrap();
