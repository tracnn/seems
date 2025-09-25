import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseDto } from '../../../common/base.dto';

export class GetMedicalRecordDetailDto extends BaseDto {
  @ApiProperty({
    description: 'ID hồ sơ KCB',
    example: '123',
    required: true,
  })
  @IsNotEmpty({ message: 'ID hồ sơ không được để trống' })
  @IsString({ message: 'ID hồ sơ phải là chuỗi' })
  id: string;
} 