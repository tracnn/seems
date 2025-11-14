import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for activating user account
 * Sử dụng ở: API Gateway và Auth Service
 */
export class ActivateAccountDto {
  @ApiProperty({
    description: 'ID của user cần kích hoạt',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'userId phải là UUID hợp lệ' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    description: 'ID của admin thực hiện hành động',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'activatedBy phải là UUID hợp lệ' })
  @IsString()
  activatedBy?: string;
}

