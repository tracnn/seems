import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class AssignRolesDto {
  @ApiProperty({ 
    example: ['uuid-role-1', 'uuid-role-2'], 
    description: 'Array of role IDs to assign',
    type: [String],
  })
  @IsArray()
  @IsNotEmpty()
  @IsUUID('4', { each: true })
  roleIds: string[];

  @ApiPropertyOptional({ 
    example: '2025-12-31T23:59:59Z', 
    description: 'Expiration date for role assignment (ISO 8601)',
  })
  @IsOptional()
  @IsString()
  expiresAt?: string;
}

