import { IsEmail, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateUserDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsIn(['ADMIN','OFFICER','VIEWER'])
  role?: 'ADMIN' | 'OFFICER' | 'VIEWER';

  @IsOptional()
  @IsInt() @Min(1)
  departmentId?: number | null;

  @IsOptional()
  isActive?: boolean;
}