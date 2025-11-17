import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'Create User', description: 'Permission name' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'user:create', description: 'Permission code (resource:action)' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  code: string;

  @ApiProperty({ example: 'user', description: 'Resource type' })
  @IsString()
  resource: string;

  @ApiProperty({ example: 'create', description: 'Action type' })
  @IsString()
  action: string;

  @ApiProperty({ example: 'Permission to create new users', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

