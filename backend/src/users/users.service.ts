import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { Department } from '../departments/department.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Department) private readonly deptRepo: Repository<Department>,
  ) {}

  async findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email }, relations: { department: true } });
  }

  async findAll() {
    return this.usersRepo.find({ relations: { department: true }, order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const user = await this.usersRepo.findOne({ where: { id }, relations: { department: true } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto) {
    // rule: OFFICER must have department
    if (dto.role === 'OFFICER' && !dto.departmentId) {
      throw new BadRequestException('OFFICER must have a departmentId');
    }

    // rule: ADMIN can be without dept
    const department =
      dto.departmentId ? await this.deptRepo.findOne({ where: { id: dto.departmentId } }) : null;

    if (dto.departmentId && !department) throw new BadRequestException('Department not found');

    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepo.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role,
      department: department ?? null,
      isActive: true,
    });

    return this.usersRepo.save(user);
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (dto.role === 'OFFICER' && dto.departmentId === null) {
      throw new BadRequestException('OFFICER must have a department');
    }

    if (dto.departmentId !== undefined) {
      if (dto.departmentId === null) user.department = null;
      else {
        const dept = await this.deptRepo.findOne({ where: { id: dto.departmentId } });
        if (!dept) throw new BadRequestException('Department not found');
        user.department = dept;
      }
    }

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;

    return this.usersRepo.save(user);
  }

  async resetPassword(id: number, newPassword: string) {
    const user = await this.findOne(id);
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    return this.usersRepo.save(user);
  }
}