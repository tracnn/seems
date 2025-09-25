import { IsNotEmpty, IsString } from 'class-validator';
import { BaseDto } from '../../common/base.dto';

export class GetUserDto extends BaseDto { 
    @IsString({ message: 'ID không hợp lệ' })
    @IsNotEmpty({ message: 'ID không được để trống' })
    id: string;
} 