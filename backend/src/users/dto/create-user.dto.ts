import { IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateUserDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString() @IsNotEmpty()
  password: string;

  @IsIn(['ADMIN','OFFICER','VIEWER'])
  role: 'ADMIN' | 'OFFICER' | 'VIEWER';

  @IsOptional()
  @IsInt() @Min(1)
  departmentId?: number;
}