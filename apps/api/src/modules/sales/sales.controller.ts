import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { CreateSaleDto } from "./sales.dto.js";
import { SalesService } from "./sales.service.js";

@Controller("sales")
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  list(@Query("shiftId") shiftId?: string) {
    return this.salesService.list(shiftId);
  }

  @Post()
  create(@Body() input: CreateSaleDto) {
    return this.salesService.create(input);
  }
}
