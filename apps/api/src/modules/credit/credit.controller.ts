import { Controller, Get, Req } from "@nestjs/common";
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
}
