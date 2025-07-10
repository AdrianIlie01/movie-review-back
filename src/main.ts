import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as process from 'process';
import * as dotenv from 'dotenv';
dotenv.config();

const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      process.env.ORIGIN,
      process.env.ORIGIN_RENDER,
      process.env.ORIGIN_REACT,
      'https://movie-review-front-jet.vercel.app',
      'https://movie-review-front-jet.vercel.app/home',
      'https://react-learn-flax.vercel.app',
      'https://angular-refresh.vercel.app',

      'https://react-learn-3fn37hc78-adrianilie01s-projects.vercel.app',
      'http://localhost:4200',
      'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

    exposedHeaders: ['set-cookie'],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
