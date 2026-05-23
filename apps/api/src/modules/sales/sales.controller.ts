import { Body, Controller, Get, Post, Query, Req } from "@nestjs/common";
import {
  getRequiredSession,
  type RequestHeaders,
} from "../../lib/auth-session.js";
import { CreateSaleDto } from "./sales.dto.js";
import { SalesService } from "./sales.service.js";

@Controller("sales")
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

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
    await getRequiredSession(request);

    return this.salesService.create(input);
  }
}
