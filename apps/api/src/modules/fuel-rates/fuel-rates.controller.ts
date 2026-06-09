import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import {
  getRequiredSession,
  type RequestHeaders,
} from "../../lib/auth-session.js";
import type { SetTodayRatesDto } from "./fuel-rates.dto.js";
import { FuelRatesService } from "./fuel-rates.service.js";

@Controller("fuel-rates")
export class FuelRatesController {
  constructor(private readonly fuelRatesService: FuelRatesService) {}

  @Get("today")
  async getToday(@Req() request: RequestHeaders) {
    const session = await getRequiredSession(request);
    return this.fuelRatesService.getTodayRates(session.user.id);
  }

  @Post("today")
  async setToday(
    @Req() request: RequestHeaders,
    @Body() input: SetTodayRatesDto,
  ) {
    const session = await getRequiredSession(request);
    return this.fuelRatesService.setTodayRates(session.user.id, input);
  }
}
