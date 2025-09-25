import { Min, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { LIMIT_DEFAULT, PAGE_DEFAULT } from '../constants/common.constant';

export class BaseDto {   
    @ApiProperty({
        description: 'Page number',
        example: 1,
        required: false,
        default: PAGE_DEFAULT
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = PAGE_DEFAULT;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
        required: false,
        default: LIMIT_DEFAULT
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = LIMIT_DEFAULT;
} 