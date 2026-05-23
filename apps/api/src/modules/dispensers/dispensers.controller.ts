import { Body, Controller, Delete, Get, Param, Post, Req } from "@nestjs/common";
import {
  getRequiredSession,
  type RequestHeaders,
} from "../../lib/auth-session.js";
import type { CreateDispenserDto } from "./dispensers.dto.js";
import { DispensersService } from "./dispensers.service.js";

@Controller("dispensers")
export class DispensersController {
  constructor(private readonly dispensersService: DispensersService) {}

  @Get()
  async list(@Req() request: RequestHeaders) {
    const session = await getRequiredSession(request);
    return this.dispensersService.list(session.user.id);
  }

  @Post()
  async create(
    @Req() request: RequestHeaders,
    @Body() body: CreateDispenserDto,
  ) {
    const session = await getRequiredSession(request);
    return this.dispensersService.create(session.user.id, body);
  }

  @Delete(":id")
  async delete(@Req() request: RequestHeaders, @Param("id") id: string) {
    const session = await getRequiredSession(request);
    return this.dispensersService.delete(session.user.id, id);
  }
}
