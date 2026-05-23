import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from "@nestjs/common";
import {
  getRequiredSession,
  type RequestHeaders,
} from "../../lib/auth-session.js";
import type { AddDispenserToTankDto, CreateTankDto } from "./tanks.dto.js";
import { TanksService } from "./tanks.service.js";

@Controller("tanks")
export class TanksController {
  constructor(private readonly tanksService: TanksService) {}

  @Get()
  async list(@Req() request: RequestHeaders) {
    const session = await getRequiredSession(request);
    return this.tanksService.list(session.user.id);
  }

  @Post()
  async create(
    @Req() request: RequestHeaders,
    @Body() body: CreateTankDto,
  ) {
    const session = await getRequiredSession(request);
    return this.tanksService.create(session.user.id, body);
  }

  @Delete(":id")
  async delete(@Req() request: RequestHeaders, @Param("id") id: string) {
    const session = await getRequiredSession(request);
    return this.tanksService.delete(session.user.id, id);
  }

  @Post(":id/dispensers")
  async addDispenser(
    @Req() request: RequestHeaders,
    @Param("id") id: string,
    @Body() body: AddDispenserToTankDto,
  ) {
    const session = await getRequiredSession(request);
    return this.tanksService.addDispenser(session.user.id, id, body);
  }

  @Patch(":id/dip")
  async updateDip(
    @Req() request: RequestHeaders,
    @Param("id") id: string,
    @Body() body: { currentDip: string },
  ) {
    const session = await getRequiredSession(request);
    return this.tanksService.updateDip(session.user.id, id, body.currentDip);
  }
}
