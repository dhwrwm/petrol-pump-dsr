import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import {
  getRequiredSession,
  type RequestHeaders,
} from "../../lib/auth-session.js";
import { type CreateStationSetupDto } from "./setup.dto.js";
import { SetupService } from "./setup.service.js";

@Controller("setup")
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Get("station")
  async getStationSetup(@Req() request: RequestHeaders) {
    const session = await getRequiredSession(request);

    return this.setupService.getStationSetup(session.user.id);
  }

  @Post("station")
  async createStationSetup(
    @Req() request: RequestHeaders,
    @Body() input: CreateStationSetupDto,
  ) {
    const session = await getRequiredSession(request);

    return this.setupService.createStationSetup(session.user.id, input);
  }
}
