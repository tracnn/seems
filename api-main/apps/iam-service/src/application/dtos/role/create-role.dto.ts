import { IsString, MinLength, MaxLength, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'Administrator', description: 'Role name' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'ADMIN', description: 'Role code (uppercase)' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Administrator role with full access', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 50, required: false, description: 'Role hierarchy level' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  level?: number;
}

