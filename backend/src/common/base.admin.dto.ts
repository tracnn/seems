import { ApiProperty } from "@nestjs/swagger";
import { BaseDto } from "./base.dto";

export class BaseAdminDto extends BaseDto {
    @ApiProperty({
        description: 'Search query',
        required: false,
    })
    search?: string;

    @ApiProperty({
        description: 'Sort field',
        required: false,
    })
    sortField?: string;

    @ApiProperty({
        description: 'Sort order',
        required: false,
    })
    sortOrder?: string;
}   