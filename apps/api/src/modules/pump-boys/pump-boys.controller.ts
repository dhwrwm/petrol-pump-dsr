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
import type { CreatePumpBoyDto, UpdatePumpBoyDto } from "./pump-boys.dto.js";
import { PumpBoysService } from "./pump-boys.service.js";

@Controller("pump-boys")
export class PumpBoysController {
  constructor(private readonly pumpBoysService: PumpBoysService) {}

  @Get()
  async list(@Req() request: RequestHeaders) {
    const session = await getRequiredSession(request);
    return this.pumpBoysService.list(session.user.id);
  }

  @Post()
  async create(
    @Req() request: RequestHeaders,
    @Body() body: CreatePumpBoyDto,
  ) {
    const session = await getRequiredSession(request);
    return this.pumpBoysService.create(session.user.id, body);
  }

  @Patch(":id")
  async update(
    @Req() request: RequestHeaders,
    @Param("id") id: string,
    @Body() body: UpdatePumpBoyDto,
  ) {
    const session = await getRequiredSession(request);
    return this.pumpBoysService.update(session.user.id, id, body);
  }

  @Delete(":id")
  async delete(@Req() request: RequestHeaders, @Param("id") id: string) {
    const session = await getRequiredSession(request);
    return this.pumpBoysService.delete(session.user.id, id);
  }
}
