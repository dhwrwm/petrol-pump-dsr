import { Body, Controller, Get, Param, Patch, Req } from "@nestjs/common";
import {
  getRequiredSession,
  type RequestHeaders,
} from "../../lib/auth-session.js";
import { TanksService } from "./tanks.service.js";

@Controller("tanks")
export class TanksController {
  constructor(private readonly tanksService: TanksService) {}

  @Get()
  async list(@Req() request: RequestHeaders) {
    const session = await getRequiredSession(request);

    return this.tanksService.list(session.user.id);
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
