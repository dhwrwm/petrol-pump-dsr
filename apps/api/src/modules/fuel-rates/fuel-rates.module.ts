import { Module } from "@nestjs/common";
import { FuelRatesController } from "./fuel-rates.controller.js";
import { FuelRatesService } from "./fuel-rates.service.js";

@Module({
  controllers: [FuelRatesController],
  providers: [FuelRatesService],
})
export class FuelRatesModule {}
