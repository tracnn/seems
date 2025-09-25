import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional, Matches, Length, IsDateString, IsNumber, IsIn } from 'class-validator';
import { BaseDto } from '../../common/base.dto';
import { Transform } from 'class-transformer';
import { ERROR_400 } from '@common/error-messages/error-400';

export class CreateUserDto extends BaseDto {
    @ApiProperty({
        description: 'Username',
        example: 'johndoe'
    })
    @IsString({ message: 'Username không hợp lệ' })
    @IsNotEmpty({ message: 'Username không được để trống' })
    @Matches(/^[a-zA-Z0-9_.]+$/, ERROR_400.USERNAME_NOT_VALID)
    username: string;

    @ApiProperty({
        description: 'Email address',
        example: 'john.doe@example.com'
    })
    @IsOptional()
    @Transform(({ value }) => value === '' ? undefined : value)
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;

    @ApiProperty({
        description: 'Password',
        example: 'password123'
    })
    @IsString({ message: 'Mật khẩu không hợp lệ' })
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    password: string;

    @ApiProperty({
        description: 'Insurance Number (10 digits)',
        example: '1234567890',
        required: false
    })
    @IsOptional()
    @Transform(({ value }) => value === '' ? undefined : value)
    @IsString({ message: 'Mã bảo hiểm xã hội không hợp lệ' })
    //@Length(10, 10, { message: 'Mã bảo hiểm xã hội phải có 10 chữ số' })
    //@Matches(/^\d+$/, { message: 'Mã bảo hiểm xã hội phải là số' })
    insuranceNumber?: string;

    @ApiProperty({
        description: 'Health Insurance Card Number',
        example: 'HC4011234567890',
        required: false
    })
    @IsOptional()
    @Transform(({ value }) => value === '' ? undefined : value)
    @IsString({ message: 'Mã thẻ bảo hiểm y tế không hợp lệ' })
    //@Length(15, 15, { message: 'Mã thẻ bảo hiểm y tế phải có 15 chữ số' })
    //@Matches(/^[A-Z]{2}\d{13}$/, { message: 'Mã thẻ bảo hiểm y tế phải là số' })
    heinCardNumber?: string;

    @ApiProperty({ example: 'Nguyễn Văn A', description: 'Full Name' })
    @IsString({ message: 'Tên không hợp lệ' })
    @IsNotEmpty({ message: 'Tên không được để trống' })
    @Length(2, 100, { message: 'Tên phải có ít nhất 2 ký tự và tối đa 100 ký tự' })
    fullName: string;

    @ApiProperty({ example: '001234567890', description: 'Identity Number' })
    @IsString({ message: 'Mã CCCD/CMND không hợp lệ' })
    @IsNotEmpty({ message: 'Mã CCCD/CMND không được để trống' })
    @Length(12, 12, { message: 'Mã CCCD/CMND phải có 12 chữ số' })
    @Matches(/^[0-9]+$/, { message: 'Mã CCCD/CMND phải là số' })
    identityNumber: string;

    @ApiProperty({ example: '0123456789', description: 'Phone Number' })
    @IsString({ message: 'Số điện thoại không hợp lệ' })
    @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
    @Length(10, 10, { message: 'Số điện thoại phải có 10 chữ số' })
    @Matches(/^[0-9]+$/, { message: 'Số điện thoại phải là số' })
    phoneNumber: string;

    @ApiProperty({ example: '21/01/1990', description: 'Birth Date' })
    @Matches(/^(([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4})$/, { message: 'Ngày sinh không hợp lệ' })
    @IsNotEmpty({ message: 'Ngày sinh không được để trống' })
    birthDate: string;

    @ApiProperty({ example: '1', description: 'Gender Code' })
    @IsNumber({}, { message: 'Giới tính không hợp lệ' })
    @IsNotEmpty({ message: 'Giới tính không được để trống' })
    @IsIn([1, 2, 3], { message: 'Giới tính phải là 1, 2 hoặc 3' })
    genderCode: number;

    @ApiProperty({ example: '1', description: 'Province ID' })
    @IsNumber({}, { message: 'ID tỉnh/thành phố không hợp lệ' })
    @IsNotEmpty({ message: 'ID tỉnh/thành phố không được để trống' })
    provinceId: number;

    @ApiProperty({ example: '1', description: 'District ID', required: false })
    @IsOptional()
    @IsNumber({}, { message: 'ID quận/huyện không hợp lệ' })
    @IsNotEmpty({ message: 'ID quận/huyện không được để trống' })
    districtId: number;

    @ApiProperty({ example: '1', description: 'Commune ID' })
    @IsNumber({}, { message: 'ID xã/phường không hợp lệ' })
    @IsNotEmpty({ message: 'ID xã/phường không được để trống' })
    communeId: number;   
    
    @ApiProperty({ example: 'Detail Address', description: 'Detail Address' })
    @IsString({ message: 'Địa chỉ chi tiết không hợp lệ' })
    @IsNotEmpty({ message: 'Địa chỉ chi tiết không được để trống' })
    address: string;

    @ApiProperty({ example: '1', description: 'Career ID' })
    @IsNumber({}, { message: 'ID nghề nghiệp không hợp lệ' })
    @IsNotEmpty({ message: 'ID nghề nghiệp không được để trống' })
    careerId: number;

    @ApiProperty({ example: '1', description: 'Ethnic ID' })
    @IsOptional()
    @IsNumber({}, { message: 'ID dân tộc không hợp lệ' })
    @IsNotEmpty({ message: 'ID dân tộc không được để trống' })
    ethnicId: number;

    @ApiProperty({ example: '1', description: 'National ID' })
    @IsOptional()
    @IsNumber({}, { message: 'ID quốc tịch không hợp lệ' })
    @IsNotEmpty({ message: 'ID quốc tịch không được để trống' })
    nationalId: number;
} 
