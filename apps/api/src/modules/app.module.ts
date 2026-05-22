import { Module } from "@nestjs/common";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from "../auth.js";
import { HealthModule } from "./health/health.module.js";
import { SalesModule } from "./sales/sales.module.js";
import { SetupModule } from "./setup/setup.module.js";

@Module({
  imports: [
    AuthModule.forRoot({
      auth,
      disableGlobalAuthGuard: true,
    }),
    HealthModule,
    SalesModule,
    SetupModule,
  ],
})
export class AppModule {}
