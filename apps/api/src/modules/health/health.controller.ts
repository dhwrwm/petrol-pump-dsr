import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  check() {
    return {
      status: "ok",
      service: "petrol-pump-api",
      timestamp: new Date().toISOString()
    };
  }
}
