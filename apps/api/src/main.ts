import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module.js";
import { getAppConfig } from "@petrol/config";

async function bootstrap() {
  const config = getAppConfig();
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.enableCors({
    origin: config.webUrl,
    credentials: true,
  });
  app.setGlobalPrefix("api");

  await app.listen(config.port);
}

void bootstrap();
