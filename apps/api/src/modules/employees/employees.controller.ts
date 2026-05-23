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
import type {
  AddDocumentDto,
  AddSalaryRecordDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from "./employees.dto.js";
import { EmployeesService } from "./employees.service.js";

@Controller("employees")
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async list(@Req() request: RequestHeaders) {
    const session = await getRequiredSession(request);
    return this.employeesService.list(session.user.id);
  }

  @Get(":id")
  async findOne(@Req() request: RequestHeaders, @Param("id") id: string) {
    const session = await getRequiredSession(request);
    return this.employeesService.findOne(session.user.id, id);
  }

  @Post()
  async create(
    @Req() request: RequestHeaders,
    @Body() body: CreateEmployeeDto,
  ) {
    const session = await getRequiredSession(request);
    return this.employeesService.create(session.user.id, body);
  }

  @Patch(":id")
  async update(
    @Req() request: RequestHeaders,
    @Param("id") id: string,
    @Body() body: UpdateEmployeeDto,
  ) {
    const session = await getRequiredSession(request);
    return this.employeesService.update(session.user.id, id, body);
  }

  @Delete(":id")
  async delete(@Req() request: RequestHeaders, @Param("id") id: string) {
    const session = await getRequiredSession(request);
    return this.employeesService.delete(session.user.id, id);
  }

  @Post(":id/documents")
  async addDocument(
    @Req() request: RequestHeaders,
    @Param("id") id: string,
    @Body() body: AddDocumentDto,
  ) {
    const session = await getRequiredSession(request);
    return this.employeesService.addDocument(session.user.id, id, body);
  }

  @Delete(":id/documents/:docId")
  async deleteDocument(
    @Req() request: RequestHeaders,
    @Param("id") id: string,
    @Param("docId") docId: string,
  ) {
    const session = await getRequiredSession(request);
    return this.employeesService.deleteDocument(session.user.id, id, docId);
  }

  @Get(":id/salary")
  async listSalary(@Req() request: RequestHeaders, @Param("id") id: string) {
    const session = await getRequiredSession(request);
    return this.employeesService.listSalaryRecords(session.user.id, id);
  }

  @Post(":id/salary")
  async addSalary(
    @Req() request: RequestHeaders,
    @Param("id") id: string,
    @Body() body: AddSalaryRecordDto,
  ) {
    const session = await getRequiredSession(request);
    return this.employeesService.addSalaryRecord(session.user.id, id, body);
  }
}
