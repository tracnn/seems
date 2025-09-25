import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateRoleDto {
    @ApiProperty({
        description: 'The display name of the role',
        example: 'Admin',
    })
    @IsOptional()
    @IsString()
    displayName?: string;
  
    @IsOptional()
    @IsString()
    description?: string;
  
    @IsOptional()
    @IsNumber()
    isActive?: number;
  }