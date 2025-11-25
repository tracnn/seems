import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionsDto {
  @ApiProperty({
    example: ['uuid-permission-1', 'uuid-permission-2'],
    description: 'Array of permission IDs to assign',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}
