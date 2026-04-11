import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false // Required for Better Auth
  });
  const logger = new Logger("Bootstrap");

  // HTTP security headers
  app.use(helmet());

  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix("/api");

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  );

  // CORS configuration
  const rawOrigins = process.env.CORS_ORIGINS ?? "http://localhost:3000";
  // const origins = rawOrigins.split(",").map((o) => o.trim());
  app.enableCors({
    origin: rawOrigins, //origins.length === 1 ? origins[0] : origins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  });

  // Graceful shutdown support
  // app.enableShutdownHooks();

  const port = process.env.PORT ?? 3001;
  await app.listen(port, () => logger.log(`Application is running on: http://localhost:${port}`));
}

bootstrap();
