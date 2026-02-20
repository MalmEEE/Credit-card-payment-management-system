import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Patch, UseGuards } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { UpdateDepartmentLimitDto } from './dto/update-department-limit.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from 'src/auth/roles.decorater';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly deps: DepartmentsService) {}

  // Logged-in users can view departments (change to Admin-only if you want)
  @UseGuards(JwtAuthGuard)
  @Get()
  getAll() {
    return this.deps.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.deps.findOne(id);
  }

  // Admin writes
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateDepartmentDto) {
    return this.deps.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDepartmentDto) {
    return this.deps.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id/limit')
  updateLimit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentLimitDto,
  ) {
    return this.deps.updateLimit(id, dto.limitUsd);
  }
}