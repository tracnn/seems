import { IsArray, IsUUID, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRolesDto {
  @ApiProperty({ 
    example: ['uuid-role-1', 'uuid-role-2'],
    description: 'Array of role IDs to assign'
  })
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds: string[];

  @ApiProperty({ 
    example: '2025-12-31T23:59:59Z',
    required: false,
    description: 'Expiration date for role assignment'
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

