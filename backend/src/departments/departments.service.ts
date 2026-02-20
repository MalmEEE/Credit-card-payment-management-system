import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly repo: Repository<Department>,
  ) {}

  findAll() {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const dep = await this.repo.findOne({ where: { id } });
    if (!dep) throw new NotFoundException('Department not found');
    return dep;
  }

  async create(dto: CreateDepartmentDto) {
    const code = dto.code.trim().toUpperCase();

    const exists = await this.repo.findOne({ where: { code } });
    if (exists) throw new BadRequestException('Department code already exists');

    const dep = this.repo.create({
      name: dto.name.trim(),
      code,
      limitUsd: String(dto.limitUsd ?? 0),
    });

    return this.repo.save(dep);
  }

  async update(id: number, dto: UpdateDepartmentDto) {
    const dep = await this.findOne(id);

    if (dto.name !== undefined) dep.name = dto.name.trim();
    if (dto.code !== undefined) dep.code = dto.code.trim().toUpperCase();

    return this.repo.save(dep);
  }

  async updateLimit(id: number, limitUsd: number) {
    const dep = await this.findOne(id);
    dep.limitUsd = String(limitUsd);
    return this.repo.save(dep);
  }
}