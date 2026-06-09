import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import {
  getRequiredSession,
  type RequestHeaders,
} from "../../lib/auth-session.js";
import { CreateSaleDto, UpdateSaleDto } from "./sales.dto.js";
import { SalesService } from "./sales.service.js";

@Controller("sales")
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get("summary")
  async summary(
    @Req() request: RequestHeaders,
    @Query("period") period?: string,
  ) {
    const session = await getRequiredSession(request);
    const validPeriod = period === "month" ? "month" : "week";

    return this.salesService.summary(session.user.id, validPeriod);
  }

  @Get("current-shift")
  async currentShift(@Req() request: RequestHeaders) {
    const session = await getRequiredSession(request);
    return this.salesService.getCurrentShift(session.user.id);
  }

  @Get("nozzle-meter")
  async nozzleMeter(
    @Req() request: RequestHeaders,
    @Query("nozzleId") nozzleId: string,
  ) {
    await getRequiredSession(request);

    return this.salesService.getLastMeterReading(nozzleId);
  }

  @Get()
  async list(
    @Req() request: RequestHeaders,
    @Query("shiftId") shiftId?: string,
  ) {
    const session = await getRequiredSession(request);

    return this.salesService.list(session.user.id, shiftId);
  }

  @Post()
  async create(@Req() request: RequestHeaders, @Body() input: CreateSaleDto) {
    const session = await getRequiredSession(request);

    return this.salesService.create(session.user.id, input);
  }

  @Patch(":id")
  async update(
    @Req() request: RequestHeaders,
    @Param("id") id: string,
    @Body() input: UpdateSaleDto,
  ) {
    const session = await getRequiredSession(request);

    return this.salesService.update(id, session.user.id, input);
  }
}
