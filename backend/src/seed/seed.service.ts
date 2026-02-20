import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    const adminEmail = this.config.get<string>('ADMIN_EMAIL');
    const adminPassword = this.config.get<string>('ADMIN_PASSWORD');
    const adminName = this.config.get<string>('ADMIN_NAME') || 'Admin';

    if (!adminEmail || !adminPassword) {
      this.logger.warn('ADMIN_EMAIL / ADMIN_PASSWORD not set. Skipping admin seed.');
      return;
    }

    // Check if any ADMIN exists
    const existingAdmin = await this.usersRepo.findOne({
      where: { role: 'ADMIN' as any },
    });

    if (existingAdmin) {
      this.logger.log('Admin already exists. Seed skipped.');
      return;
    }

    // Create admin
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const admin = this.usersRepo.create({
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
      department: null,
      isActive: true,
    });

    await this.usersRepo.save(admin);
    this.logger.log(`✅ Seeded first ADMIN user: ${adminEmail}`);
  }
}