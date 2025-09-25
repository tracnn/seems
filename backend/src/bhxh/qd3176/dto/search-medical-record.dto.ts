import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseDto } from '../../../common/base.dto';

export class SearchMedicalRecordDto extends BaseDto {
  @ApiProperty({
    description: 'Từ khóa tìm kiếm (CCCD hoặc mã BHYT)',
    example: '123456789012',
    required: true,
  })
  @IsNotEmpty({ message: 'Từ khóa tìm kiếm không được để trống' })
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi' })
  keyword: string;
} 