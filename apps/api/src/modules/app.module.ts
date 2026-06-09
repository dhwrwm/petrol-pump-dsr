import { Module } from "@nestjs/common";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from "../auth.js";
import { CreditModule } from "./credit/credit.module.js";
import { DispensersModule } from "./dispensers/dispensers.module.js";
import { FuelRatesModule } from "./fuel-rates/fuel-rates.module.js";
import { HealthModule } from "./health/health.module.js";
import { EmployeesModule } from "./employees/employees.module.js";
import { SalesModule } from "./sales/sales.module.js";
import { SetupModule } from "./setup/setup.module.js";
import { TanksModule } from "./tanks/tanks.module.js";

@Module({
  imports: [
    AuthModule.forRoot({
      auth,
      disableGlobalAuthGuard: true,
    }),
    CreditModule,
    DispensersModule,
    FuelRatesModule,
    HealthModule,
    EmployeesModule,
    SalesModule,
    SetupModule,
    TanksModule,
  ],
})
export class AppModule {}
