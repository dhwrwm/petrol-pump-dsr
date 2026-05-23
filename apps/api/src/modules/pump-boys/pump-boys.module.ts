import { Module } from "@nestjs/common";
import { PumpBoysController } from "./pump-boys.controller.js";
import { PumpBoysService } from "./pump-boys.service.js";

@Module({
  controllers: [PumpBoysController],
  providers: [PumpBoysService],
})
export class PumpBoysModule {}
