import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * Base DTO cho pagination và query list
 * Sử dụng cho cả HTTP endpoints (@Query) và Microservice (@Payload)
 *
 * @example
 * // HTTP Controller
 * @Get()
 * async getList(@Query() query: PaginationQueryDto) {
 *   return this.service.getList(query);
 * }
 *
 * @example
 * // Microservice Controller
 * @MessagePattern('entity.list')
 * async getList(@Payload() query: PaginationQueryDto) {
 *   return this.service.getList(query);
 * }
 */
export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Search query',
    minLength: 1,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  search?: string;

  @ApiPropertyOptional({
    description: 'Field to sort by',
  })
  @IsOptional()
  @IsString()
  sortField?: string;

  @ApiPropertyOptional({
    description: 'Sort order (ASC = ascending, DESC = descending)',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    description: 'Filter by active status (true = active, false = inactive)',
  })
  @IsOptional()
  @Transform(({ value, obj }) => {
    const rawValue = obj.isActive;
    if (rawValue === undefined || rawValue === null || rawValue === '') {
      return undefined;
    }

    if (typeof rawValue === 'boolean') {
      return rawValue;
    }

    if (typeof rawValue === 'string') {
      const lowerValue = rawValue.toLowerCase().trim();
      if (lowerValue === 'true' || lowerValue === '1') {
        return true;
      }
      if (lowerValue === 'false' || lowerValue === '0') {
        return false;
      }
    }

    if (typeof rawValue === 'number') {
      return rawValue === 1;
    }

    return undefined;
  })
  isActive?: boolean;
}
