import { Body, Controller, Delete, Get, Param, Post, Req } from "@nestjs/common";
import {
  getRequiredSession,
  type RequestHeaders,
} from "../../lib/auth-session.js";
import type { AddNozzleDto, CreateDispenserDto } from "./dispensers.dto.js";
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

  @Post(":id/nozzles")
  async addNozzle(
    @Req() request: RequestHeaders,
    @Param("id") id: string,
    @Body() body: AddNozzleDto,
  ) {
    const session = await getRequiredSession(request);
    return this.dispensersService.addNozzle(session.user.id, id, body);
  }

  @Delete(":id/nozzles/:nozzleId")
  async deleteNozzle(
    @Req() request: RequestHeaders,
    @Param("id") id: string,
    @Param("nozzleId") nozzleId: string,
  ) {
    const session = await getRequiredSession(request);
    return this.dispensersService.deleteNozzle(session.user.id, id, nozzleId);
  }

  @Delete(":id")
  async delete(@Req() request: RequestHeaders, @Param("id") id: string) {
    const session = await getRequiredSession(request);
    return this.dispensersService.delete(session.user.id, id);
  }
}
