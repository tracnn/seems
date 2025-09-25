import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdatePermissionDto {
    @ApiProperty({
        description: 'The display name of the permission',
        example: 'Create User',
    })
    @IsOptional()
    @IsString()
    displayName?: string;
  
    @ApiProperty({
        description: 'The description of the permission',
        example: 'Create a new user',
    })
    @IsOptional()
    @IsString()
    description?: string;
  
    @ApiProperty({
        description: 'The status of the permission',
        example: 1,
    })
    @IsOptional()
    @IsNumber()
    isActive?: number;
  }