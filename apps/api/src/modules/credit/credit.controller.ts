import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import {
  getRequiredSession,
  type RequestHeaders,
} from "../../lib/auth-session.js";
import { CreditService } from "./credit.service.js";

@Controller("credit")
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Get()
  async list(@Req() request: RequestHeaders) {
    const session = await getRequiredSession(request);
    return this.creditService.list(session.user.id);
  }

  @Post()
  async create(
    @Req() request: RequestHeaders,
    @Body() body: { name: string; phone?: string; vehicleNo?: string; creditLimit?: string },
  ) {
    const session = await getRequiredSession(request);
    return this.creditService.create(session.user.id, body);
  }
}
