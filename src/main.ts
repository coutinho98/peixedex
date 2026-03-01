import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // Strips out any properties that do not have any decorators
    forbidNonWhitelisted: true, // Throws an error if non-whitelisted properties are present
    transform: true,        // Automatically transforms payloads to be objects typed according to their DTO classes
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
